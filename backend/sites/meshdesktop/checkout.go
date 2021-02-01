package meshdesktop

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
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

func (t *task) addAddress() error {
	uri := t.baseURL + "/myaccount/addressbook/add/"
	form := addressBookAddForm(t.profile)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return err
	}

	setDefaultHeaders(req, t.useragent, t.baseURL)
	req.Header.Set("referer", t.baseURL+"/checkout/delivery/")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	bodyD, err := client.Decompress(res)
	if err != nil {
		return err
	}
	bodyB, _ := ioutil.ReadAll(bodyD)

	body := addressResponse{}
	json.Unmarshal(bodyB, &body)

	if body.Error != nil {
		err := errors.New("[C1] Response error: " + (*body.Error).Info)
		return err
	}

	if body.ID == "" {
		bodyB, _ := ioutil.ReadAll(res.Body)
		fmt.Println(string(bodyB))
		return errors.New("[C1] Received no address ID")
	}
	t.addressID = body.ID
	return nil
}

type deliverySlot struct{}
type deliveryUpdate struct {
	AddressID    string       `json:"addressId"`
	MethodID     string       `json:"methodId"`
	DeliverySlot deliverySlot `json:"deliverySlot"`
}

func (t *task) updateDeliveryAddressAndMethod() error {
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

	setDefaultHeaders(req, t.useragent, t.baseURL)
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

	if body.Error != nil {
		err := errors.New("[C2] Response error: " + (*body.Error).Info)
		return err
	}

	if strings.ToLower(body.Message) != "success" {
		bodyS, _ := ioutil.ReadAll(bodyD)
		fmt.Println(string(bodyS))
		err := errors.New("[C2] Unexpected response message: " + body.Message)
		return err
	}

	return nil
}

type billingUpdate struct {
	EditAddressID string `json:"editAddressID"`
}

func (t *task) updateBillingAddress() error {
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

	setDefaultHeaders(req, t.useragent, t.baseURL)
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

	if body.Error != nil {
		err := errors.New("[C3] Response error: " + (*body.Error).Info)
		return err
	}

	if strings.ToLower(body.Message) != "success" {
		bodyS, _ := ioutil.ReadAll(bodyD)
		fmt.Println(string(bodyS))
		err := errors.New("[C3] Unexpected response message: " + body.Message)
		return err
	}
	return nil
}

func (t *task) submitCheckout() error {
	path := "/checkout/payment/?paySelect=paypalViaHosted"
	req, err := http.NewRequest("GET", t.baseURL+path, nil)
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
	req.Header.Set("referer", t.baseURL+"/checkout/billing/")
	req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	req.Header.Set("referer", t.baseURL+"/checkout/billing/")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	if res.StatusCode != 302 {
		return errors.New("STATUS NOT 302")
	}

	checkoutURL := res.Header.Get("location")
	if checkoutURL == "" {
		return errors.New("NO RESPONSE LOCATION HEADER")
	}
	t.adyenURL = checkoutURL
	return nil
}

func (t *task) getPPURL() error {
	req, err := http.NewRequest("GET", t.adyenURL, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Host", "live.adyen.com")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Upgrade-Insecure-Requests", "1")
	req.Header.Set("User-Agent", t.useragent)
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("Sec-Fetch-Site", "cross-site")
	req.Header.Set("Sec-Fetch-Mode", "navigate")
	req.Header.Set("Sec-Fetch-User", "?1")
	req.Header.Set("Sec-Fetch-Dest", "document")
	req.Header.Set("Referer", t.baseURL)
	req.Header.Set("Accept-Encoding", "gzip, deflate, br")
	req.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	location := res.Header.Get("location")
	if location == "" {
		return errors.New("No PP Location")
	}

	t.ppURL = base64.URLEncoding.EncodeToString([]byte(location))

	return nil
}

func (t *task) checkoutRoutine() error {
	err := t.initGuest()
	if err != nil {
		return err
	}
	t.log.Warn("Checking Out [1/3]")
	err = t.addAddress()
	if err != nil {
		return err
	}
	t.log.Warn("Checking Out [2/3]")
	err = t.updateDeliveryAddressAndMethod()
	if err != nil {
		return err
	}
	t.log.Warn("Checking Out [3/3]")
	err = t.updateBillingAddress()
	if err != nil {
		return err
	}
	t.log.Warn("Submitting Order")
	err = t.submitCheckout()
	if err != nil {
		return err
	}

	t.log.Debug("Getting Paypal Url")
	err = t.getPPURL()
	if err != nil {
		return err
	}

	t.log.Debug("Building Webhook URL")
	cookieURL, err := url.Parse(t.baseURL)
	if err != nil {
		return err
	}
	cookies, err := client.GetJSONCookies(cookieURL, t.client)
	if err != nil {
		return err
	}

	t.webhookURL = buildCheckoutURL(cookies, t.ppURL)
	return nil
}

func buildCheckoutURL(cookies string, redirURL string) string {
	fmt.Println("building checkout url")
	qs := url.Values{}
	qs.Set("cookie", cookies)
	qs.Set("redirectUrl", redirURL)

	return "http://localhost/extension.prosperaio.com?" + qs.Encode()
}
