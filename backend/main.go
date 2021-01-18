package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"

	"./discord"
)

var scanner = bufio.NewScanner(os.Stdin)

const version = "4.0.0 (BETA)"
const expiryDate = "27 Sep 21 18:53 GMT"
const blue = "\u001b[34m"
const magenta = "\u001b[35m"
const red = "\u001b[31m"
const cyan = "\u001b[36m"
const bold = "\u001b[1m"
const reset = "\u001b[0m"

var siteIDs = []string{"Snipes-DE"}
var configPaths = []string{"snipes.csv"}

type csvData = [][]string

func main() {
	welcome()
	go discord.SetPresence()

	tasks := [][]string{}
	for {
		data, err := readTaskConfig()
		if err != nil {
			fmt.Println(red + "Error: " + err.Error() + reset)
			continue
		}
		tasks = data
		break
	}

	parseMenuSelection(tasks)

	// runningTasks := sync.WaitGroup{}
	// //log.Println("Press 'Enter' to Start Tasks...")
	// bufio.NewReader(os.Stdin).ReadBytes('\n')

	// // startTasks(entries, &runningTasks)

	// runningTasks.Wait()
}

func welcome() {
	updateTitle(0, 0, 0)
	fmt.Println(logo())
	fmt.Println(bold + "Welcome to ProsperAIO!" + reset)
	fmt.Println("Expires: " + expiryDate)

}

func updateTitle(a, b, c int) {
	title := []string{
		"ProsperAIO v" + version,
		"Carted: " + strconv.Itoa(a),
		"Checkouts: " + strconv.Itoa(b),
		"Proxies: " + strconv.Itoa(c),
	}
	fmt.Print("\033]0;" + strings.Join(title, " | ") + "\007")
}
