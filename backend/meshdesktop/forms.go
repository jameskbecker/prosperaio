package meshdesktop

import (
	"encoding/json"
	"net/url"

	"../config"
)

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

func addressBookAddForm(profile config.Profile) []byte {
	form := address{
		SameDelivery:       true,
		Country:            "",
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

func paymentV3Form() string {
	form := url.Values{}
	form.Set("paySelect", "card")
	form.Set("isSafari", "true")

	return form.Encode()
}
