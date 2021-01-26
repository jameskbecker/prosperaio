package main

import (
	"bufio"
	"fmt"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/manifoldco/promptui"

	"./client"
	"./discord"
	"./log"
	"github.com/fatih/color"
)

const version = "4.0.3 (ALPHA)"
const taskFields = 14
const settingsFields = 3

var scanner = bufio.NewScanner(os.Stdin)
var proxies = []string{}
var monitorDelay time.Duration
var retryDelay time.Duration

var printBold = color.New(color.Bold, color.FgWhite).PrintlnFunc()
var print = color.New(color.FgWhite).PrintlnFunc()

func init() {
	const expiryDate = "28 Jan 2021 10:55 GMT"
	expTime, _ := time.Parse("02 Jan 2006 15:04 MST", expiryDate)
	if time.Until(expTime) < 0*time.Millisecond {
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
	records, err := loadCSV(path.Join(basedir, "settings.csv"), settingsFields)
	if err != nil {
		color.Red("Error: " + err.Error())
	}

	if len(records) < 2 || len(records[0]) < 1 {
		color.Red("Error: invalid settings.csv format")
	}
	monitorDelayStr := records[1][1]
	retryDelayStr := records[1][2]

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
