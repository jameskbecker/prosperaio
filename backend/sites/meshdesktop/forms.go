package meshdesktop

import (
	"encoding/json"
	"strings"

	"prosperaio/config"
	"prosperaio/utils"
)

//Using pointers to show type as null
type atcForm struct {
	Customisations          bool         `json:"customisations"`
	CartPosition            *interface{} `json:"cartPosition"`
	RecaptchaResponse       interface{}  `json:"recaptchaResponse"` // -> false or capRespString
	CartProductNotification *interface{} `json:"cartProductNotification"`
	QuantityToAdd           int          `json:"quantityToAdd"`
}

func buildATCForm() ([]byte, error) {
	return json.Marshal(atcForm{
		Customisations:          false,
		CartPosition:            nil,
		RecaptchaResponse:       false,
		CartProductNotification: nil,
		QuantityToAdd:           1,
	})
}

func guestForm(email string) []byte {
	return []byte(`{"email":"` + email + `"}`)
}

type address struct {
	SameDelivery       bool   `json:"useDeliveryAsBilling"`
	Country            string `json:"country"`
	Locale             string `json:"locale"`
	FirstName          string `json:"firstName"`
	LastName           string `json:"lastName"`
	Phone              string `json:"phone"`
	Address1           string `json:"address1"`
	Address2           string `json:"address2"`
	Town               string `json:"town"`
	County             string `json:"county"`
	Postcode           string `json:"postcode"`
	AddressPredict     string `json:"addressPredict"`
	SetOnCart          string `json:"setOnCart"`
	AddressPredictflag string `json:"addressPredictflag"`
}

func addressBookAddForm(profile config.Profile) []byte {
	countryCode := strings.ToLower(profile.Billing.Country)
	country := utils.GetCountryName(countryCode) + "|" + countryCode
	form := address{
		SameDelivery:       true,
		Country:            country,
		Locale:             "",
		FirstName:          profile.Billing.FirstName,
		LastName:           profile.Billing.LastName,
		Phone:              profile.Phone,
		Address1:           profile.Billing.Address1,
		Address2:           profile.Billing.Address2,
		Town:               profile.Billing.City,
		County:             "",
		Postcode:           profile.Billing.PostCode,
		AddressPredict:     "",
		SetOnCart:          "deliveryAddressID",
		AddressPredictflag: "false",
	}
	formBytes, _ := json.Marshal(form)

	return formBytes
}
