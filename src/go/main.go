package main

import (
	"bufio"
	"os"
	"sync"

	"./sneakavenue"
)

var sites = [...]string{"Kickz"}
var scanner = bufio.NewScanner(os.Stdin)

const expiryDate = "27 Sep 21 18:53 CST"
const blue = "\u001b[34m"
const cyan = "\u001b[36m"
const bold = "\u001b[1m"
const reset = "\u001b[0m"

func main() {
	var wg sync.WaitGroup

	for i := 0; i < 1; i++ {
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

	wg.Wait()

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
