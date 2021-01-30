package config

import (
	"os"
	"path"
	"strconv"
	"time"

	"github.com/fatih/color"
)

//SettingsFieldCount ...
const SettingsFieldCount = 3

//Settings ...
type Settings struct {
	WebhookURL   string
	MonitorDelay string
	RetryDelay   string
}

//GetWebhookURL ...
func GetWebhookURL() string {
	homedir, _ := os.UserHomeDir()
	basedir := path.Join(homedir, "ProsperAIO")
	data, err := LoadCSV(path.Join(basedir, "settings.csv"), SettingsFieldCount)
	if err != nil {
		color.Red("Error: " + err.Error())
	}

	if len(data) < 1 || len(data[0]) < 1 {
		color.Red("Error: invalid settings.csv format")
	}
	webhookURL := data[0][0]

	if webhookURL == "" {
		color.Red("Error: no webhook URL found in settings.csv")
		return ""
	}

	return webhookURL
}

//LoadDelays ...
func LoadDelays() (time.Duration, time.Duration) {
	homedir, _ := os.UserHomeDir()
	basedir := path.Join(homedir, "ProsperAIO")
	records, err := LoadCSV(path.Join(basedir, "settings.csv"), SettingsFieldCount)
	if err != nil {
		color.Red("Error: " + err.Error())
	}

	if len(records) < 1 || len(records[0]) < 1 {
		color.Red("Error: invalid settings.csv format")
	}
	monitorDelayStr := records[0][1]
	retryDelayStr := records[0][2]

	monitorDelay, err := strconv.Atoi(monitorDelayStr)
	if err != nil {
		color.Red("Error: invalid monitor delay. Using default.")
		monitorDelay = 1000
	}

	retryDelay, err := strconv.Atoi(retryDelayStr)
	if err != nil {
		color.Red("Error: invalid retry delay. Using default.")
		retryDelay = 1000
	}

	mDuration := time.Duration(int64(monitorDelay)) * time.Millisecond
	rDuration := time.Duration(int64(retryDelay)) * time.Millisecond

	return mDuration, rDuration
}
