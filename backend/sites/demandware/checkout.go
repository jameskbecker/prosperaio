package demandware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
)

//GetAuthenticationToken ...
func (t *Task) GetAuthenticationToken() error {
	t.warn("Getting Authentication Token")
	// form := url.Values{}
	// form.Set("hostname", "www.snipes.com")
	//ISML (
	form := []byte(`{"hostname":"www.snipes.com"}`)

	path := "/dw/shop/v20_10/baskets/bdcb-snse-DE-AT"
	url := t.BaseURL.String() + path

	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(form))
	if err != nil {
		return err
	}

	req.Header.Set("accept", "application/json, text/javascript, */*; q=0.01")
	req.Header.Set("x-requested-with", "XMLHttpRequest")
	req.Header.Set("user-agent", t.UserAgent)
	req.Header.Set("content-type", "application/json")
	req.Header.Set("origin", t.BaseURL.String())
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	//req.Header.Set("referer", t.BaseURL.String()+"/checkout?stage=shipping")
	//req.Header.Set(accept-encoding	gzip, deflate, br)
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	res, err := t.Client.Do(req)
	if err != nil {
		return err
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	fmt.Println(string(body))

	return nil
}

//SubmitShipping ...
func (t *Task) SubmitShipping() error {
	t.warn("Checking out (1/3)...")
	form := t.shippingForm()
	path := "/on/demandware.store/Sites-" + t.SiteID + "-Site/de_DE/CheckoutShippingServices-SubmitShipping"
	url := t.BaseURL.String() + path + "?format=ajax"

	req, err := http.NewRequest("POST", url, strings.NewReader(form))
	if err != nil {
		return err
	}

	req.Header.Set("accept", "application/json, text/javascript, */*; q=0.01")
	req.Header.Set("x-requested-with", "XMLHttpRequest")
	req.Header.Set("user-agent", t.UserAgent)
	req.Header.Set("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("origin", t.BaseURL.String())
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("referer", t.BaseURL.String()+"/checkout?stage=shipping")
	//req.Header.Set(accept-encoding	gzip, deflate, br)
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	_, err = t.Client.Do(req)
	if err != nil {
		return err
	}

	//log.Println("SubmitShipping Status: " + res.Status + res.Header.Get("location"))
	//t.info("Submitted shipping & billing info!")
	// body, err := ioutil.ReadAll(res.Body)
	// if err != nil {
	// 	return err

	// }
	// fmt.Println(string(body))
	return nil
}

//SubmitPayment ...
func (t *Task) SubmitPayment() error {
	t.warn("Checking out (2/3)....")
	form := url.Values{}
	form.Set("dwfrm_billing_paymentMethod", "Paypal")
	form.Set("dwfrm_giftCard_cardNumber", "")
	form.Set("dwfrm_giftCard_pin", "")
	form.Set("csrf_token", t.CSRFToken)

	path := "/on/demandware.store/Sites-" + t.SiteID + "-Site/de_DE/CheckoutServices-SubmitPayment"
	url := t.BaseURL.String() + path + "?format=ajax"
	req, err := http.NewRequest("POST", url, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("accept", "application/json, text/javascript, */*; q=0.01")
	req.Header.Set("x-requested-with", "XMLHttpRequest")
	req.Header.Set("user-agent", t.UserAgent)
	req.Header.Set("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("origin", t.BaseURL.String())
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("referer", t.BaseURL.String()+"/checkout?stage=payment")
	//req.Header.Set(accept-encoding	gzip, deflate, br)
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	_, err = t.Client.Do(req)
	if err != nil {
		return err
	}
	//t.info("Submitted payment method!")
	//log.Println("SubmitPayment Status: " + res.Status)
	return nil
}

//PlaceOrder ...
func (t *Task) PlaceOrder() error {
	t.warn("Checking out (3/3)...")
	path := "/on/demandware.store/Sites-" + t.SiteID + "-Site/de_DE/CheckoutServices-PlaceOrder"
	url := t.BaseURL.String() + path + "?format=ajax"
	req, err := http.NewRequest("POST", url, strings.NewReader(""))
	if err != nil {
		return err
	}

	req.Header.Set("accept", "application/json, text/javascript, */*; q=0.01")
	req.Header.Set("x-requested-with", "XMLHttpRequest")
	req.Header.Set("user-agent", t.UserAgent)
	req.Header.Set("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("origin", t.BaseURL.String())
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("referer", t.BaseURL.String()+"/checkout?stage=placeOrder")
	//req.Header.Set(accept-encoding	gzip, deflate, br)
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	res, err := t.Client.Do(req)
	if err != nil {
		return err
	}

	//log.Println("PlaceOrder Status: " + res.Status)
	t.info("Successfully checked out!")
	body := placeOrderResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	//fmt.Println("Error Occured: " + strconv.FormatBool(body.Error))
	t.debg("Paypal URL: " + body.PaypalURL)
	return nil
}
