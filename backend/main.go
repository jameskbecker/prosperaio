package main

import (
	"bufio"
	"os"
	"prosperaio/config"
	"prosperaio/discord"
	"prosperaio/sites/meshdesktop"
	"prosperaio/sites/wearestrap"
	"prosperaio/utils/cli"
	"prosperaio/utils/client"
	"prosperaio/utils/log"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/fatih/color"
	"github.com/manifoldco/promptui"
)

var scanner = bufio.NewScanner(os.Stdin)
var proxies = []string{}
var monitorDelay time.Duration
var retryDelay time.Duration

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
	monitorDelay, retryDelay = config.LoadDelays()

	color.Cyan(cli.Logo())
	printBold("Welcome to ProsperAIO!")
	print("Expires: " + expiryDate)
	print("Monitor Delay: " + monitorDelay.String())
	print("Retry Delay: " + retryDelay.String())

	profiles = config.LoadProfiles()
	print("Loaded Profiles.")
}

func main() {
	go discord.SetPresence()
	log.UpdateTitle()
	for {
		selection, last := cli.MainMenu()
		switch selection {
		case 0:
			loadTasksHandler()
			break
		case 1:
			loadProxiesHandler()
			continue
		case 2:
			testWebhookHandler()
			continue
		case last:
			os.Exit(0)
			break
		default:
			color.Red("Invalid Selection: " + strconv.Itoa(selection))
			continue
		}
		break
	}
}

func loadTasksHandler() {
	tasks := config.LoadTasks()
	color.Cyan(cli.Line())
	taskCounts := config.GetTaskCount(tasks)
	selection, last := cli.TaskMenu(taskCounts)

	color.Cyan(cli.Line())
	printBold("Task Log")
	switch selection {
	case 0: //All
		startTaskHandler(tasks)
		break

	case last: //Exit
		os.Exit(0)
		break

	}

	runningTasks.Wait()
}

func startTaskHandler(tasks []config.Task) {
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
			MonitorInput:  t.MonitorInput,
			Region:        t.Region,
			Size:          t.Size,
			PaymentMethod: t.PaymentMethod,
			Proxy:         getProxy(),
			WebhookURL:    config.GetWebhookURL(),
			Profile:       profile,
			MonitorDelay:  monitorDelay,
			RetryDelay:    retryDelay,
			WG:            &runningTasks,
		}

		switch strings.ToUpper(site) {
		case "JD_FE":
			go meshdesktop.Run(input)
			break
		case "WEARESTRAP":
			go wearestrap.Run(input)
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
	log.UpdateTitle()

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
	webhookURL := config.GetWebhookURL()
	discord.TestWebhook(webhookURL)
}

func getProxy() (proxy string) {
	if len(proxies) < 1 {
		return
	}
	proxy = proxies[0]
	proxies = client.RotateProxy(proxies)
	return
}
