package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"prosperaio/client"
	"strings"
)

func (t *task) addAddress() error {
	t.log.Warn("Checking Out [1/3]")
	uri := t.baseURL + "/myaccount/addressbook/add/"
	form := addressBookAddForm(t.profile)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
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

	bodyD, err := client.Decompress(res)
	if err != nil {
		return err
	}
	bodyS, _ := ioutil.ReadAll(bodyD)

	body := addressResponse{}
	json.Unmarshal([]byte(bodyS), &body)

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
	bodyD, err := client.Decompress(res)
	if err != nil {
		return err
	}
	json.NewDecoder(bodyD).Decode(&body)

	if strings.ToLower(body.Message) != "success" {
		bodyS, _ := ioutil.ReadAll(bodyD)
		fmt.Println(string(bodyS))
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

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}
	body := messageResponse{}
	bodyD, err := client.Decompress(res)
	if err != nil {
		return err
	}
	json.NewDecoder(bodyD).Decode(&body)

	if strings.ToLower(body.Message) != "success" {
		bodyS, _ := ioutil.ReadAll(bodyD)
		fmt.Println(string(bodyS))
		err := errors.New("[C3] Unexpected response message: " + body.Message)
		return err
	}
	return nil
}

func (t *task) submitCheckout() (string, error) {
	t.log.Warn("Submitting Order")
	path := "/checkout/payment/?paySelect=paypalViaHosted"
	req, err := http.NewRequest("GET", t.baseURL+path, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", t.useragent)
	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("sec-fetch-dest", "document")
	req.Header.Set("referer", t.baseURL+"/checkout/billing/")
	req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	req.Header.Set("referer", t.baseURL+"/checkout/billing/")

	res, err := t.client.Do(req)
	if err != nil {
		return "", err
	}

	if res.StatusCode != 302 {
		return "", errors.New("STATUS NOT 302")
	}

	checkoutURL := res.Header.Get("location")
	if checkoutURL == "" {
		return "", errors.New("NO RESPONSE LOCATION HEADER")
	}
	return checkoutURL, nil
}

func (t *task) submitCheckoutCC() (string, error) {
	t.log.Warn("Submitting Order")
	path := "/checkout/paymentV3/"
	//REMEMBER FORM
	req, err := http.NewRequest("POST", t.baseURL+path, nil)
	if err != nil {
		return "", err
	}

	for _, v := range defaultHeaders(t.useragent, t.baseURL) {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", t.baseURL+"/checkout/billing/")

	res, err := t.client.Do(req)
	if err != nil {
		return "", err
	}

	body := map[string]string{}
	bodyD, err := client.Decompress(res)
	if err != nil {
		return "", err
	}
	json.NewDecoder(bodyD).Decode(&body)

	checkoutURL, exists := body[""]
	if !exists {
		bodyS, _ := ioutil.ReadAll(bodyD)
		fmt.Println(string(bodyS))
		return "", errors.New("Error getting checkout url")
	}
	return checkoutURL, nil
}
