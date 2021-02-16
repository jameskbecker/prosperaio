package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"prosperaio/utils/client"
	"strconv"
	"time"
)

func (t *task) addToCart() {
	for {
		t.log.Warn("Adding to Cart")
		res, err := t._postATCReq()
		if res != nil {
			client.Decompress(res)
		}
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}

		err = t._handleATCRes(res)
		res.Body.Close()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
	}
}

func (t *task) _postATCReq() (res *http.Response, err error) {
	uri := t.baseURL.String() + "/cart/" + t.pData.sku
	form, _ := buildATCForm()
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return nil, err
	}
	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	//req.Header.Set("referer", t.productURL.String())

	res, err = t.client.Do(req)
	return
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

func (t *task) _handleATCRes(res *http.Response) error {
	data := atcResponse{}
	json.NewDecoder(res.Body).Decode(&data)

	if data.Error.Info.RecaptchaRequired {

		os.Exit(0)
		return errors.New("ATC Failed: ReCAPTCHA Required")
	}

	if data.Count < 1 || len(data.Contents) < 1 {
		bodyB, _ := ioutil.ReadAll(res.Body)
		fmt.Println(string(bodyB))
		return errors.New("Added 0 items to Cart")
	}

	t.shippingMethodID = data.Delivery.DeliveryMethodID
	t.pData.name = data.Contents[0].Name
	t.pData.imageURL = data.Contents[0].Image.URL

	t.log.Info("Successfully Added " + strconv.Itoa(data.Count) + " Item(s) to Cart! (" + data.Ref + ")")
	return nil
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
