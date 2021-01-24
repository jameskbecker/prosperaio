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

func mainMenu() promptui.Select {
	color.Cyan(line())
	prompt := promptui.Select{
		Label:    "Main Menu",
		HideHelp: true,
		Stdout:   &bellSkipper{},
		Items:    []string{"Run Tasks", "Load Proxies", "Test Webhook"},
	}

	return prompt
}
