package main

import (
	"bufio"
	"fmt"
	"os"
	"path"
	"strconv"
	"strings"
	"sync"
	"time"

	"./client"
	"./discord"
	"./log"
)

var scanner = bufio.NewScanner(os.Stdin)

const version = "4.0.0 (ALPHA)"
const expiryDate = "28 Jan 2021 10:55 GMT"

var siteIDs = []string{"Snipes-DE"}
var configPaths = []string{"snipes.csv"}

var webhookURL = "https://discord.com/api/webhooks/799261395920879636/XfptkYZ51sANptdoHZO5kl48LuPiHMypfBjn9NYut7VJN_B4AX-LHdrYGqMx4a7hbEC-"

var cartCount = 0
var checkoutCount = 0
var proxyCount = 0

type csvData = [][]string

func init() {
	expTime, _ := time.Parse("02 Jan 2006 15:04 MST", expiryDate)
	if time.Until(expTime) < 0*time.Millisecond {
		os.Exit(0)
	}
	discord.SetPresence()
}

func main() {
	welcome()
	fmt.Println(mainMen())
	selection := -1
	for {
		s, err := getSelection()
		if err != nil {
			fmt.Println("Invalid selection please try again.")
			continue
		}
		selection = s
		break
	}

	switch selection {
	case 0:
		selectRunTasks()
		break
	case 1:
		selectLoadProxies()
		break
	case 2:
		discord.TestWebhook(webhookURL)
		break
	default:
		fmt.Println("Invalid Selection: " + strconv.Itoa(selection))
	}
}

func selectRunTasks() {
	tasks := [][]string{}
	for {
		homedir, _ := os.UserHomeDir()
		taskFolder := path.Join(homedir, "ProsperAIO", "tasks")
		taskPaths := getDirPaths(taskFolder, ".csv")
		selectedFile, err := getSliceSelection("Select Task File", taskPaths)
		if err != nil {
			fmt.Println(err)
			continue
		}

		data, err := loadCSV(path.Join(taskFolder, selectedFile))
		if err != nil {
			fmt.Println(log.Red + "Error: " + err.Error() + log.Reset)
			continue
		}
		tasks = data
		break
	}

	parseMenuSelection(tasks)
}

func selectLoadProxies() {
	//proxies := [][]string{}
	for {
		homedir, _ := os.UserHomeDir()
		taskFolder := path.Join(homedir, "ProsperAIO", "proxies")
		taskPaths := getDirPaths(taskFolder, ".txt")
		selectedFile, err := getSliceSelection("Select Proxy File", taskPaths)
		if err != nil {
			fmt.Println(err)
			continue
		}

		sPath := path.Join(taskFolder, selectedFile)

		bData, _ := loadTXT(sPath)

		data := strings.FieldsFunc(string(bData), func(r rune) bool {
			return string(r) == "\n" || string(r) == "\r"
		})

		fmt.Println(log.Bold + "Proxy Tester" + log.Reset)
		testProxies(data)
		log.UpdateTitle(version, cartCount, checkoutCount, proxyCount)
		break
	}
}

func testProxies(data []string) {
	proxyWG := sync.WaitGroup{}
	for _, v := range data {
		proxyWG.Add(1)
		proxyCount++
		go client.TestProxy(v, &proxyWG)
	}
	proxyWG.Wait()
}

func getSelection() (int, error) {
	fmt.Print("\n> ")
	scanner.Scan()

	SSelection := scanner.Text()
	IntSelection, err := strconv.Atoi(SSelection)
	if err != nil {
		return 0, err
	}

	return IntSelection, nil
}

func welcome() {
	log.UpdateTitle(version, cartCount, checkoutCount, proxyCount)
	fmt.Println(logo())
	fmt.Println(log.Bold + "Welcome to ProsperAIO!" + log.Reset)
	fmt.Println("Expires: " + expiryDate)

}
