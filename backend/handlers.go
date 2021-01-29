package main

import (
	"os"
	"path"
	"prosperaio/config"
	"prosperaio/discord"
	"prosperaio/utils/client"
	"prosperaio/utils/log"
	"prosperaio/utils/prompt"
	"strings"
	"sync"

	"github.com/fatih/color"
)

func loadTasksHandler() {
	tasks := config.LoadTasks()
	color.Cyan(line())
	for {
		color.Cyan(line())
		taskCounts := config.GetTaskCount(tasks)
		selection, last := taskMenu(taskCounts)
		switch selection {
		case 0: //All
			color.Cyan(line())
			printBold("Task Log")
			for i, row := range tasks {
				runningTasks.Add(1)
				startTask(row, i+1)
			}
			break

		case last:
			os.Exit(0)
			break

		default:
			color.Red("Error: unexpected selection value")
			continue
		}
		break
	}

	runningTasks.Wait()
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

func testWebhookHandler() {
	webhookURL := config.GetWebhookURL()
	discord.TestWebhook(webhookURL)
}
