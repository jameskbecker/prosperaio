package main

import (
	"prosperaio/utils/prompt"
	"strconv"

	"github.com/fatih/color"
)

func line() string {
	return "-------------------------------------------------------------------------------------"
}

func logo() string {
	return line() + `       
                                                                             
    ██████╗ ██████╗  ██████╗ ███████╗██████╗ ███████╗██████╗  █████╗ ██╗ ██████╗   
    ██╔══██╗██╔══██╗██╔═══██╗██╔════╝██╔══██╗██╔════╝██╔══██╗██╔══██╗██║██╔═══██╗  
    ██████╔╝██████╔╝██║   ██║███████╗██████╔╝█████╗  ██████╔╝███████║██║██║   ██║  
    ██╔═══╝ ██╔══██╗██║   ██║╚════██║██╔═══╝ ██╔══╝  ██╔══██╗██╔══██║██║██║   ██║  
    ██║     ██║  ██║╚██████╔╝███████║██║     ███████╗██║  ██║██║  ██║██║╚██████╔╝  
    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝   

` + line()
}

func mainMenu() (int, int) {
	color.Cyan(line())
	items := []string{
		"Run Tasks",
		"Load Proxies",
		"Test Webhook",
		"Exit",
	}
	selection := prompt.GetUserInput("Main Menu", items)
	return selection, len(items) - 1
}

func taskMenu(data map[string]int) (int, int) {
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

	selection := prompt.GetUserInput("Task Menu", items)
	return selection, len(items) - 1
}
