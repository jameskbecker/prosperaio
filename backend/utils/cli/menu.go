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

	items := []string{
		"Run All Tasks (" + strconv.Itoa(taskCount) + ")",
		"Run JD-GB Tasks (" + strconv.Itoa(data["JD-GB"]) + ")",
		"Run Wearestrap Tasks (" + strconv.Itoa(data["WEARESTRAP"]) + ")",
		"Exit",
	}

	selection := GetUserInput("Task Menu", items)
	return selection, len(items) - 1
}
