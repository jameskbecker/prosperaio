package main

import (
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"./wearestrap"
)

func getTaskPaths() []string {
	homedir, _ := os.UserHomeDir()
	configBase := path.Join(homedir, "ProsperAIO", "tasks")
	taskPaths := []string{}
	filepath.Walk(configBase, func(path string, info os.FileInfo, err error) error {
		if filepath.Ext(path) == ".csv" {
			_, name := filepath.Split(path)
			taskPaths = append(taskPaths, name)
		}

		return nil
	})
	return taskPaths
}

func readTaskConfig() ([][]string, error) {
	homedir, _ := os.UserHomeDir()
	configBase := path.Join(homedir, "ProsperAIO", "tasks")

	taskPaths := getTaskPaths()
	selectedPath, err := selectTaskFile(taskPaths)
	if err != nil {
		return nil, err
	}

	data, err := loadConfig(path.Join(configBase, selectedPath))
	if err != nil {
		return nil, err
	}

	tasks, err := readConfig(data)
	if err != nil {
		return nil, err
	}

	return tasks, nil
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

func selectTaskFile(taskPaths []string) (string, error) {
	fmt.Println(line() + bold + "Task File Selector" + reset)
	for i, v := range taskPaths {
		fmt.Println(strconv.Itoa(i) + ". " + v)
	}

	fmt.Print(reset + "\nSelect Option > ")
	scanner.Scan()

	index, err := strconv.Atoi(scanner.Text())
	if err != nil {
		return "", err
	}

	if index > len(taskPaths)-1 || index < 0 {
		return "", errors.New("Out of Bounds")
	}

	return taskPaths[index], nil
}

func mainMenu(data map[string]int) (selection string) {
	options := make(map[string]string)
	taskCount := 0

	fmt.Println(line() + bold + "Main Menu" + reset)

	// i := 0
	// for site, v := range data {
	// 	fmt.Println(strconv.Itoa(i) + ". Run " + site + " Tasks (" + strconv.Itoa(v) + ")")
	// 	options[strconv.Itoa(i)] = site
	// 	taskCount += v
	// 	i++
	// }

	i := 0
	for _, v := range data {
		taskCount += v
	}

	fmt.Println(strconv.Itoa(i) + ". Run all Tasks (" + strconv.Itoa(taskCount) + ")")
	options[strconv.Itoa(i)] = "all"
	i++

	fmt.Println(strconv.Itoa(i) + ". Test Webhook\n")
	options[strconv.Itoa(i)] = "webhook"

	fmt.Print("Select Option > ")

	scanner.Scan()
	selectedOption := scanner.Text()
	fmt.Println(line())
	return options[selectedOption]

}

func parseMenuSelection(tasks [][]string) {
	for {
		taskCount := getTaskCount(tasks)
		selection := mainMenu(taskCount)
		switch selection {
		case "all":
			break
		case "webhook":
			testWebhook("")
			continue
		default:
			fmt.Println(red + "Error: unexpected selection value" + reset)
			continue
		}
		break
	}
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
