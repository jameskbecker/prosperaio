package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"

	"github.com/fatih/color"

	"prosperaio/config"
	"prosperaio/meshdesktop"
	"prosperaio/prompt"
)

var runningTasks = sync.WaitGroup{}

func taskMenu(data map[string]int) (int, int) {
	taskCount := 0
	for _, v := range data {
		taskCount += v
	}

	items := []string{
		"Run All Tasks (" + strconv.Itoa(taskCount) + ")",
		"Run JD-GB Tasks (" + strconv.Itoa(data["JD-GB"]) + ")",
		"Run Wearestrap Tasks (" + strconv.Itoa(data["WEARESTRAP"]) + ")",
		"Exit",
	}

	selection := prompt.GetUserInput("Task Menu", items)
	return selection, len(items) - 1
}

func parseMenuSelection(tasks []config.Task) {
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

func startTask(t config.Task, taskID int) {
	site := t.Site
	mode := t.Mode
	region := t.Region
	profileName := t.ProfileName
	searchInput := t.MonitorInput
	size := t.Size
	//paymentMethod := t.PaymentMethod

	_, ok := profiles[profileName]
	if !ok {

	}
	profile := profiles[profileName]

	if mode != "" {
		site += "_" + mode
	}
	fmt.Println(profile)
	os.Exit(0)
	switch strings.ToUpper(site) {
	// case "WEARESTRAP":
	// 	input := wearestrap.Input{
	// 		ProductURL: searchInput,
	// 		Size:       size,
	// 		Monitor:    monitorDelay,
	// 		Retry:      retryDelay,
	// 		WebhookURL: getWebhookURL(),
	// 		Email:      email,
	// 		Proxy:      getProxy(),
	// 		Billing: wearestrap.Address{
	// 			First:   firstName,
	// 			Last:    lastName,
	// 			Address: address,
	// 			City:    city,
	// 			Zip:     zip,
	// 			Country: country,
	// 			Phone:   phone,
	// 		},
	// 	}
	// 	go wearestrap.Run(input, taskID, &runningTasks)
	// 	break

	case "JD_FE":
		input := meshdesktop.Input{
			MonitorInput: searchInput,
			MonitorDelay: monitorDelay,
			ErrorDelay:   retryDelay,
			Size:         size,
			Profile:      profile,
			Region:       region,
			WebhookURL:   getWebhookURL(),
		}
		go meshdesktop.Run(input, taskID, &runningTasks)
		break

	default:
		color.Red("[Row " + strconv.Itoa(taskID+1) + "] Invalid Site: '" + site + "'")
	}
}
