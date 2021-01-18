package main

import (
	"fmt"

	"./log"
)

func settings() {
	fmt.Println(settingsMenu())
	fmt.Print("Select Option > ")

	scanner.Scan()

}

func settingsMenu() string {
	return line() + log.Bold + `
Settings` + log.Reset + `
0. Set Discord Webhook URL
1. Set Monitor Delay` + "\n"
}
