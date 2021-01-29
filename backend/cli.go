package main

import (
	"prosperaio/prompt"

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
