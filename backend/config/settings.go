package config

import (
	"encoding/json"
	"os"
	"path"
)

//SettingsFieldCount ...
const SettingsFieldCount = 3

//Settings ...
type Settings struct {
	Key          string `json:"key"`
	WebhookURL   string `json:"webhookUrl"`
	MonitorDelay int    `json:"monitorDelay"`
	RetryDelay   int    `json:"retryDelay"`
}

//LoadSettings ...
func LoadSettings() (data Settings, err error) {
	homedir, _ := os.UserHomeDir()
	settingsPath := path.Join(homedir, "ProsperAIO", "settings.json")

	settingsFile, err := os.Open(settingsPath)
	if err != nil {
		return
	}

	json.NewDecoder(settingsFile).Decode(&data)
	return
}
