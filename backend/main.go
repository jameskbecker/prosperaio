package main

import (
	"bufio"
	"os"
	"path"
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

const version = "4.0.3 (ALPHA)"

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
	counters := log.TitleCounts{}
	log.UpdateTitle(version, &counters)
	for {
		selection, last := cli.MainMenu()
		switch selection {
		case 0:
			loadTasksHandler()
			break
		case 1:
			loadProxiesHandler(&counters)
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

	case last:
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
			Proxy:         getProxy(),
			PaymentMethod: t.PaymentMethod,
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

func loadProxiesHandler(counters *log.TitleCounts) {
	color.Cyan(cli.Line())
	for {
		homedir, _ := os.UserHomeDir()
		proxyFolder := path.Join(homedir, "ProsperAIO", "proxies")
		proxyPaths := config.GetDirPaths(proxyFolder, ".txt")

		i := cli.GetUserInput("Select Proxy File", proxyPaths)
		sPath := path.Join(proxyFolder, proxyPaths[i])
		bData, _ := config.LoadTXT(sPath)
		data := strings.FieldsFunc(string(bData), func(r rune) bool {
			return string(r) == "\n" || string(r) == "\r"
		})

		counters.Proxy = len(data)
		log.UpdateTitle(version, counters)

		color.Cyan(cli.Line())
		skipTest := cli.GetUserInput("Test Proxies?", []string{"Yes", "No"})
		if skipTest == 0 {
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

		break
	}
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
