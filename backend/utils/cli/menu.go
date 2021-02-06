package cli

import (
	"strconv"

	"github.com/fatih/color"
)

//MainMenu ...
func MainMenu() string {
	color.Cyan(Line())
	items := []string{
		"Run Tasks",
		"Load Proxies",
		"Test Webhook",
		"Manual Captcha Harvester",
		"Settings",
		"Exit",
	}
	selection := GetUserInput("Main Menu", items)
	return items[selection]
}

//SettingsMenu ...
func SettingsMenu() string {
	color.Cyan(Line())
	items := []string{
		"Set Webhook URL",
		"Set Monitor Delay",
		"Set Retry Delay",
		"Set 2Captcha API Key",
		"Exit",
	}
	selection := GetUserInput("Settings", items)
	return items[selection]
}

//TaskMenu ...
func TaskMenu(data map[string]int) string {
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
	return items[selection]
}
