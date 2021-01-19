package main

import (
	"fmt"
	"os"
	"path"
	"strings"
	"sync"

	"./client"
	"./discord"
	"./log"
)

func loadTasksHandler() {
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

		data, err := loadCSV(path.Join(taskFolder, selectedFile), taskFields)
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
		proxies = append(proxies, v)
		go client.TestProxy(v, &proxyWG)
	}
	proxyWG.Wait()
}

//Thought: maybe instead of extracting data in this func have a func that parses all setting data and sets global vars
func testWebhookHandler() {
	homedir, _ := os.UserHomeDir()
	basedir := path.Join(homedir, "ProsperAIO")
	data, err := loadCSV(path.Join(basedir, "settings.csv"), settingsFields)
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
