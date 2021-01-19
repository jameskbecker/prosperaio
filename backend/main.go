package main

import (
	"bufio"
	"fmt"
	"os"
	"path"
	"strconv"
	"strings"
	"sync"
	"time"

	"./client"
	"./discord"
	"./log"
)

var scanner = bufio.NewScanner(os.Stdin)

const version = "4.0.0 (ALPHA)"
const expiryDate = "28 Jan 2021 10:55 GMT"

var siteIDs = []string{"Snipes-DE"}
var configPaths = []string{"snipes.csv"}

var cartCount = 0
var checkoutCount = 0
var proxyCount = 0

type csvData = [][]string

func init() {
	expTime, _ := time.Parse("02 Jan 2006 15:04 MST", expiryDate)
	if time.Until(expTime) < 0*time.Millisecond {
		os.Exit(0)
	}
	discord.SetPresence()
}

func main() {
	welcome()
	for {
		fmt.Println(mainMenu())
		selection := getSelection()
		switch selection {
		case 0:
			selectRunTasks()
			continue
		case 1:
			selectLoadProxies()
			continue
		case 2:
			selectTestWebhook()
			continue
		default:
			fmt.Println("Invalid Selection: " + strconv.Itoa(selection))
			continue
		}
	}

}

func selectRunTasks() {
	tasks := [][]string{}
	for {
		homedir, _ := os.UserHomeDir()
		taskFolder := path.Join(homedir, "ProsperAIO", "tasks")
		taskPaths := getDirPaths(taskFolder, ".csv")
		selectedFile, err := getSliceSelection("Select Task File", taskPaths)
		if err != nil {
			fmt.Println(err)
			continue
		}

		data, err := loadCSV(path.Join(taskFolder, selectedFile))
		if err != nil {
			fmt.Println(log.Red + "Error: " + err.Error() + log.Reset)
			continue
		}
		tasks = data
		break
	}

	parseMenuSelection(tasks)
}

func selectLoadProxies() {
	//proxies := [][]string{}
	for {
		homedir, _ := os.UserHomeDir()
		taskFolder := path.Join(homedir, "ProsperAIO", "proxies")
		taskPaths := getDirPaths(taskFolder, ".txt")
		selectedFile, err := getSliceSelection("Select Proxy File", taskPaths)
		if err != nil {
			fmt.Println(err)
			continue
		}

		sPath := path.Join(taskFolder, selectedFile)

		bData, _ := loadTXT(sPath)

		data := strings.FieldsFunc(string(bData), func(r rune) bool {
			return string(r) == "\n" || string(r) == "\r"
		})

		fmt.Println(log.Bold + "Proxy Tester" + log.Reset)
		testProxies(data)
		log.UpdateTitle(version, cartCount, checkoutCount, proxyCount)
		break
	}
}

//Thought: maybe instead of extracting data in this func have a func that parses all setting data and sets global vars
func selectTestWebhook() {
	homedir, _ := os.UserHomeDir()
	basedir := path.Join(homedir, "ProsperAIO")
	data, err := loadCSV(path.Join(basedir, "settings.csv"))
	if err != nil {
		fmt.Println(log.Red + "Error: " + err.Error() + log.Reset)
	}

	if len(data) < 2 || len(data[0]) < 1 {
		fmt.Println(log.Red + "Error: invalid settings.csv format" + log.Reset)
	}
	webhookURL := data[1][0]

	if webhookURL == "" {
		fmt.Println(log.Red + "Error: no webhook URL found in settings.csv" + log.Reset)
		return
	}
	discord.TestWebhook(webhookURL)
}
func testProxies(data []string) {
	proxyWG := sync.WaitGroup{}
	for _, v := range data {
		proxyWG.Add(1)
		proxyCount++
		go client.TestProxy(v, &proxyWG)
	}
	proxyWG.Wait()
}

func getSelection() int {
	for {
		fmt.Print("\n> ")
		scanner.Scan()

		SSelection := scanner.Text()
		IntSelection, err := strconv.Atoi(SSelection)
		if err != nil {
			fmt.Println("Invalid selection please try again.")
			continue
		}

		return IntSelection
	}
}

func welcome() {
	log.UpdateTitle(version, cartCount, checkoutCount, proxyCount)
	fmt.Println(logo())
	fmt.Println(log.Bold + "Welcome to ProsperAIO!" + log.Reset)
	fmt.Println("Expires: " + expiryDate)

}
