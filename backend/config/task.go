package config

import (
	"os"
	"path"
	"prosperaio/utils/cli"
	"strings"
	"sync"

	"github.com/fatih/color"
)

//TaskFieldCount ...
const TaskFieldCount = 8

//Task format
type Task struct {
	Site          string
	Mode          string
	Region        string
	ProfileName   string
	MonitorInput  string
	Size          string
	PaymentMethod string
}

//TaskInput ...
type TaskInput struct {
	ID            int
	Site          string
	Region        string
	MonitorInput  string
	Size          string
	Proxy         string
	PaymentMethod string
	Profile       Profile
	Settings      Settings
	WG            *sync.WaitGroup
}

//LoadTasks ...
func LoadTasks() (tasks []Task) {
	homedir, _ := os.UserHomeDir()

	taskFolder := path.Join(homedir, "ProsperAIO", "tasks")
	taskPaths := GetDirPaths(taskFolder, ".csv")

	items := append(taskPaths, "Back", "Exit")
	i := cli.GetUserInput("Select Task File", items)

	switch i {
	case len(items) - 2: //Back
		return
	case len(items) - 1: //Exit
		os.Exit(0)
		return
	default:
		data, err := LoadCSV(path.Join(taskFolder, taskPaths[i]), TaskFieldCount)
		if err != nil {
			color.Red("Error: " + err.Error())
			os.Exit(0)
		}
		tasks = stringToTaskSlice(data)
		return
	}

}

func stringToTaskSlice(data [][]string) []Task {
	tasks := []Task{}
	for _, v := range data {
		tasks = append(tasks, Task{
			Site:          strings.TrimSpace(v[0]),
			Mode:          strings.TrimSpace(v[1]),
			Region:        strings.TrimSpace(v[2]),
			ProfileName:   strings.TrimSpace(v[3]),
			MonitorInput:  strings.TrimSpace(v[4]),
			Size:          strings.TrimSpace(v[5]),
			PaymentMethod: strings.TrimSpace(v[6]),
		})
	}

	return tasks
}

//GetTaskCount ...
func GetTaskCount(data []Task) map[string]int {
	siteCounts := map[string]int{
		"FP":         0,
		"JD-DE":      0,
		"JD-GB":      0,
		"WEARESTRAP": 0,
	}
	for _, v := range data {
		site := v.Site
		if v.Region != "" {
			site += "-" + v.Region
		}
		_, exists := siteCounts[strings.ToUpper(site)]
		if !exists {
			continue
		}
		siteCounts[site]++
	}
	return siteCounts
}
