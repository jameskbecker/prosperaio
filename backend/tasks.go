package main

import (
	"os"
	"strconv"
	"strings"
	"sync"

	"github.com/fatih/color"
	"github.com/manifoldco/promptui"

	"prosperaio/config"
	"prosperaio/meshdesktop"
	"prosperaio/wearestrap"
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
	site := strings.TrimSpace(data[0])
	mode := strings.TrimSpace(data[1])
	region := strings.TrimSpace(data[2])
	searchInput := strings.TrimSpace(data[3])
	size := strings.TrimSpace(data[4])
	email := strings.TrimSpace(data[5])
	phone := strings.ReplaceAll(strings.TrimSpace(data[6]), `"`, "")
	//pMethod := strings.TrimSpace(data[7])
	firstName := strings.TrimSpace(data[8])
	lastName := strings.TrimSpace(data[9])
	zip := strings.TrimSpace(data[10])
	city := strings.TrimSpace(data[11])
	address1 := strings.TrimSpace(data[12])
	address2 := strings.TrimSpace(data[13])
	country := strings.TrimSpace(data[14])

	profile := config.Profile{
		Email: email,
		Phone: phone,
		Billing: config.Address{
			FirstName: firstName,
			LastName:  lastName,
			Address1:  address1,
			Address2:  address2,
			PostCode:  zip,
			City:      city,
			Country:   country,
		},
	}

	address := address1
	if address2 != "" {
		address += " " + address2
	}

	if mode != "" {
		site += "_" + mode
	}

	switch strings.ToUpper(site) {
	case "WEARESTRAP":
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

	case "JD_FE":
		input := meshdesktop.Input{
			MonitorInput: searchInput,
			MonitorDelay: monitorDelay,
			ErrorDelay:   retryDelay,
			Size:         size,
			Profile:      profile,
			Region:       region,
		}
		go meshdesktop.Run(input, taskID, &runningTasks)
		break

	default:
		color.Red("[Row " + strconv.Itoa(taskID+1) + "] Invalid Site: '" + site + "'")
	}
}
