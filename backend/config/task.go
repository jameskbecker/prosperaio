package config

import (
	"fmt"
	"os"
	"path"
	"prosperaio/utils/cli"
	"strings"
	"sync"
	"time"

	"github.com/fatih/color"
)

//TaskFieldCount ...
const TaskFieldCount = 7

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
	MonitorInput  string
	Region        string
	Size          string
	Proxy         string
	PaymentMethod string
	WebhookURL    string
	Profile       Profile
	MonitorDelay  time.Duration
	RetryDelay    time.Duration
	WG            *sync.WaitGroup
}

//LoadTasks ...
func LoadTasks() []Task {
	tasks := []Task{}
	for {
		homedir, _ := os.UserHomeDir()
		taskFolder := path.Join(homedir, "ProsperAIO", "tasks")
		taskPaths := GetDirPaths(taskFolder, ".csv")

		items := append(taskPaths, "Exit")
		i := cli.GetUserInput("Select Task File", items)
		if i == len(items)-1 {
			os.Exit(0)
		}

		data, err := LoadCSV(path.Join(taskFolder, taskPaths[i]), TaskFieldCount)
		if err != nil {
			color.Red("Error: " + err.Error())
			continue
		}
		tasks = stringToTaskSlice(data)
		break
	}
	return tasks
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
		"JD-GB":      0,
		"WEARESTRAP": 0,
	}
	for _, v := range data {
		site := v.Site
		if v.Region != "" {
			site += "-" + v.Region
		}
		fmt.Println(site)
		_, exists := siteCounts[strings.ToUpper(site)]
		if !exists {
			continue
		}
		siteCounts[site]++
	}
	return siteCounts
}
