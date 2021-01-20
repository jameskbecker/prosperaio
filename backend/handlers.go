package main

import (
	"os"
	"path"
	"strings"
	"sync"

	"./client"
	"./discord"
	"./log"
	"github.com/fatih/color"
)

func loadTasksHandler() {
	tasks := [][]string{}
	for {
		homedir, _ := os.UserHomeDir()
		taskFolder := path.Join(homedir, "ProsperAIO", "tasks")
		taskPaths := getDirPaths(taskFolder, ".csv")
		selectedFile, err := getSliceSelection("Select Task File", taskPaths)
		if err != nil {
			color.Red(err.Error())
			continue
		}

		data, err := loadCSV(path.Join(taskFolder, selectedFile), taskFields)
		if err != nil {
			color.Red("Error: " + err.Error())
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
			color.Red(err.Error())
			continue
		}

		sPath := path.Join(taskFolder, selectedFile)
		bData, _ := loadTXT(sPath)
		data := strings.FieldsFunc(string(bData), func(r rune) bool {
			return string(r) == "\n" || string(r) == "\r"
		})

		counters.Proxy = len(data)
		log.UpdateTitle(version, counters)

		testP := getSelection("Test Proxies? (Y/N) ")
		if testP == 1 {
			testProxies(data)
		}

		break
	}
}
func testProxies(data []string) {
	color.White("Proxy Tester")
	proxyWG := sync.WaitGroup{}
	for _, v := range data {
		proxyWG.Add(1)
		proxies = append(proxies, v)
		go client.TestProxy(v, &proxyWG)
	}
	proxyWG.Wait()
}

//Thought: maybe instead of extracting data in this func have a func that parses all setting data and sets global vars
func testWebhookHandler() {
	webhookURL := getWebhookURL()
	discord.TestWebhook(webhookURL)
}

func getWebhookURL() string {
	homedir, _ := os.UserHomeDir()
	basedir := path.Join(homedir, "ProsperAIO")
	data, err := loadCSV(path.Join(basedir, "settings.csv"), settingsFields)
	if err != nil {
		color.Red("Error: " + err.Error())
	}

	if len(data) < 2 || len(data[0]) < 1 {
		color.Red("Error: invalid settings.csv format")
	}
	webhookURL := data[1][0]

	if webhookURL == "" {
		color.Red("Error: no webhook URL found in settings.csv")
		return ""
	}

	return webhookURL
}
