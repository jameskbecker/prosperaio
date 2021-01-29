package config

import "strings"

//Task format
type Task struct {
	Site         string
	Mode         string
	Region       string
	MonitorInput string
	Size         string
}

//GetTaskCount ...
func GetTaskCount(data [][]string) map[string]int {
	output := map[string]int{
		"JD":         0,
		"wearestrap": 0,
	}
	for _, v := range data[1:] {
		_, exists := output[strings.ToUpper(v[0])]
		if !exists {
			continue
		}
		output[v[0]]++
	}
	return output
}
