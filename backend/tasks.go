package main

import (
	"fmt"
	"os"
	"prosperaio/config"
	"prosperaio/sites/meshdesktop"
	"strconv"
	"strings"
	"sync"

	"github.com/fatih/color"
)

var runningTasks = sync.WaitGroup{}

func startTask(t config.Task, taskID int) {
	site := t.Site
	mode := t.Mode
	region := t.Region
	profileName := t.ProfileName
	searchInput := t.MonitorInput
	size := t.Size
	//paymentMethod := t.PaymentMethod

	_, ok := profiles[profileName]
	if !ok {

	}
	profile := profiles[profileName]

	if mode != "" {
		site += "_" + mode
	}
	fmt.Println(profile)
	os.Exit(0)
	switch strings.ToUpper(site) {
	// case "WEARESTRAP":
	// 	input := wearestrap.Input{
	// 		ProductURL: searchInput,
	// 		Size:       size,
	// 		Monitor:    monitorDelay,
	// 		Retry:      retryDelay,
	// 		WebhookURL: getWebhookURL(),
	// 		Email:      email,
	// 		Proxy:      getProxy(),
	// 		Billing: wearestrap.Address{
	// 			First:   firstName,
	// 			Last:    lastName,
	// 			Address: address,
	// 			City:    city,
	// 			Zip:     zip,
	// 			Country: country,
	// 			Phone:   phone,
	// 		},
	// 	}
	// 	go wearestrap.Run(input, taskID, &runningTasks)
	// 	break

	case "JD_FE":
		input := meshdesktop.Input{
			MonitorInput: searchInput,
			MonitorDelay: monitorDelay,
			ErrorDelay:   retryDelay,
			Size:         size,
			Profile:      profile,
			Region:       region,
			WebhookURL:   config.GetWebhookURL(),
		}
		go meshdesktop.Run(input, taskID, &runningTasks)
		break

	default:
		color.Red("[Row " + strconv.Itoa(taskID+1) + "] Invalid Site: '" + site + "'")
	}
}
