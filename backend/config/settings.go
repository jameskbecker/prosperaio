package config

//SettingsFieldCount ...
const SettingsFieldCount = 3

//Settings ...
type Settings struct {
	WebhookURL   string
	MonitorDelay string
	RetryDelay   string
}
