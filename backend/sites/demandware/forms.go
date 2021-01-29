package demandware

import (
	"math/rand"
	"net/url"
	"time"
)

func (t *Task) cartForm() string {
	form := url.Values{}
	//option := `[{"optionId":"` + t.OptionID + `","selectedValueId":"` + t.ValueID + `"}]`
	option := ""
	form.Set("pid", t.BPID)
	form.Set("options", option)
	form.Set("quantity", "1")

	return form.Encode()
}

func (t *Task) registrationForm() string {
	form := url.Values{}
	password := randomString(10)

	form.Set("dwfrm_profile_register_title", t.Profile.Shipping.Title)
	form.Set("dwfrm_profile_register_firstName", t.Profile.Shipping.FirstName)
	form.Set("dwfrm_profile_register_lastName", t.Profile.Shipping.LastName)
	form.Set("dwfrm_profile_register_email", t.Profile.Email)
	form.Set("dwfrm_profile_register_emailConfirm", t.Profile.Phone)
	form.Set("dwfrm_profile_register_password", string(password))
	form.Set("dwfrm_profile_register_passwordConfirm", string(password))
	form.Set("dwfrm_profile_register_phone", t.Profile.Phone) //Optional
	form.Set("dwfrm_profile_register_birthday", "")           //Optional
	form.Set("dwfrm_profile_register_acceptPolicy", "true")
	form.Set("csrf_token", "")

	return form.Encode()
}

func (t *Task) shippingForm() string {
	form := url.Values{}
	shipping := t.Profile.Shipping
	billing := t.Profile.Billing

	form.Set("originalShipmentUUID", t.ShipmentID)
	form.Set("shipmentUUID", t.ShipmentID)
	form.Set("dwfrm_shipping_shippingAddress_shippingMethodID", "home-delivery")
	form.Set("address-selector", "new")

	form.Set("dwfrm_shipping_shippingAddress_addressFields_title", shipping.Title)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_firstName", shipping.FirstName)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_lastName", shipping.LastName)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_postalCode", shipping.PostalCode)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_city", shipping.City)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_street", shipping.Street)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_suite", shipping.Suite)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_address1", shipping.Address1)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_address2", shipping.Address2)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_phone", t.Profile.Phone)
	form.Set("dwfrm_shipping_shippingAddress_addressFields_countryCode", shipping.CountryCode)
	form.Set("dwfrm_shipping_shippingAddress_shippingAddressUseAsBillingAddress", "true")

	form.Set("dwfrm_billing_billingAddress_addressFields_title", billing.Title)
	form.Set("dwfrm_billing_billingAddress_addressFields_firstName", billing.FirstName)
	form.Set("dwfrm_billing_billingAddress_addressFields_lastName", billing.LastName)
	form.Set("dwfrm_billing_billingAddress_addressFields_postalCode", billing.PostalCode)
	form.Set("dwfrm_billing_billingAddress_addressFields_city", billing.City) // CHECK ADDRESS FORMATING
	form.Set("dwfrm_billing_billingAddress_addressFields_street", billing.Street)
	form.Set("dwfrm_billing_billingAddress_addressFields_suite", billing.Suite)
	form.Set("dwfrm_billing_billingAddress_addressFields_address1", billing.Address1)
	form.Set("dwfrm_billing_billingAddress_addressFields_address2", billing.Address1)
	form.Set("dwfrm_billing_billingAddress_addressFields_countryCode", billing.CountryCode)
	form.Set("dwfrm_billing_billingAddress_addressFields_phone", t.Profile.Phone)

	form.Set("dwfrm_contact_email", t.Profile.Email)
	form.Set("dwfrm_contact_phone", t.Profile.Phone)
	form.Set("csrf_token", t.CSRFToken)

	return form.Encode()
}

func (t *Task) paymentForm() string {
	form := url.Values{}
	form.Set("dwfrm_billing_paymentMethod", t.Profile.Payment.Method)
	form.Set("dwfrm_giftCard_cardNumber", "")
	form.Set("dwfrm_giftCard_pin", "")
	form.Set("csrf_token", t.CSRFToken)

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
