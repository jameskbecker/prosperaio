package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"./log"
	"./wearestrap"
)

func getDirPaths(dir string, ext string) []string {
	taskPaths := []string{}
	filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if filepath.Ext(path) == ext {
			_, name := filepath.Split(path)
			taskPaths = append(taskPaths, name)
		}

		return nil
	})
	return taskPaths
}

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

	index, err := getSelection()
	if err != nil {
		return "", err
	}

	if index > len(taskPaths)-1 || index < 0 {
		return "", errors.New("Out of Bounds")
	}

	return taskPaths[index], nil
}

func taskMenu(data map[string]int) (selection string) {
	options := make(map[int]string)
	taskCount := 0

	fmt.Println(line() + log.Bold + "\nTask Menu" + log.Reset)

	i := 0
	for site, v := range data {
		fmt.Println(strconv.Itoa(i) + ". Run " + site + " Tasks (" + strconv.Itoa(v) + ")")
		options[i] = site
		taskCount += v
		i++
	}

	// i := 0
	// for _, v := range data {
	// 	taskCount += v
	// }

	fmt.Println(strconv.Itoa(i) + ". Run all Tasks (" + strconv.Itoa(taskCount) + ")")
	options[i] = "all"

	index, err := getSelection()
	if err != nil {
		return ""
	}

	fmt.Println(line())
	return options[index]

}

func parseMenuSelection(tasks [][]string) {
	for {
		taskCount := getTaskCount(tasks)
		selection := taskMenu(taskCount)
		switch selection {
		case "all":
			break
		case "webhook":

			continue
		default:
			fmt.Println(log.Red + "Error: unexpected selection value" + log.Reset)
			continue
		}
		break
	}
	fmt.Println(log.Bold + "Task Log" + log.Reset)
	runningTasks := sync.WaitGroup{}
	runningTasks.Add(1)
	for _, row := range tasks[1:] {
		go startTask(row, &runningTasks)
	}
	runningTasks.Wait()
}

func startTask(data []string, runningTasks *sync.WaitGroup) {
	site := data[0]
	switch strings.ToLower(site) {
	case "wearestrap":
		wearestrap.Run(runningTasks)

	default:

		//fmt.Println("[Row " + strconv.Itoa(i+1) + "] Error: invalid site")
	}
}

/*
// case "onygo":
	// case "snipes-de":
	// case "snipes-uk":
	// 	task, err := dwTask(row)
	// 	if err != nil {
	// 		log.Println("Unable to Run Task " + taskNumber + " (" + err.Error() + "). Exiting Program.")
	// 		os.Exit(0)
	// 	}
	// 	runningTasks.Add(1)
	// 	go demandware.Run(task, taskNumber, runningTasks)
	// 	break

	// case "sneakavenue":
	// 	task := sneakavenue.TaskInput{}
	// 	runningTasks.Add(1)
	// 	go sneakavenue.Run(task)
	// 	break
*/
