package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

func (t *task) initGuest() error {
	uri := "https://www.jdsports.co.uk/checkout/guest/"
	form := guestForm(t.email)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return err
	}
	req.Header.Set("accept", "*/*")
	req.Header.Set("x-requested-with", "XMLHttpRequest")
	req.Header.Set("user-agent", t.useragent)
	req.Header.Set("content-type", "application/json")
	req.Header.Set("origin", t.baseURL)
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("referer", t.baseURL+"/checkout/login/")
	//req.Header.Set("accept-encoding	gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	body := messageResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	switch strings.ToLower(body.Message) {
	case "success":
		t.log.Debug("Guest EP Message: " + body.Message)
		return nil

	case "email address is not valid.":
		return errors.New("Invalid email address")
	default:
		return errors.New("Unexpected guest start stage response: " + "'" + body.Message + "'")
	}

}

func (t *task) addAddress() error {
	path := "/myaccount/addressbook/add/"
	reqBody, err := json.Marshal(address{})
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", t.baseURL+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return err
	}

	for _, v := range t.defaultHeaders() {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", "")

	return nil
}

func (t *task) updateDeliveryAddressAndMethod() error {
	path := "/checkout/updateDeliveryAddressAndMethod/ajax/"
	reqBody, err := json.Marshal(deliveryUpdate{})
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", t.baseURL+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return err
	}

	for _, v := range t.defaultHeaders() {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", "")

	return nil
}

func (t *task) updateBillingAddress() error {
	path := "/checkout/updateBillingAddress/ajax/"
	reqBody, err := json.Marshal(billingUpdate{})
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", t.baseURL+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return err
	}

	for _, v := range t.defaultHeaders() {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", "")
	return nil
}

func (t *task) submitCheckout() {
	path := "/checkout/payment/?paySelect=paypalViaHosted"
	http.NewRequest("POST", t.baseURL+path, nil)
}
