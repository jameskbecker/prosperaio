package main

import (
	"os"
	"path"
	"strings"
	"sync"

	"prosperaio/config"
	"prosperaio/discord"
	"prosperaio/utils/client"
	"prosperaio/utils/log"
	"prosperaio/utils/prompt"

	"github.com/fatih/color"
)

//TODO: merge prompt section with proxy handler as almost identical
func loadTasksHandler() {
	tasks := config.LoadTasks()
	color.Cyan(line())
	parseMenuSelection(tasks)
}

func loadProxiesHandler(counters *log.TitleCounts) {
	color.Cyan(line())
	for {
		homedir, _ := os.UserHomeDir()
		proxyFolder := path.Join(homedir, "ProsperAIO", "proxies")
		proxyPaths := config.GetDirPaths(proxyFolder, ".txt")

		i := prompt.GetUserInput("Select Proxy File", proxyPaths)
		sPath := path.Join(proxyFolder, proxyPaths[i])
		bData, _ := config.LoadTXT(sPath)
		data := strings.FieldsFunc(string(bData), func(r rune) bool {
			return string(r) == "\n" || string(r) == "\r"
		})

		counters.Proxy = len(data)
		log.UpdateTitle(version, counters)

		color.Cyan(line())
		skipTest := prompt.GetUserInput("Test Proxies?", []string{"Yes", "No"})
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
	data, err := config.LoadCSV(path.Join(basedir, "settings.csv"), config.SettingsFieldCount)
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
