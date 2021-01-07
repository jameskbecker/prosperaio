package main

import (
	"encoding/csv"
	"errors"
	"io"
	"log"
	"os"
	"strings"
)

func checkConfig() bool {
	return true
}

func loadConfig(path string) (*csv.Reader, error) {
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

func readConfig(r *csv.Reader) [][]string {
	// Iterate through the records
	entries := [][]string{}

	for {
		// Read each record from csv
		row, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		entries = append(entries, row)
	}

	return entries
}

func setupConfig() error {
	log.Println("Loading User Data...")
	home, err := os.UserHomeDir()
	if err != nil {
		return errors.New("Error Loading Data (E0001)")
	}

	for _, site := range sites {
		err = os.MkdirAll(home+"/ProsperAIO/"+site, os.ModePerm)
		if err != nil {
			return errors.New("Error Loading Data (E0002)")
		}

		tasksFile, err := os.Create("tasks_default.csv")
		if err != nil {

		}
		csvWriter := csv.NewWriter(tasksFile)

		var headers []string

		switch site {
		case "kickz":
			headers = []string{
				"Product URL",
				"Size Type",
				"Size Code",
				"First Name",
			}
			break
		}

		csvWriter.Write(headers)

	}

	//configFolder, err := os.Stat(home + "/ProsperAIO/slamjam/x")
	// if err != nil {
	// 	return errors.New("Error Loading Data (E0002)")
	// }

	return nil
}
