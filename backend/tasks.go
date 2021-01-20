package main

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"sync"

	"./log"
	"./wearestrap"
)

func getTaskCount(data [][]string) map[string]int {
	output := map[string]int{
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

func getSliceSelection(title string, taskPaths []string) (string, error) {
	fmt.Println(line() + log.Bold + "\n" + title + log.Reset)
	for i, v := range taskPaths {
		fmt.Println(strconv.Itoa(i) + ". " + v)
	}

	index := getSelection("")

	if index > len(taskPaths)-1 || index < 0 {
		return "", errors.New("Out of Bounds")
	}

	return taskPaths[index], nil
}

func taskMenu(data map[string]int) (selection string) {
	options := make(map[int]string)
	taskCount := 0

	fmt.Println(line() + log.Bold + "\nTask Menu" + log.Reset)

	// i := 0
	// for site, v := range data {
	// 	fmt.Println(strconv.Itoa(i) + ". Run " + site + " Tasks (" + strconv.Itoa(v) + ")")
	// 	options[i] = site
	// 	taskCount += v
	// 	i++
	// }

	i := 0
	for _, v := range data {
		taskCount += v
	}

	fmt.Println(strconv.Itoa(i) + ". Run all Tasks (" + strconv.Itoa(taskCount) + ")")
	options[i] = "all"

	index := getSelection("")

	fmt.Println(line())
	return options[index]

}

func parseMenuSelection(tasks [][]string) {

	runningTasks := sync.WaitGroup{}
	for {
		taskCount := getTaskCount(tasks)
		selection := taskMenu(taskCount)
		fmt.Println(log.Bold + "Task Log" + log.Reset)
		switch selection {
		case "all":
			for i, row := range tasks[1:] {
				runningTasks.Add(1)
				go startTask(row, i+1, &runningTasks)
			}
			break
		default:
			fmt.Println(log.Red + "Error: unexpected selection value" + log.Reset)
			continue
		}
		break
	}

	runningTasks.Wait()
}

func startTask(data []string, taskID int, runningTasks *sync.WaitGroup) {
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
		wearestrap.Run(input, taskID, runningTasks)

	default:

		//fmt.Println("[Row " + strconv.Itoa(i+1) + "] Error: invalid site")
	}
}
