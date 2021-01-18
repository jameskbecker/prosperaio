package main

import (
	"encoding/csv"
	"errors"
	"io"
	"io/ioutil"
	"os"
	"strconv"
	"strings"

	"./demandware"
)

func openCSV(path string) (*csv.Reader, error) {
	if !strings.Contains(path, ".csv") {
		return nil, errors.New("Input Not a CSV File")
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}

	reader := csv.NewReader(file)

	return reader, nil
}

func readCSV(r *csv.Reader) (entries [][]string, err error) {
	r.TrimLeadingSpace = true
	//r.FieldsPerRecord = 5
	//fmt.Println(entries)
	for {
		// Read each record from csv

		row, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			break
		}
		entries = append(entries, row)
	}
	if len(entries) == 0 || len(entries) == 1 && len(entries[0]) == 1 && entries[0][0] == "" {
		err = errors.New("no tasks in selected file. Please try again")
		return entries, err
	}

	return entries, nil
}

func loadCSV(path string) ([][]string, error) {
	data, err := openCSV(path)
	if err != nil {
		return nil, err
	}

	tasks, err := readCSV(data)
	if err != nil {
		return nil, err
	}

	return tasks, nil
}

//TODO: check for errors
func loadTXT(path string) ([]byte, error) {
	file, _ := os.Open(path)
	bData, _ := ioutil.ReadAll(file)

	return bData, nil
}

// func setupConfig() error {
// 	log.Println("Loading User Data...")
// 	home, err := os.UserHomeDir()
// 	if err != nil {
// 		return errors.New("Error Loading Data (E0001)")
// 	}

// 	for _, site := range sites {
// 		err = os.MkdirAll(home+"/ProsperAIO/"+site, os.ModePerm)
// 		if err != nil {
// 			return errors.New("Error Loading Data (E0002)")
// 		}

// 		tasksFile, err := os.Create("tasks_default.csv")
// 		if err != nil {

// 		}
// 		csvWriter := csv.NewWriter(tasksFile)

// 		var headers []string

// 		switch site {
// 		case "kickz":
// 			headers = []string{
// 				"Product URL",
// 				"Size Type",
// 				"Size Code",
// 				"First Name",
// 			}
// 			break
// 		}

// 		csvWriter.Write(headers)

// 	}

// 	//configFolder, err := os.Stat(home + "/ProsperAIO/slamjam/x")
// 	// if err != nil {
// 	// 	return errors.New("Error Loading Data (E0002)")
// 	// }

// 	return nil
// }

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
