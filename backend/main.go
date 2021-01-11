package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"sync"

	"./demandware"
	"./sneakavenue"
)

var sites = [...]string{"Kickz"}
var scanner = bufio.NewScanner(os.Stdin)

const expiryDate = "27 Sep 21 18:53 CST"
const blue = "\u001b[34m"
const cyan = "\u001b[36m"
const bold = "\u001b[1m"
const reset = "\u001b[0m"

func updateTitle(a string, b string) {
	title := "ProsperAIO | Carted: " + a + " | Checkouts: " + b
	fmt.Print("\033]0;" + title + "\007")
}

func main() {
	csvData, _ := loadConfig("/Users/james/Documents/GitHub/prosperaio/dw_tasks.csv")
	entries := readConfig(csvData)

	taskCount := len(entries) - 1
	if taskCount == 0 {
		log.Println("Error: No Tasks Available")
		os.Exit(0)
	}

	log.Println("Loaded " + strconv.Itoa(taskCount) + " Task(s)")

	runningTasks := sync.WaitGroup{}
	log.Println("Press 'Enter' to Start Tasks...")
	bufio.NewReader(os.Stdin).ReadBytes('\n')

	startTasks(entries, &runningTasks)

	runningTasks.Wait()
}

func startTasks(entries [][]string, runningTasks *sync.WaitGroup) {

	for i, columns := range entries {
		if i == 0 {
			continue
		}

		taskNumber := strconv.Itoa(i)
		site := columns[0]

		switch strings.ToLower(site) {
		case "_sbx_admin":
		case "onygo":
		case "snipes-de":
			task, err := dwTask(columns)
			if err != nil {
				log.Println("Unable to Run Task " + taskNumber + " (" + err.Error() + "). Exiting Program.")
				os.Exit(0)
			}
			runningTasks.Add(1)
			go demandware.Run(task, taskNumber, runningTasks)
			break

		case "sneakavenue":
			break

		default:
			fmt.Println("[Row " + strconv.Itoa(i+1) + "] Error: invalid site")
		}
	}
}

func dwTask(columns []string) (demandware.Input, error) {
	billingAdd := demandware.Address{
		Title:       columns[4],
		FirstName:   columns[5],
		LastName:    columns[6],
		PostalCode:  columns[7],
		City:        columns[8],
		Street:      columns[9],
		Suite:       columns[10],
		Address1:    columns[11],
		Address2:    columns[12],
		CountryCode: columns[13],
	}

	shippingAdd := demandware.Address{
		Title:       columns[14],
		FirstName:   columns[15],
		LastName:    columns[16],
		PostalCode:  columns[17],
		City:        columns[18],
		Street:      columns[19],
		Suite:       columns[20],
		Address1:    columns[21],
		Address2:    columns[22],
		CountryCode: columns[23],
	}

	task := demandware.Input{
		Site:       columns[0],
		Mode:       columns[1],
		ProductURL: columns[2],
		Size:       columns[3],
		Profile: demandware.Profile{
			Shipping: shippingAdd,
			Billing:  billingAdd,
			Email:    columns[24],
			Phone:    columns[25],
			Payment: demandware.Payment{
				Method: columns[26],
			},
		},
	}

	return task, nil

}

func checkDWHeaders(columns []string) [][]string {
	errs := [][]string{}

	headers := dwHeaders()
	for i, v := range columns {
		if v != headers[i] {
			errs = append(errs, []string{strconv.Itoa(i), v})
		}
	}

	return errs
}

func dwHeaders() []string {
	return []string{
		"Site",
		"Mode",
		"Url / SKU",
		"Size",
		"Billing Title",
		"Billing First",
		"Billing Last",
		"Billing Zip",
		"Billing City",
		"Billing Street",
		"Billing Suite",
		"Billing Address 1",
		"Billing Address2",
		"Billing Country",
		"Shipping Title",
		"Shipping First",
		"Shipping Last",
		"Shipping Zip",
		"Shipping City",
		"Shipping Street",
		"Shipping Suite",
		"Shipping Address 1",
		"Shipping Address 2",
		"Shipping Country",
		"Email",
		"Phone",
		"Payment Method",
	}
}

