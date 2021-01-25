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
	"github.com/manifoldco/promptui"
)

//TODO: merge prompt section with proxy handler as almost identical
func loadTasksHandler() {
	tasks := [][]string{}
	color.Cyan(line())
	for {
		homedir, _ := os.UserHomeDir()
		taskFolder := path.Join(homedir, "ProsperAIO", "tasks")
		taskPaths := getDirPaths(taskFolder, ".csv")

		items := append(taskPaths, "Exit")
		prompt := promptui.Select{
			Label:    "Select Task File",
			Items:    items,
			Stdout:   &bellSkipper{},
			HideHelp: true,
		}

		i, _, _ := prompt.Run()
		if i == len(items)-1 {
			os.Exit(0)
		}

		data, err := loadCSV(path.Join(taskFolder, taskPaths[i]), taskFields)
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
	color.Cyan(line())
	for {
		homedir, _ := os.UserHomeDir()
		proxyFolder := path.Join(homedir, "ProsperAIO", "proxies")
		proxyPaths := getDirPaths(proxyFolder, ".txt")
		prompt := promptui.Select{
			Label:    "Select Proxy File",
			Items:    proxyPaths,
			Stdout:   &bellSkipper{},
			HideHelp: true,
		}

		i, _, _ := prompt.Run()
		sPath := path.Join(proxyFolder, proxyPaths[i])
		bData, _ := loadTXT(sPath)
		data := strings.FieldsFunc(string(bData), func(r rune) bool {
			return string(r) == "\n" || string(r) == "\r"
		})

		counters.Proxy = len(data)
		log.UpdateTitle(version, counters)

		prompt = promptui.Select{
			Label:    "Test Proxies?",
			Items:    []string{"Yes", "No"},
			HideHelp: true,
			Stdout:   &bellSkipper{},
		}
		color.Cyan(line())
		skipTest, _, _ := prompt.Run()
		if skipTest == 0 {
			color.Cyan(line())
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
