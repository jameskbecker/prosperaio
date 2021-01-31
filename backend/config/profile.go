package config

import (
	"os"
	"path"
	"strconv"
	"strings"

	"github.com/fatih/color"
)

//ProfileFieldCount ...
const ProfileFieldCount = 23

//Profile ...
type Profile struct {
	Name         string  `json:"Name"`
	Email        string  `json:"Email"`
	Phone        string  `json:"Phone"`
	SameShipping bool    `json:"SameShipping"`
	Billing      Address `json:"Billing"`
	Shipping     Address `json:"Shipping"`
}

//Address ...
type Address struct {
	FirstName string `json:"FirstName"`
	LastName  string `json:"LastName"`
	Address1  string `json:"Address1"`
	Address2  string `json:"Address2"`
	PostCode  string `json:"PostCode"`
	City      string `json:"City"`
	Country   string `json:"Country"`
	State     string `json:"State"`
}

//Card ...
type Card struct {
	Holder   string
	Number   int
	ExpMonth int
	ExpYear  int
}

//LoadProfiles ...
func LoadProfiles() map[string]Profile {
	profiles := map[string]Profile{}
	homedir, _ := os.UserHomeDir()
	configFolder := path.Join(homedir, "ProsperAIO")
	data, err := LoadCSV(path.Join(configFolder, "profiles.csv"), ProfileFieldCount)
	if err != nil {
		color.Red("Error: " + err.Error())
		os.Exit(0)
	}
	profiles = stringToProfileSlice(data)

	return profiles
}

func stringToProfileSlice(data [][]string) map[string]Profile {
	profiles := map[string]Profile{}
	for _, v := range data {
		profile := Profile{
			Name: strings.TrimSpace(v[0]),
			Billing: Address{
				FirstName: strings.TrimSpace(v[1]),
				LastName:  strings.TrimSpace(v[2]),
				PostCode:  strings.TrimSpace(v[3]),
				City:      strings.TrimSpace(v[4]),
				Address1:  strings.TrimSpace(v[5]),
				Address2:  strings.TrimSpace(v[6]),
				Country:   strings.TrimSpace(v[7]),
			},
			Email: strings.TrimSpace(v[8]),
			Phone: strings.TrimSpace(v[9]),
		}
		profile.SameShipping, _ = strconv.ParseBool(strings.TrimSpace(v[10]))
		if !profile.SameShipping {
			profile.Shipping = Address{
				FirstName: strings.TrimSpace(v[15]),
				LastName:  strings.TrimSpace(v[16]),
				PostCode:  strings.TrimSpace(v[17]),
				City:      strings.TrimSpace(v[18]),
				Address1:  strings.TrimSpace(v[19]),
				Address2:  strings.TrimSpace(v[20]),
				Country:   strings.TrimSpace(v[21]),
			}
		}
		profiles[profile.Name] = profile
	}

	return profiles
}
