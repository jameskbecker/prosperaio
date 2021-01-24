package main

import (
	"fmt"
	"strconv"
	"strings"
	"sync"

	"github.com/manifoldco/promptui"

	"./wearestrap"
	"github.com/fatih/color"
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

// func getSliceSelection(title string, paths []string) (string, error) {
// 	color.Cyan(line())
// 	prompt := promptui.Select{
// 		Label:    title,
// 		Items:    paths,
// 		Stdout:   &bellSkipper{},
// 		HideHelp: true,
// 	}

// 	index, _, _ := prompt.Run()

// 	if index > len(paths)-1 || index < 0 {
// 		return "", errors.New("Out of Bounds")
// 	}

// 	return paths[index], nil
// }

func taskMenu(data map[string]int) (selection string) {
	options := make(map[int]string)
	taskCount := 0

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
	prompt := promptui.Select{
		Label:    "Task Menu",
		Items:    []string{"Run all Tasks (" + strconv.Itoa(taskCount) + ")"},
		HideHelp: true,
		Stdout:   &bellSkipper{},
	}
	options[i] = "all"

	color.Cyan(line())
	index, _, _ := prompt.Run()

	return options[index]

}

func parseMenuSelection(tasks [][]string) {

	runningTasks := sync.WaitGroup{}
	for {
		taskCount := getTaskCount(tasks)
		selection := taskMenu(taskCount)
		fmt.Println("Task Log")
		switch selection {
		case "all":
			for i, row := range tasks[1:] {
				runningTasks.Add(1)
				go startTask(row, i+1, &runningTasks)
			}
			break
		default:
			color.Red("Error: unexpected selection value")
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
