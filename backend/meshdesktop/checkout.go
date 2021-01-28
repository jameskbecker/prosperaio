package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
)

func (t *task) addAddress() error {
	t.log.Warn("Checking Out [1/3]")
	path := "/myaccount/addressbook/add/"
	form := addressBookAddForm(t.profile)
	req, err := http.NewRequest("POST", t.baseURL+path, bytes.NewBuffer(form))
	if err != nil {
		return err
	}

	for _, v := range defaultHeaders(t.useragent, t.baseURL) {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", t.baseURL+"/checkout/delivery/")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	body := addressResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	t.addressID = body.ID
	return nil
}

func (t *task) updateDeliveryAddressAndMethod() error {
	t.log.Warn("Checking Out [2/3]")
	path := "/checkout/updateDeliveryAddressAndMethod/ajax/"
	reqBody, err := json.Marshal(deliveryUpdate{
		AddressID: t.addressID,
		MethodID:  t.shippingMethodID,
	})
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", t.baseURL+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return err
	}

	for _, v := range defaultHeaders(t.useragent, t.baseURL) {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", t.baseURL+"/checkout/delivery/")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	body := messageResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	if strings.ToLower(body.Message) != "success" {
		err := errors.New("[C2] Unexpected response message: " + body.Message)
		return err
	}

	return nil
}

func (t *task) updateBillingAddress() error {
	t.log.Warn("Checking Out [3/3]")
	path := "/checkout/updateBillingAddress/ajax/"
	reqBody, err := json.Marshal(billingUpdate{
		EditAddressID: t.addressID,
	})
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", t.baseURL+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return err
	}

	for _, v := range defaultHeaders(t.useragent, t.baseURL) {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", t.baseURL+"/checkout/billing/")
	return nil
}

func (t *task) submitCheckout() {
	t.log.Warn("Submitting Order")
	path := "/checkout/payment/?paySelect=paypalViaHosted"
	http.NewRequest("POST", t.baseURL+path, nil)
}
