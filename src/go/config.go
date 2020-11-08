package main

import (
	"encoding/csv"
	"errors"
	"log"
	"os"
)

func checkConfig() bool {
	return true
}

func readConfig(site string) {
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
