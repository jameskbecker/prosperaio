package demandware

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
)

//GetAuthenticationToken ...
// func (t *task) GetAuthenticationToken() error {
// 	t.log.Warn("Getting Authentication Token")
// 	// form := url.Values{}
// 	// form.Set("hostname", "www.snipes.com")
// 	//ISML (
// 	form := []byte(`{"hostname":"www.snipes.com"}`)

// 	path := "/dw/shop/v20_10/baskets/bdcb-snse-DE-AT"
// 	url := t.baseURL.String() + path

// 	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(form))
// 	if err != nil {
// 		return err
// 	}

// 	setDefaultHeaders(req, t.userAgent, t.baseURL.String())
// 	req.Header.Set("content-type", "application/json")
// 	req.Header.Set("origin", t.baseURL.String())
// 	req.Header.Set("sec-fetch-mode", "cors")
// 	req.Header.Set("sec-fetch-dest", "empty")
// 	//req.Header.Set("referer", t.BaseURL.String()+"/checkout?stage=shipping")

// 	res, err := t.client.Do(req)
// 	if err != nil {
// 		return err
// 	}

// 	body, err := ioutil.ReadAll(res.Body)
// 	if err != nil {
// 		return err
// 	}

// 	fmt.Println(string(body))

// 	return nil
// }

func (t *task) postShipping() {
	_, err := t._postShippingReq()
	if err != nil {
		t.retry(err, t.postShipping)
	}
}

func (t *task) _postShippingReq() (*http.Response, error) {
	t.log.Warn("Checking out (1/3)...")
	form := t.shippingForm()
	path := "/on/demandware.store/Sites-" + t.siteID + "-Site/de_DE/CheckoutShippingServices-SubmitShipping"
	url := t.baseURL.String() + path + "?format=ajax"

	req, err := http.NewRequest("POST", url, strings.NewReader(form))
	if err != nil {
		return nil, err
	}

	setDefaultHeaders(req, t.userAgent, t.baseURL.String())
	req.Header.Set("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("origin", t.baseURL.String())
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("referer", t.baseURL.String()+"/checkout?stage=shipping")

	return t.client.Do(req)
}

func (t *task) submitPayment() {
	_, err := t._postPaymentReq()
	if err != nil {
		t.retry(err, t.submitPayment)
	}
}

func (t *task) _postPaymentReq() (*http.Response, error) {
	t.log.Warn("Checking out (2/3)....")
	form := url.Values{}
	form.Set("dwfrm_billing_paymentMethod", "Paypal")
	form.Set("dwfrm_giftCard_cardNumber", "")
	form.Set("dwfrm_giftCard_pin", "")
	form.Set("csrf_token", t.csrfToken)

	path := "/on/demandware.store/Sites-" + t.siteID + "-Site/de_DE/CheckoutServices-SubmitPayment"
	url := t.baseURL.String() + path + "?format=ajax"
	req, err := http.NewRequest("POST", url, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}

	setDefaultHeaders(req, t.userAgent, t.baseURL.String())
	req.Header.Set("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("origin", t.baseURL.String())
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("referer", t.baseURL.String()+"/checkout?stage=payment")

	return t.client.Do(req)
}

func (t *task) placeOrder() {
	res, err := t._postPlaceOrderReq()
	if err != nil {
		t.retry(err, t.placeOrder)
	}

	err = t._handlePlaceOrderRes(res)
	if err != nil {
		t.retry(err, t.placeOrder)
	}
}

func (t *task) _postPlaceOrderReq() (*http.Response, error) {
	t.log.Warn("Checking out (3/3)...")
	path := "/on/demandware.store/Sites-" + t.siteID + "-Site/de_DE/CheckoutServices-PlaceOrder"
	url := t.baseURL.String() + path + "?format=ajax"
	req, err := http.NewRequest("POST", url, strings.NewReader(""))
	if err != nil {
		return nil, err
	}

	setDefaultHeaders(req, t.userAgent, t.baseURL.String())
	req.Header.Set("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
	req.Header.Set("origin", t.baseURL.String())
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("referer", t.baseURL.String()+"/checkout?stage=placeOrder")

	return t.client.Do(req)
}

type placeOrderResponse struct {
	PaypalURL string `json:"continueUrl"`
	Error     bool   `json:"error"`
}

//PlaceOrder ...
func (t *task) _handlePlaceOrderRes(res *http.Response) error {
	//log.Println("PlaceOrder Status: " + res.Status)
	t.log.Info("Successfully checked out!")
	body := placeOrderResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	//fmt.Println("Error Occured: " + strconv.FormatBool(body.Error))
	t.log.Debug("Paypal URL: " + body.PaypalURL)
	return nil
}
