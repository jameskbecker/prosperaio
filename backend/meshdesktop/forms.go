package meshdesktop

import (
	"encoding/json"
	"net/url"
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

func addressBookAddForm() []byte {
	form := address{
		SameDelivery:       true,
		Country:            "",
		Locale:             "",
		FirstName:          "",
		LastName:           "",
		Phone:              "",
		Address1:           "",
		Address2:           "",
		Town:               "",
		County:             "",
		Postcode:           "",
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