func runSneakAvenue(amount int, wg *sync.WaitGroup) {
	for i := 0; i < amount; i++ {
		wg.Add(1)
		go sneakavenue.Run(&sneakavenue.TaskInput{
			ProductURL: "https://www.sneak-a-venue.com/lacoste-t-clip-off-white-248942",
			SizeInput:  "42,5",
			Billing: sneakavenue.Address{
				FirstName: "John",
				LastName:  "Doe",
				Email:     "johndoe@gmail.com",
				Phone:     "01593752209",
				Address1:  "123 Grace Ave",
				Address2:  "123",
				City:      "Surbiton",
				Zip:       "KT68DF",
				Country:   "UK",
				State:     "",
			},
			Shipping: sneakavenue.Address{
				FirstName: "John",
				LastName:  "Doe",
				Email:     "johndoe@gmail.com",
				Phone:     "01593752209",
				Address1:  "123 Grace Ave",
				Address2:  "123",
				City:      "Surbiton",
				Zip:       "KT68DF",
				Country:   "UK",
				State:     "",
			},
		})
	}
}

// func getGroup(groups []os.FileInfo) (file os.FileInfo) {
// 	for {
// 		fmt.Print("\n-> ")
// 		scanner.Scan()
// 		groupInput := scanner.Text()

// 		i, err := strconv.Atoi(groupInput)
// 		if err != nil {
// 			log.Println("Invalid Input. Please try again.")
// 			continue
// 		}

// 		file = groups[i]
// 		break
// 	}

// 	return file
// }

// func readCSV(filename string) ([][]string, error) {

// 	// Open CSV file
// 	f, err := os.Open(filename)
// 	if err != nil {
// 		return [][]string{}, err
// 	}
// 	defer f.Close()

// 	// Read File into a Variable
// 	lines, err := csv.NewReader(f).ReadAll()
// 	if err != nil {
// 		return [][]string{}, err
// 	}

// 	for i, columns := range lines {
// 		for j, cell := range columns {
// 			columns[j] = strings.ReplaceAll(cell, "`", "")
// 		}
// 		lines[i] = columns

// 	}

// 	return lines[1:], nil
// }

// func isExpired() bool {
// 	expiryTime, _ := time.Parse(time.RFC822, expiryDate)
// 	loc, _ := time.LoadLocation("Local")
// 	now := time.Now().In(loc)

// 	return !now.Before(expiryTime)
// }

//FROM MAIN FUNC
//User Input Scanner

// color.Blue(logo())
// fmt.Print("\n")

// if isExpired() {
// 	log.Println("This Version of ProsperAIO has Expired. Please contact Support for more information.")
// 	return
// }

// fmt.Println(bold + "Welcome to ProsperAIO!\n" + reset)

// log.Print("Initialising...")

// configExists := checkConfig()

// if !configExists {
// 	err := setupConfig()

// 	if err != nil {
// 		log.Println(err.Error())
// 		return
// 	}
// }

// var wg sync.WaitGroup
// fmt.Print("\n")

// log.Println("Please Select Site (1-" + strconv.Itoa(len(sites)) + "):")
// for i, v := range sites {
// 	log.Println(strconv.Itoa(i+1) + ". " + v)
// }

// //Get User Input for Site
// fmt.Print("\n-> ")
// scanner.Scan()
// siteNumber := scanner.Text()
// home, _ := os.UserHomeDir()

// var dirname string
// switch siteNumber {
// case "1":
// 	dirname = home + "/ProsperAIO/kickz"
// 	break
// case "2":
// 	dirname = home + "/ProsperAIO/outback"
// 	break
// }

// if dirname == "" {
// 	log.Println("Error Loading Site Directory")
// }

// siteDir, _ := os.Open(dirname)
// groups, _ := siteDir.Readdir(-1)
// var taskFiles []os.FileInfo
// log.Println("Select Task Group:")

// for _, group := range groups {
// 	ss := strings.Split(group.Name(), ".")
// 	prefix := ss[0]

// 	if prefix == "tasks" && len(ss) > 2 {
// 		taskFiles = append(taskFiles, group)
// 		name := ss[1]
// 		i := strconv.Itoa(len(taskFiles)) + "."

// 		log.Println(i, name)
// 	}

// }
// selectedFile := getGroup(groups)
// log.Println(selectedFile.Name())
// tasks, err := readCSV(dirname + "/" + selectedFile.Name())
// if err != nil {
// 	log.Println(err.Error())
// }

// for _, task := range tasks {
// 	wg.Add(1)
// 	options := &kickz.Options{
// 		ItemNumber:    task[0],
// 		Region:        task[1],
// 		Size:          task[2],
// 		PaymentMethod: task[3],
// 		Cookie:        task[4],
// 	}
// 	go kickz.Run(&wg, options)
// }

// defer wg.Wait()
