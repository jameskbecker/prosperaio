package main

import (
	"bufio"
	"fmt"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/fatih/color"
	"github.com/manifoldco/promptui"

	"prosperaio/client"
	"prosperaio/config"
	"prosperaio/discord"
	"prosperaio/log"
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

	m, r := loadDelays()
	monitorDelay = time.Duration(m) * time.Millisecond
	retryDelay = time.Duration(r) * time.Millisecond

	color.Cyan(logo())
	printBold("Welcome to ProsperAIO!")
	print("Expires: " + expiryDate)
	print("Monitor Delay: " + strconv.FormatInt(m, 10))
	print("Retry Delay: " + strconv.FormatInt(r, 10))

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

func getSelection(prefix string) int {
	for {
		fmt.Print("\n" + prefix + "> ")
		scanner.Scan()

		SSelection := scanner.Text()
		if strings.ToUpper(SSelection) == "Y" {
			return 1
		} else if strings.ToUpper(SSelection) == "N" {
			return 0
		}
		IntSelection, err := strconv.Atoi(SSelection)
		if err != nil {
			color.Red("Invalid selection please try again.")
			continue
		}

		return IntSelection
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

func loadDelays() (int64, int64) {
	homedir, _ := os.UserHomeDir()
	basedir := path.Join(homedir, "ProsperAIO")
	records, err := config.LoadCSV(path.Join(basedir, "settings.csv"), config.SettingsFieldCount)
	if err != nil {
		color.Red("Error: " + err.Error())
	}

	if len(records) < 1 || len(records[0]) < 1 {
		color.Red("Error: invalid settings.csv format")
	}
	monitorDelayStr := records[0][1]
	retryDelayStr := records[0][2]

	monitorDelay, err := strconv.Atoi(monitorDelayStr)
	if err != nil {
		color.Red("Error: invalid monitor delay. Using default.")
		monitorDelay = 1000
	}

	retryDelay, err := strconv.Atoi(retryDelayStr)
	if err != nil {
		color.Red("Error: invalid retry delay. Using default.")
		retryDelay = 1000
	}

	return int64(monitorDelay), int64(retryDelay)
}
