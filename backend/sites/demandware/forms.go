package demandware

import (
	"math/rand"
	"net/url"
	"time"
)

func (t *task) cartForm() string {
	form := url.Values{}
	//option := `[{"optionId":"` + t.OptionID + `","selectedValueId":"` + t.ValueID + `"}]`
	option := ""
	form.Set("pid", t.bPID)
	form.Set("options", option)
	form.Set("quantity", "1")

	return form.Encode()
}

func (t *task) registrationForm() string {
	form := url.Values{}
	password := randomString(10)

	form.Set("dwfrm_profile_register_title", "Herr")
	form.Set("dwfrm_profile_register_firstName", t.profile.Shipping.FirstName)
	form.Set("dwfrm_profile_register_lastName", t.profile.Shipping.LastName)
	form.Set("dwfrm_profile_register_email", t.profile.Email)
	form.Set("dwfrm_profile_register_emailConfirm", t.profile.Phone)
	form.Set("dwfrm_profile_register_password", string(password))
	form.Set("dwfrm_profile_register_passwordConfirm", string(password))
	form.Set("dwfrm_profile_register_phone", t.profile.Phone) //Optional
	form.Set("dwfrm_profile_register_birthday", "")           //Optional
	form.Set("dwfrm_profile_register_acceptPolicy", "true")
	form.Set("csrf_token", "")

	return form.Encode()
}

func (t *task) shippingForm() string {
	form := url.Values{}
	shipping := t.profile.Shipping
	billing := t.profile.Billing

	shippingPrefix := "dwfrm_shipping_shippingAddress_addressFields_"
	billingPrefix := "dwfrm_billing_billingAddress_addressFields_"

	form.Set("originalShipmentUUID", t.shipmentID)
	form.Set("shipmentUUID", t.shipmentID)
	form.Set(shippingPrefix+"shippingMethodID", "home-delivery")
	form.Set("address-selector", "new")

	form.Set(shippingPrefix+"title", "Herr")
	form.Set(shippingPrefix+"firstName", shipping.FirstName)
	form.Set(shippingPrefix+"lastName", shipping.LastName)
	form.Set(shippingPrefix+"postalCode", shipping.PostCode)
	form.Set(shippingPrefix+"city", shipping.City)
	form.Set(shippingPrefix+"street", shipping.Address1)
	form.Set(shippingPrefix+"suite", shipping.Address2)
	form.Set(shippingPrefix+"address1", shipping.Address1)
	form.Set(shippingPrefix+"address2", shipping.Address2)
	form.Set(shippingPrefix+"phone", t.profile.Phone)
	form.Set(shippingPrefix+"countryCode", getCountryCode())
	form.Set("dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress", "true")

	form.Set(billingPrefix+"title", "Herr")
	form.Set(billingPrefix+"firstName", billing.FirstName)
	form.Set(billingPrefix+"lastName", billing.LastName)
	form.Set(billingPrefix+"postalCode", billing.PostCode)
	form.Set(billingPrefix+"city", billing.City) // CHECK ADDRESS FORMATING
	form.Set(billingPrefix+"street", billing.Address1)
	form.Set(billingPrefix+"suite", billing.Address2)
	form.Set(billingPrefix+"address1", billing.Address1)
	form.Set(billingPrefix+"address2", billing.Address1)
	form.Set(billingPrefix+"countryCode", getCountryCode())
	form.Set(billingPrefix+"phone", t.profile.Phone)

	form.Set("dwfrm_contact_email", t.profile.Email)
	form.Set("dwfrm_contact_phone", t.profile.Phone)
	form.Set("csrf_token", t.csrfToken)

	return form.Encode()
}

func getCountryCode() string {
	return ""
}

func (t *task) paymentForm() string {
	form := url.Values{}
	form.Set("dwfrm_billing_paymentMethod", "")
	form.Set("dwfrm_giftCard_cardNumber", "")
	form.Set("dwfrm_giftCard_pin", "")
	form.Set("csrf_token", t.csrfToken)

	return form.Encode()
}

func randomString(length int) []byte {
	rand.Seed(time.Now().UnixNano())
	digits := "0123456789"
	specials := "~=+%^*/()[]{}/!@#$?|"
	all := "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"abcdefghijklmnopqrstuvwxyz" +
		digits + specials
	buf := make([]byte, length)
	buf[0] = digits[rand.Intn(len(digits))]
	buf[1] = specials[rand.Intn(len(specials))]
	for i := 2; i < length; i++ {
		buf[i] = all[rand.Intn(len(all))]
	}
	rand.Shuffle(len(buf), func(i, j int) {
		buf[i], buf[j] = buf[j], buf[i]
	})

	return buf
}
