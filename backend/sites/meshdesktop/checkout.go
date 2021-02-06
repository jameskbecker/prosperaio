package meshdesktop

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"prosperaio/utils/client"
	"strings"
	"time"
)

func (t *task) addAddress() {
	for {
		t.log.Warn("Checking Out [1/3]")
		body, err := t._postAddressReq()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		err = t._handleAddressRes(body)
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
	}
}

func (t *task) addShipping() {
	for {
		t.log.Warn("Checking Out [2/3]")
		body, err := t._postShippingReq()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}

		err = t._handleShippingRes(body)
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
	}
}

func (t *task) updateBilling() {
	for {
		t.log.Warn("Checking Out [3/3]")
		data, err := t._postUpdateBillingReq()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}

		err = t._handleUpdateBillingRes(data)
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
	}
}

func (t *task) submitOrder() {
	for {
		t.log.Warn("Submitting Order")
		err := t._postSubmitOrderReq()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
	}
}

// func (t *task) getCheckoutURL() {
// 	for {
// 		t.log.Debug("Getting Paypal Url")
// 		err := t._getPPURLReq()
// 		if err != nil {
// 			t.log.Error(err.Error())
// 			time.Sleep(t.retryDelay)
// 			continue
// 		}
// 		break
// 	}
// }

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

func (t *task) _postAddressReq() (body io.ReadCloser, err error) {
	uri := t.baseURL.String() + "/myaccount/addressbook/add/"
	form := addressBookAddForm(t.profile)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return
	}

	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	req.Header.Set("referer", t.baseURL.String()+"/checkout/delivery/")

	res, err := t.client.Do(req)
	if err != nil {
		return
	}

	body, err = client.Decompress(res)
	return
}

func (t *task) _handleAddressRes(data io.ReadCloser) (err error) {
	body := addressResponse{}
	json.NewDecoder(data).Decode(&body)

	if body.Error != nil {
		err = errors.New("[C1] Response error: " + (*body.Error).Info)
		return
	}

	if body.ID == "" {
		bodyB, _ := ioutil.ReadAll(data)
		fmt.Println(string(bodyB))
		err = errors.New("[C1] Received no address ID")
		return
	}
	t.addressID = body.ID
	return
}

type deliveryUpdate struct {
	AddressID    string   `json:"addressId"`
	MethodID     string   `json:"methodId"`
	DeliverySlot struct{} `json:"deliverySlot"`
}

func (t *task) _postShippingReq() (body io.ReadCloser, err error) {
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

	res, err := t.client.Do(req)
	if err != nil {
		return
	}
	body, err = client.Decompress(res)
	return
}

func (t *task) _handleShippingRes(data io.ReadCloser) error {
	body := messageResponse{}
	json.NewDecoder(data).Decode(&body)

	if body.Error != nil {
		err := errors.New("[C2] Response error: " + (*body.Error).Info)
		return err
	}

	if strings.ToLower(body.Message) != "success" {
		bodyS, _ := ioutil.ReadAll(data)
		fmt.Println(string(bodyS))
		err := errors.New("[C2] Unexpected response message: " + body.Message)
		return err
	}

	return nil
}

type billingUpdate struct {
	EditAddressID string `json:"editAddressID"`
}

func (t *task) _postUpdateBillingReq() (data io.ReadCloser, err error) {
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

	res, err := t.client.Do(req)
	if err != nil {
		return
	}

	data, err = client.Decompress(res)
	return
}

func (t *task) _handleUpdateBillingRes(data io.ReadCloser) error {
	body := messageResponse{}
	json.NewDecoder(data).Decode(&body)

	if body.Error != nil {
		err := errors.New("[C3] Response error: " + (*body.Error).Info)
		return err
	}

	if strings.ToLower(body.Message) != "success" {
		bodyS, _ := ioutil.ReadAll(data)
		fmt.Println(string(bodyS))
		err := errors.New("[C3] Unexpected response message: " + body.Message)
		return err
	}
	return nil
}

func (t *task) _postSubmitOrderReq() error {
	path := "/checkout/payment/?paySelect=paypalViaHosted"
	req, err := http.NewRequest("GET", t.baseURL.String()+path, nil)
	if err != nil {
		return err
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

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	if res.StatusCode < 300 || res.StatusCode > 399 {
		return errors.New("STATUS NOT 3XX")
	}

	checkoutURL := res.Header.Get("location")
	if checkoutURL == "" {
		return errors.New("NO RESPONSE LOCATION HEADER")
	}
	//t.log.Debug("Checkout URL: " + checkoutURL)
	t.ppURL = base64.URLEncoding.EncodeToString([]byte(checkoutURL))
	//t.adyenURL = checkoutURL
	return nil
}

// func (t *task) _getPPURLReq() error {
// 	req, err := http.NewRequest("GET", t.adyenURL, nil)
// 	if err != nil {
// 		return err
// 	}

// 	req.Header.Set("Host", "live.adyen.com")
// 	req.Header.Set("Connection", "keep-alive")
// 	req.Header.Set("Upgrade-Insecure-Requests", "1")
// 	req.Header.Set("User-Agent", t.useragent)
// 	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
// 	req.Header.Set("Sec-Fetch-Site", "cross-site")
// 	req.Header.Set("Sec-Fetch-Mode", "navigate")
// 	req.Header.Set("Sec-Fetch-User", "?1")
// 	req.Header.Set("Sec-Fetch-Dest", "document")
// 	req.Header.Set("Referer", t.baseURL.String())
// 	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
// 	req.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

// 	res, err := t.client.Do(req)
// 	if err != nil {
// 		return err
// 	}

// 	location := res.Header.Get("location")
// 	if location == "" {
// 		return errors.New("No PP Location")
// 	}

// 	t.ppURL = base64.URLEncoding.EncodeToString([]byte(location))

// 	return nil
// }
