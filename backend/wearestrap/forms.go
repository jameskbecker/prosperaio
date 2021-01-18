package wearestrap

import "net/url"

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
	form.Set("account", account().Encode())
	form.Set("invoice", address().Encode())
	form.Set("delivery", "")
	form.Set("passwordVisible", "0")
	form.Set("passwordRequired", "0")
	form.Set("invoiceVisible", "1")
	form.Set("deliveryVisible", "0")
	form.Set("token", "c45c161fb8309f28f326322bb88d8a12")

	return form
}

func address() url.Values {
	form := url.Values{}

	form.Set("firstname", "Johan")
	form.Set("lastname", "Smfith")
	form.Set("address1", "403+Kingston+Hall+Rd")
	form.Set("city", "Kingston+Upon+Thames")
	form.Set("postcode", "KT12BP")
	form.Set("id_country", "17")
	form.Set("phone", "07913920398")

	return form
}

func account() url.Values {
	form := url.Values{}

	form.Set("back", "")
	form.Set("id_address", "")
	form.Set("token", "c45c161fb8309f28f326322bb88d8a12")
	form.Set("email", "johnsmith@gmail.com")
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
