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
	_, ok := profiles[t.ProfileName]
	if !ok {

	}
	profile := profiles[t.ProfileName]
	site := t.Site
	if t.Mode != "" {
		site += "_" + t.Mode
	}

	input := config.TaskInput{
		ID:            taskID,
		MonitorInput:  t.MonitorInput,
		Region:        t.Region,
		Size:          t.Size,
		Proxy:         getProxy(),
		PaymentMethod: t.PaymentMethod,
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
