package main

import (
	"bufio"
	"os"
	"prosperaio/captcha"
	"prosperaio/config"
	"prosperaio/discord"
	"prosperaio/sites/meshdesktop"
	"prosperaio/utils"
	"prosperaio/utils/cli"
	"prosperaio/utils/client"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/fatih/color"
)

var scanner = bufio.NewScanner(os.Stdin)
var proxies = []string{}
var counts = cli.TitleCounts{}
var profiles map[string]config.Profile

var printBold = color.New(color.Bold, color.FgWhite).PrintlnFunc()
var print = color.New(color.FgWhite).PrintlnFunc()

func init() {
	const expiryDate = "28 Feb 2021 10:55 GMT"
	expTime, _ := time.Parse("02 Jan 2006 15:04 MST", expiryDate)
	if time.Until(expTime) < 0*time.Millisecond {
		color.Red("Expired.")
		os.Exit(0)
	}

	os.Setenv("version", "4.0.0 (CLI)")
	cli.UpdateTitle(counts)

	color.Cyan(cli.Logo())
	printBold("Welcome to ProsperAIO!")

	profiles = config.LoadProfiles()
	print("Loaded Profiles.")
}

func main() {
	go discord.SetPresence()

	for {
		selection := cli.MainMenu()
		switch selection {
		case "Run Tasks":
			loadTasksHandler()
			continue
		case "Load Proxies":
			loadProxiesHandler()
			continue
		case "Test Webhook":
			testWebhookHandler()
			continue
		case "Manual Captcha Harvester":
			captcha.Launch()
			continue
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
	for {
		tasks := config.LoadTasks()
		if len(tasks) == 0 {
			return
		}
		color.Cyan(cli.Line())
		taskCounts := config.GetTaskCount(tasks)
		selection := cli.TaskMenu(taskCounts)
		switch {
		case strings.HasPrefix(selection, "Run All Tasks"):
			color.Cyan(cli.Line())
			printBold("Task Log")
			startTaskHandler(tasks)
			break

		case selection == "Back":
			continue
		case selection == "Exit":
			os.Exit(0)
			return
		}
	}

}

func wait(wg *sync.WaitGroup, ipc chan utils.IPCMessage) {
	wg.Wait()
	close(ipc)
}

func startTaskHandler(tasks []config.Task) {
	settings, err := config.LoadSettings()
	if err != nil {
		color.Red("Error loading settings: " + err.Error())
		return
	}

	var runningTasks = sync.WaitGroup{}
	ipc := make(chan utils.IPCMessage)
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
			Site:          t.Site,
			Region:        t.Region,
			Size:          t.Size,
			PaymentMethod: t.PaymentMethod,
			Profile:       profile,
			Proxy:         getProxy(),
			Settings:      &settings,
		}

		switch strings.ToUpper(site) {
		case "JD_FE", "FP_FE":
			go meshdesktop.Run(input, ipc)
			break
		case "WEARESTRAP":
			//go wearestrap.Run(input)
			break

		default:
			color.Red("Invalid Site: '" + site + "'")
		}
	}

	go wait(&runningTasks, ipc)
	for msg := range ipc {
		switch msg.Channel {
		case "incrementCart":
			counts.Cart++
		case "incrementCheckout":
			counts.Checkout++
		}
		cli.UpdateTitle(counts)
	}

}

func loadProxiesHandler() {
	color.Cyan(cli.Line())
	data := config.LoadProxies()
	if len(data) == 0 {
		return
	}

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
	ipc := make(chan utils.IPCMessage)
	for _, v := range data {
		proxyWG.Add(1)
		proxies = append(proxies, v)
		go client.TestProxy(v, &proxyWG, ipc)
	}
	go wait(&proxyWG, ipc)
	for range ipc {
		counts.Proxy++
		cli.UpdateTitle(counts)
	}
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

	switch selection {
	case "Set Webhook URL":
		scanner.Scan()
		settings.WebhookURL = scanner.Text()
		break

	case "Set Monitor Delay":
		scanner.Scan()
		delay, err := strconv.Atoi(scanner.Text())
		if err != nil {
			return
		}
		settings.MonitorDelay = delay
		break

	case "Set Retry Delay":
		scanner.Scan()
		delay, err := strconv.Atoi(scanner.Text())
		if err != nil {
			return
		}
		settings.RetryDelay = delay
	case "Set 2Captcha API Key":
		scanner.Scan()
		settings.TwoCapKey = scanner.Text()
		break

	case "Back":
		return
	case "Exit":
		os.Exit(0)
		return
	}

	err = config.ModifySettings(settings)
	if err != nil {
		color.Red(err.Error())
	}
}
