package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"prosperaio/utils/client"
	"strconv"
	"time"
)

func (t *task) postATC() (*http.Response, error) {
	uri := t.baseURL + "/cart/" + t.pData.sku
	form, _ := buildATCForm()
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return nil, err
	}
	setDefaultHeaders(req, t.useragent, t.baseURL)
	req.Header.Set("referer", t.productURL.String())
	req.Header.Set("accept-encoding", "identity")

	res, err := t.client.Do(req)
	if err != nil {
		return nil, err
	}

	return res, nil
}

type atcResponse struct {
	ID              string       `json:"ID"`
	Href            string       `json:"href"`
	Count           int          `json:"count"`
	HasGuest        bool         `json:"canCheckoutAsGuest"`
	Ref             string       `json:"reference"`
	Customer        *interface{} `json:"customer"`
	BillingAddress  *interface{} `json:"billingAddress"`
	DeliveryAddress *interface{} `json:"deliveryAddress"`
	Delivery        delivery     `json:"delivery"`
	Contents        []contents   `json:"contents"`
	Error           atcError     `json:"error"`
}

func (t *task) parseATCRes(res *http.Response) error {
	body := atcResponse{}
	bodyD, err := client.Decompress(res)
	if err != nil {
		return err
	}
	json.NewDecoder(bodyD).Decode(&body)

	if body.Error.Info.RecaptchaRequired {
		return errors.New("ATC Failed: ReCAPTCHA Required")
	}

	if body.Count < 1 || len(body.Contents) < 1 {
		bodyB, _ := ioutil.ReadAll(bodyD)
		fmt.Println(string(bodyB))
		return errors.New("Added 0 items to Cart")
	}

	t.shippingMethodID = body.Delivery.DeliveryMethodID
	t.pData.name = body.Contents[0].Name
	t.pData.imageURL = body.Contents[0].Image.URL

	t.log.Info("Successfully Added " + strconv.Itoa(body.Count) + " Item(s) to Cart! (" + body.Ref + ")")
	return nil
}

func (t *task) atcRoutine() {
	for {
		t.log.Warn("Adding to Cart")
		res, err := t.postATC()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}

		err = t.parseATCRes(res)
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
	}
}

type atcError struct {
	Message string       `json:"message"`
	Info    atcErrorInfo `json:"info"`
}

type atcErrorInfo struct {
	RecaptchaRequired bool   `json:"recaptchaRequired"`
	Sitekey           string `json:"sitekey"`
}

type contents struct {
	Name  string `json:"name"`
	Image image  `json:"image"`
}

type image struct {
	URL string `json:"originalURL"`
}

type delivery struct {
	DeliveryMethodID string `json:"deliveryMethodID"`
}
