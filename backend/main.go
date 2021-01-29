package main

import (
	"bufio"
	"os"
	"strconv"
	"time"

	"github.com/fatih/color"
	"github.com/manifoldco/promptui"

	"prosperaio/config"
	"prosperaio/discord"
	"prosperaio/utils/client"
	"prosperaio/utils/log"
)

const version = "4.0.3 (ALPHA)"

var scanner = bufio.NewScanner(os.Stdin)
var proxies = []string{}
var monitorDelay time.Duration
var retryDelay time.Duration

var printBold = color.New(color.Bold, color.FgWhite).PrintlnFunc()
var print = color.New(color.FgWhite).PrintlnFunc()
var profiles map[string]config.Profile

func init() {
	const expiryDate = "28 Feb 2021 10:55 GMT"
	expTime, _ := time.Parse("02 Jan 2006 15:04 MST", expiryDate)
	if time.Until(expTime) < 0*time.Millisecond {
		color.Red("Expired.")
		os.Exit(0)
	}

	promptui.IconInitial = ""
	monitorDelay, retryDelay = config.LoadDelays()

	color.Cyan(logo())
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
		selection, last := mainMenu()
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

func getProxy() string {
	proxy := ""
	if len(proxies) == 0 {
		return proxy
	}

	proxy = proxies[0]
	proxies = client.RotateProxy(proxies)

	return proxy
}
