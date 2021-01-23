package mesh

import (
	"bytes"
	"encoding/json"
	"net/http"
)

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
