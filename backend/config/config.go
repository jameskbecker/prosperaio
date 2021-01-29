package config

import (
	"encoding/csv"
	"errors"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

//GetDirPaths ...
func GetDirPaths(dir string, ext string) []string {
	taskPaths := []string{}
	filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
		if filepath.Ext(path) == ext {
			_, name := filepath.Split(path)
			taskPaths = append(taskPaths, name)
		}

		return nil
	})
	return taskPaths
}

func openCSV(path string, cLen int) (*csv.Reader, error) {
	if !strings.Contains(path, ".csv") {
		return nil, errors.New("Input Not a CSV File")
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}

	reader := csv.NewReader(file)
	reader.TrimLeadingSpace = true

	if cLen > 0 {
		reader.FieldsPerRecord = cLen
	}
	return reader, nil
}

func readCSV(r *csv.Reader) (records [][]string, err error) {
	for {
		record, err := r.Read()
		if err != nil && err == io.EOF {
			break
		} else if err != nil {
			return nil, err
		}
		records = append(records, record)
	}
	if len(records) == 0 || len(records) == 1 && len(records[0]) == 1 && records[0][0] == "" {
		err = errors.New("no tasks in selected file. Please try again")
		return records, err
	}

	return records, nil
}

//LoadCSV ...
func LoadCSV(path string, cLen int) ([][]string, error) {
	data, err := openCSV(path, cLen)
	if err != nil {
		return nil, err
	}

	tasks, err := readCSV(data)
	if err != nil {
		return nil, err
	}

	return tasks, nil
}

//LoadTXT TODO: check for errors
func LoadTXT(path string) ([]byte, error) {
	file, _ := os.Open(path)
	bData, _ := ioutil.ReadAll(file)

	return bData, nil
}
