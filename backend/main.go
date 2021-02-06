package main

import (
	"bufio"
	"os"
	"prosperaio/captcha"
	"prosperaio/config"
	"prosperaio/discord"
	"prosperaio/sites/meshdesktop"
	"prosperaio/utils/cli"
	"prosperaio/utils/client"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/fatih/color"
	"github.com/manifoldco/promptui"
)

var scanner = bufio.NewScanner(os.Stdin)
var proxies = []string{}

var printBold = color.New(color.Bold, color.FgWhite).PrintlnFunc()
var print = color.New(color.FgWhite).PrintlnFunc()
var profiles map[string]config.Profile
var runningTasks = sync.WaitGroup{}

func init() {
	const expiryDate = "28 Feb 2021 10:55 GMT"
	expTime, _ := time.Parse("02 Jan 2006 15:04 MST", expiryDate)
	if time.Until(expTime) < 0*time.Millisecond {
		color.Red("Expired.")
		os.Exit(0)
	}

	os.Setenv("version", "4.0.3 (ALPHA)")
	os.Setenv("proxyCount", "0")
	os.Setenv("cartCount", "0")
	os.Setenv("checkoutCount", "0")
	promptui.IconInitial = ""

	color.Cyan(cli.Logo())
	printBold("Welcome to ProsperAIO!")
	print("Expires: " + expiryDate)

	profiles = config.LoadProfiles()
	print("Loaded Profiles.")
}

func main() {
	go discord.SetPresence()
	cli.UpdateTitle()
	for {
		selection := cli.MainMenu()
		switch selection {
		case "Run Tasks":
			loadTasksHandler()
			break
		case "Load Proxies":
			loadProxiesHandler()
			continue
		case "Test Webhook":
			testWebhookHandler()
			continue
		case "Manual Captcha Harvester":
			captcha.Launch()
		case "Settings":
			settingsHandler()
			continue
		case "Exit":
			os.Exit(0)
			break
		default:
			color.Red("Invalid Selection: " + selection)
			continue
		}
		break
	}
	defer captcha.RemoveAllRecords()
}

func loadTasksHandler() {
	tasks := config.LoadTasks()
	color.Cyan(cli.Line())
	taskCounts := config.GetTaskCount(tasks)
	selection := cli.TaskMenu(taskCounts)

	color.Cyan(cli.Line())
	printBold("Task Log")

	if strings.HasPrefix(selection, "Run All Tasks") {
		startTaskHandler(tasks)
	} else if selection == "Exit" {
		os.Exit(0)
		return
	}

	runningTasks.Wait()
}

func startTaskHandler(tasks []config.Task) {
	settings, err := config.LoadSettings()
	if err != nil {
		color.Red("Error loading settings: " + err.Error())
		return
	}

	for i, t := range tasks {
		site := t.Site
		if t.Mode != "" {
			site += "_" + t.Mode
		}

		profile, ok := profiles[t.ProfileName]
		if !ok {
			color.Red("Invalid Profile: '" + t.ProfileName + "'")
			continue
		}

		taskID := i + 1
		runningTasks.Add(1)
		input := config.TaskInput{
			ID:            taskID,
			WG:            &runningTasks,
			MonitorInput:  t.MonitorInput,
			Region:        t.Region,
			Size:          t.Size,
			PaymentMethod: t.PaymentMethod,
			Profile:       profile,
			Proxy:         getProxy(),
			MonitorDelay:  time.Duration(int64(settings.MonitorDelay)) * time.Millisecond,
			RetryDelay:    time.Duration(int64(settings.MonitorDelay)) * time.Millisecond,
			WebhookURL:    settings.WebhookURL,
		}

		switch strings.ToUpper(site) {
		case "JD_FE", "FP_FE":
			go meshdesktop.Run(input)
			break
		case "WEARESTRAP":
			//go wearestrap.Run(input)
			break

		default:
			color.Red("Invalid Site: '" + site + "'")
		}
	}
}

func loadProxiesHandler() {
	color.Cyan(cli.Line())
	data := config.LoadProxies()
	os.Setenv("proxyCount", strconv.Itoa(len(data)))
	cli.UpdateTitle()

	color.Cyan(cli.Line())
	skipTest := cli.GetUserInput("Test Proxies?", []string{"Yes", "No"})
	if skipTest == 0 {
		testProxyHandler(data)
	}

}

func testProxyHandler(data []string) {
	color.Cyan(cli.Line())
	printBold("Proxy Tester")

	proxyWG := sync.WaitGroup{}
	for _, v := range data {
		proxyWG.Add(1)
		proxies = append(proxies, v)
		go client.TestProxy(v, &proxyWG)
	}
	proxyWG.Wait()
}

func testWebhookHandler() {
	settings, err := config.LoadSettings()
	if err != nil {
		color.Red("Error loading settings: " + err.Error())
		return
	}
	discord.TestWebhook(settings.WebhookURL)
}

func getProxy() (proxy string) {
	if len(proxies) < 1 {
		return
	}
	proxy = proxies[0]
	proxies = client.RotateProxy(proxies)
	return
}

func settingsHandler() {
	settings, err := config.LoadSettings()
	if err != nil {
		color.Red("Error loading settings: " + err.Error())
		return
	}

	selection := cli.SettingsMenu()
	scanner.Scan()

	switch selection {
	case "Set Webhook URL":
		settings.WebhookURL = scanner.Text()
		break

	case "Set Monitor Delay":
		delay, err := strconv.Atoi(scanner.Text())
		if err != nil {
			return
		}
		settings.MonitorDelay = delay
		break

	case "Set Retry Delay":
		delay, err := strconv.Atoi(scanner.Text())
		if err != nil {
			return
		}
		settings.RetryDelay = delay
	case "Set 2Captcha API Key":
		settings.TwoCapKey = scanner.Text()
		break

	case "Exit":
		os.Exit(0)
		break
	}
	err = config.ModifySettings(settings)
	if err != nil {
		color.Red(err.Error())
	}
}
