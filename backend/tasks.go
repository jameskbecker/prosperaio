package main

import (
	"prosperaio/config"
	"prosperaio/sites/meshdesktop"
	"prosperaio/sites/wearestrap"
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
	paymentMethod := t.PaymentMethod

	_, ok := profiles[profileName]
	if !ok {

	}
	profile := profiles[profileName]

	if mode != "" {
		site += "_" + mode
	}

	input := config.TaskInput{
		ID:            taskID,
		MonitorInput:  searchInput,
		Region:        region,
		Size:          size,
		Proxy:         getProxy(),
		PaymentMethod: paymentMethod,
		WebhookURL:    config.GetWebhookURL(),
		Profile:       profile,
		MonitorDelay:  monitorDelay,
		RetryDelay:    retryDelay,
		WG:            &runningTasks,
	}

	switch strings.ToUpper(site) {
	case "JD_FE":
		go meshdesktop.Run(input)
		break
	case "WEARESTRAP":
		go wearestrap.Run(input)
		break

	default:
		color.Red("Invalid Site: '" + site + "'")
	}
}
