package main

import (
	"github.com/fatih/color"
	"github.com/manifoldco/promptui"
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
	items := []string{"Run Tasks", "Load Proxies", "Test Webhook", "Exit"}
	prompt := promptui.Select{
		Label:    "Main Menu",
		HideHelp: true,
		Stdout:   &bellSkipper{},
		Items:    items,
	}

	selection, _, _ := prompt.Run()

	return selection, len(items) - 1
}
