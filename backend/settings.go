package main

import "fmt"

func settings() {
	fmt.Println(settingsMenu())
	fmt.Print("Select Option > ")

	scanner.Scan()

}

func settingsMenu() string {
	return line() + bold + `
Settings` + reset + `
0. Set Discord Webhook URL
1. Set Monitor Delay` + "\n"
}
