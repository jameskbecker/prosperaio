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

func accountAndAddress() url.Values {
	form := url.Values{}

	form.Set("modifyAccountAndAddress", "")
	form.Set("ajax_request", "1")
	form.Set("action", "modifyAccountAndAddress")
	form.Set("trigger", "thecheckout-confirm") //"thecheckout-address-invoice"
	form.Set("account", account("").Encode())
	form.Set("invoice", address(Address{}).Encode())
	form.Set("delivery", "")
	form.Set("passwordVisible", "0")
	form.Set("passwordRequired", "0")
	form.Set("invoiceVisible", "1")
	form.Set("deliveryVisible", "0")
	form.Set("token", "c45c161fb8309f28f326322bb88d8a12")

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

func account(email string) url.Values {
	form := url.Values{}

	form.Set("back", "")
	form.Set("id_address", "")
	form.Set("token", "c45c161fb8309f28f326322bb88d8a12")
	form.Set("email", email)
	form.Set("psgdpr", "1")

	return form
}

func checkEmail() url.Values {
	form := url.Values{}

	form.Set("ajax_request", "1")
	form.Set("action", "checkEmail")
	form.Set("email", "johnsmith@gmail.com")
	form.Set("token", "c45c161fb8309f28f326322bb88d8a12")

	return form
}

func gdpr() url.Values {
	form := url.Values{}

	form.Set("ajax_request", "1")
	form.Set("action", "modifyCheckboxOption")
	form.Set("name", "psgdpr")
	form.Set("isChecked", "true")
	form.Set("token", "688530dc4199686b6abe5b18ee25f4e9")

	return form
}

func terms() url.Values {
	form := url.Values{}

	form.Set("ajax_request", "1")
	form.Set("action", "modifyCheckboxOption")
	form.Set("name", "conditions_to_approve[terms-and-conditions]")
	form.Set("isChecked", "true")
	form.Set("token", "688530dc4199686b6abe5b18ee25f4e9")

	return form
}
