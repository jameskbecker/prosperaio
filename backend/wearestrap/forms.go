package wearestrap

import (
	"net/url"
	"strconv"
)

func atcForm(pData productData) url.Values {
	form := url.Values{}

	form.Set("token", pData.Token)
	form.Set("id_product", pData.PID)
	form.Set("id_customization", pData.CustID)
	form.Set("group[1]", pData.PVal)
	form.Set("qty", "1")
	form.Set("add", "1")
	form.Set("action", "update")

	return form
}

func (t *task) accountAndAddress() url.Values {
	form := url.Values{}

	form.Set("modifyAccountAndAddress", "")
	form.Set("ajax_request", "1")
	form.Set("action", "modifyAccountAndAddress")
	form.Set("trigger", "thecheckout-address-invoice") // "thecheckout-confirm"
	form.Set("account", account(t.email, t.token).Encode())
	form.Set("invoice", address(t.billing).Encode())
	form.Set("delivery", "")
	form.Set("passwordVisible", "0")
	form.Set("passwordRequired", "0")
	form.Set("invoiceVisible", "1")
	form.Set("deliveryVisible", "0")
	form.Set("token", t.token)

	return form
}

func address(a Address) url.Values {
	form := url.Values{}

	form.Set("firstname", a.First)
	form.Set("lastname", a.Last)
	form.Set("address1", a.Address)
	form.Set("city", a.City)
	form.Set("postcode", a.Zip)
	form.Set("id_country", strconv.Itoa(getCountryCode(a.Country)))
	form.Set("phone", a.Phone)

	return form
}

func account(email string, token string) url.Values {
	form := url.Values{}

	form.Set("back", "")
	form.Set("id_address", "")
	form.Set("token", token)
	form.Set("email", email)
	form.Set("psgdpr", "1")

	return form
}

func (t *task) atcSS() url.Values {
	form := url.Values{}

	form.Set("action", "add-to-cart")
	form.Set("id_product", t.pData.PID)
	form.Set("id_product_attribute", "")
	form.Set("id_customization", "0")

	return form

}

func paymentAndShipping(staticToken string) url.Values {
	form := url.Values{}

	form.Set("ajax_request", "1")
	form.Set("action", "getShippingAndPaymentBlocks")
	form.Set("token", staticToken)

	return form
}

func checkEmail(email string, token string) url.Values {
	form := url.Values{}

	form.Set("ajax_request", "1")
	form.Set("action", "checkEmail")
	form.Set("email", email)
	form.Set("token", token)

	return form
}

func gdpr(staticToken string) url.Values {
	form := url.Values{}

	form.Set("ajax_request", "1")
	form.Set("action", "modifyCheckboxOption")
	form.Set("name", "psgdpr")
	form.Set("isChecked", "true")
	form.Set("token", staticToken)

	return form
}

func terms(staticToken string) url.Values {
	form := url.Values{}

	form.Set("ajax_request", "1")
	form.Set("action", "modifyCheckboxOption")
	form.Set("name", "conditions_to_approve[terms-and-conditions]")
	form.Set("isChecked", "true")
	form.Set("token", staticToken)

	return form
}

func payment(staticToken string) url.Values {
	form := url.Values{}

	form.Set("optionId", "payment-option-2")
	form.Set("payment_fee", "0")
	form.Set("ajax_request", "1")
	form.Set("action", "selectPaymentOption")
	form.Set("token", staticToken)

	return form
}
