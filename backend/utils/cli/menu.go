package cli

import (
	"strconv"

	"github.com/fatih/color"
)

//MainMenu ...
func MainMenu() (int, int) {
	color.Cyan(Line())
	items := []string{
		"Run Tasks",
		"Load Proxies",
		"Test Webhook",
		"Manual Captcha Harvester",
		"Exit",
	}
	selection := GetUserInput("Main Menu", items)
	return selection, len(items) - 1
}

//TaskMenu ...
func TaskMenu(data map[string]int) (int, int) {
	taskCount := 0
	for _, v := range data {
		taskCount += v
	}
	items := []string{"Run All Tasks (" + strconv.Itoa(taskCount) + ")"}
	// for k, v := range data {
	// 	if v > 0 {
	// 		items = append(items, "Run "+k+" Tasks ("+strconv.Itoa(v)+")")
	// 	}
	// }

	items = append(items, "Exit")

	selection := GetUserInput("Task Menu", items)
	return selection, len(items) - 1
}
