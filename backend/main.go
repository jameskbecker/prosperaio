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

type csvData = [][]string

func init() {
	const expiryDate = "28 Jan 2021 10:55 GMT"
	expTime, _ := time.Parse("02 Jan 2006 15:04 MST", expiryDate)
	if time.Until(expTime) < 0*time.Millisecond {
		os.Exit(0)
	}
	discord.SetPresence()
	welcome(expiryDate)
}

func main() {
	counters := log.TitleCounts{}
	log.UpdateTitle(version, &counters)
	for {
		fmt.Println(mainMenu())
		selection := getSelection()
		switch selection {
		case 0:
			runTasksHandler()
			continue
		case 1:
			loadProxiesHandler(&counters)
			continue
		case 2:
			testWebhookHandler()
			continue
		default:
			fmt.Println("Invalid Selection: " + strconv.Itoa(selection))
			continue
		}
	}

}

func runTasksHandler() {
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

func loadProxiesHandler(counters *log.TitleCounts) {
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

		counters.Proxy = len(data)
		log.UpdateTitle(version, counters)

		testProxies(data)
		log.UpdateTitle(version, counters)
		break
	}
}
func testProxies(data []string) {
	fmt.Println(log.Bold + "Proxy Tester" + log.Reset)
	proxyWG := sync.WaitGroup{}
	for _, v := range data {
		proxyWG.Add(1)
		go client.TestProxy(v, &proxyWG)
	}
	proxyWG.Wait()
}

//Thought: maybe instead of extracting data in this func have a func that parses all setting data and sets global vars
func testWebhookHandler() {
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

func welcome(expiryDate string) {
	fmt.Println(logo())
	fmt.Println(log.Bold + "Welcome to ProsperAIO!" + log.Reset)
	fmt.Println("Expires: " + expiryDate)

}
