package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"prosperaio/utils/client"
	"strings"
)

type apiError struct {
	Message string `json:"message"`
	Info    string `json:"info"`
}

type messageResponse struct {
	Message string    `json:"message"`
	Error   *apiError `json:"error"`
}

type addressResponse struct {
	IDPrimary string    `json:"id"`
	ID        string    `json:"ID"`
	Error     *apiError `json:"error"`
}

func (t *task) addAddress() {
	t.log.Warn("Checking Out [1/3]")
	res, err := t._postAddressReq()
	if err != nil {
		t.retry(err, t.addAddress)
		return
	}
	err = t._handleAddressRes(res)
	if err != nil {
		t.retry(err, t.addAddress)
	}
}

func (t *task) _postAddressReq() (res *http.Response, err error) {
	uri := t.baseURL.String() + "/myaccount/addressbook/add/"
	form := addressBookAddForm(t.profile)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return
	}

	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	req.Header.Set("referer", t.baseURL.String()+"/checkout/delivery/")

	res, err = t.client.Do(req)
	return
}

func (t *task) _handleAddressRes(res *http.Response) error {
	defer res.Body.Close()
	client.Decompress(res)
	body := addressResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	if body.Error != nil {
		return errors.New("[C1] Response error: " + (*body.Error).Info)
	}

	if body.ID == "" {
		bodyB, _ := ioutil.ReadAll(res.Body)
		fmt.Println(string(bodyB))
		return errNoAddrID
	}
	t.addressID = body.ID
	return nil
}

type deliveryUpdate struct {
	AddressID    string   `json:"addressId"`
	MethodID     string   `json:"methodId"`
	DeliverySlot struct{} `json:"deliverySlot"`
}

func (t *task) addShipping() {
	t.log.Warn("Checking Out [2/3]")
	res, err := t._postShippingReq()
	if err != nil {
		t.retry(err, t.addShipping)
		return
	}

	err = t._handleShippingRes(res)
	if err != nil {
		t.retry(err, t.addShipping)
	}
}

func (t *task) _postShippingReq() (res *http.Response, err error) {
	path := "/checkout/updateDeliveryAddressAndMethod/ajax/"
	reqBody, err := json.Marshal(deliveryUpdate{
		AddressID: t.addressID,
		MethodID:  t.shippingMethodID,
	})
	if err != nil {
		return
	}
	req, err := http.NewRequest("POST", t.baseURL.String()+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return
	}

	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	req.Header.Set("referer", t.baseURL.String()+"/checkout/delivery/")
	return t.client.Do(req)
}

func (t *task) _handleShippingRes(res *http.Response) error {
	defer res.Body.Close()
	client.Decompress(res)
	body := messageResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	if body.Error != nil {
		err := errors.New("[C2] Response error: " + (*body.Error).Info)
		return err
	}

	if strings.ToLower(body.Message) != "success" {
		bodyS, _ := ioutil.ReadAll(res.Body)
		fmt.Println(string(bodyS))
		err := errors.New("[C2] Unexpected response message: " + body.Message)
		return err
	}

	return nil
}

type billingUpdate struct {
	EditAddressID string `json:"editAddressID"`
}

func (t *task) updateBilling() {
	t.log.Warn("Checking Out [3/3]")
	res, err := t._postUpdateBillingReq()
	if err != nil {
		t.retry(err, t.updateBilling)
		return
	}

	err = t._handleUpdateBillingRes(res)
	if err != nil {
		t.retry(err, t.updateBilling)
	}
}

func (t *task) _postUpdateBillingReq() (res *http.Response, err error) {
	path := "/checkout/updateBillingAddress/ajax/"
	reqBody, err := json.Marshal(billingUpdate{
		EditAddressID: t.addressID,
	})
	if err != nil {
		return
	}
	req, err := http.NewRequest("POST", t.baseURL.String()+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return
	}

	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	req.Header.Set("referer", t.baseURL.String()+"/checkout/billing/")

	res, err = t.client.Do(req)
	return
}

func (t *task) _handleUpdateBillingRes(res *http.Response) error {
	defer res.Body.Close()
	client.Decompress(res)
	body := messageResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	if body.Error != nil {
		err := errors.New("[C3] Response error: " + (*body.Error).Info)
		return err
	}

	if strings.ToLower(body.Message) != "success" {
		bodyS, _ := ioutil.ReadAll(res.Body)
		fmt.Println(string(bodyS))
		err := errors.New("[C3] Unexpected response message: " + body.Message)
		return err
	}
	return nil
}

func (t *task) submitOrder() {
	t.log.Warn("Submitting Order")
	res, err := t._postSubmitOrderReq()
	if err != nil {
		t.retry(err, t.submitOrder)
		return
	}

	err = t._handleSubmitOrderRes(res)
	if err != nil {
		t.retry(err, t.submitOrder)
	}
}

func (t *task) _postSubmitOrderReq() (*http.Response, error) {
	path := "/checkout/payment/?paySelect=paypalViaHosted"
	req, err := http.NewRequest("GET", t.baseURL.String()+path, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", t.useragent)
	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("sec-fetch-dest", "document")
	req.Header.Set("referer", t.baseURL.String()+"/checkout/billing/")
	req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	req.Header.Set("referer", t.baseURL.String()+"/checkout/billing/")

	return t.client.Do(req)
}

func (t *task) _handleSubmitOrderRes(res *http.Response) error {
	defer res.Body.Close()
	if res.StatusCode <= 299 || res.StatusCode >= 400 {
		return errNoRedirect
	}

	redirectURL := res.Header.Get("location")
	switch {
	case redirectURL == "":
		return errNoRedirect

	case strings.Contains(redirectURL, "productOutOfStock"):
		return errOOS

	case strings.Contains(redirectURL, "paypal"):
		t.ppURL = redirectURL
		return nil
	}

	return errors.New("Unexpected Adyen Redirect: " + redirectURL)
}
