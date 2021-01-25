package main

import (
	"os"
	"strconv"
	"strings"
	"sync"

	"github.com/manifoldco/promptui"

	"./meshdesktop"
	"./wearestrap"
	"github.com/fatih/color"
)

var runningTasks = sync.WaitGroup{}

func getTaskCount(data [][]string) map[string]int {
	output := map[string]int{
		"jd_desktop":  0,
		"onygo":       0,
		"sneakavenue": 0,
		"snipes-de":   0,
		"snipes-uk":   0,
		"wearestrap":  0,
	}
	for _, v := range data[1:] {
		_, exists := output[v[0]]
		if !exists {
			continue
		}
		output[v[0]]++
	}
	return output
}

func taskMenu(data map[string]int) (int, int) {
	taskCount := 0
	for _, v := range data {
		taskCount += v
	}

	items := []string{
		"Run All Tasks (" + strconv.Itoa(taskCount) + ")",
		"Run JD Desktop Tasks (" + strconv.Itoa(data["jd_desktop"]) + ")",
		//"Run Onygo Tasks (" + strconv.Itoa(data["onygo"]) + ")",
		"Run SneakAvenue Tasks (" + strconv.Itoa(data["sneakavenue"]) + ")",
		//"Run Snipes DE Tasks (" + strconv.Itoa(data["snipes-de"]) + ")",
		"Run Wearestrap Tasks (" + strconv.Itoa(data["wearestrap"]) + ")",
		"Exit",
	}

	prompt := promptui.Select{
		Label:    "Task Menu",
		Items:    items,
		Size:     len(items),
		HideHelp: true,
		Stdout:   &bellSkipper{},
	}

	selection, _, _ := prompt.Run()
	return selection, len(items) - 1
}

func parseMenuSelection(tasks [][]string) {
	for {
		color.Cyan(line())
		taskCounts := getTaskCount(tasks)
		selection, last := taskMenu(taskCounts)
		switch selection {
		case 0: //All
			color.Cyan(line())
			printBold("Task Log")
			for i, row := range tasks[1:] {
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

func startTask(data []string, taskID int) {
	site := data[0]
	//mode := data[1]
	searchInput := data[2]
	size := data[3]
	firstName := data[4]
	lastName := data[5]
	zip := data[6]
	city := data[7]
	address1 := data[8]
	address2 := data[9]
	country := data[10]
	email := data[11]
	phone := strings.ReplaceAll(data[12], `"`, "")
	//pMethod := data[13]

	address := address1
	if address2 != "" {
		address += " " + address2
	}

	switch strings.ToLower(site) {
	case "wearestrap":
		input := wearestrap.Input{
			ProductURL: searchInput,
			Size:       size,
			Monitor:    monitorDelay,
			Retry:      retryDelay,
			WebhookURL: getWebhookURL(),
			Email:      email,
			Proxy:      getProxy(),
			Billing: wearestrap.Address{
				First:   firstName,
				Last:    lastName,
				Address: address,
				City:    city,
				Zip:     zip,
				Country: country,
				Phone:   phone,
			},
		}
		go wearestrap.Run(input, taskID, &runningTasks)
		break

	case "jd_desktop":
		input := meshdesktop.Input{
			MonitorInput: searchInput,
			MonitorDelay: monitorDelay,
			ErrorDelay:   retryDelay,
			Size:         size,
		}
		go meshdesktop.Run(input, taskID, &runningTasks)
		break

	default:

		//fmt.Println("[Row " + strconv.Itoa(i+1) + "] Error: invalid site")
	}
}
