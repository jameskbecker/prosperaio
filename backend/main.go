package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"time"

	"./discord"
	"./log"
)

var scanner = bufio.NewScanner(os.Stdin)

const version = "4.0.0 (ALPHA)"

type csvData = [][]string

func init() {
	const expiryDate = "28 Jan 2021 10:55 GMT"
	expTime, _ := time.Parse("02 Jan 2006 15:04 MST", expiryDate)
	if time.Until(expTime) < 0*time.Millisecond {
		os.Exit(0)
	}
	discord.SetPresence()
	fmt.Println(logo())
	fmt.Println(log.Bold + "Welcome to ProsperAIO!" + log.Reset)
	fmt.Println("Expires: " + expiryDate)
}

func main() {
	counters := log.TitleCounts{}
	log.UpdateTitle(version, &counters)
	for {
		fmt.Println(mainMenu())
		selection := getSelection()
		switch selection {
		case 0:
			runTasksHandler()
			continue
		case 1:
			loadProxiesHandler(&counters)
			continue
		case 2:
			testWebhookHandler()
			continue
		default:
			fmt.Println("Invalid Selection: " + strconv.Itoa(selection))
			continue
		}
	}

}

func getSelection() int {
	for {
		fmt.Print("\n> ")
		scanner.Scan()

		SSelection := scanner.Text()
		IntSelection, err := strconv.Atoi(SSelection)
		if err != nil {
			fmt.Println("Invalid selection please try again.")
			continue
		}

		return IntSelection
	}
}
