package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"prosperaio/utils/client"
	"strconv"
)

func (t *task) addToCart() {
	t.log.Warn("Adding to Cart")
	res, err := t._postATCReq()
	if err != nil {
		t.retry(err, t.addToCart)
		return
	}

	err = t._handleATCRes(res)
	if err != nil {
		t.retry(err, t.addToCart)
		return
	}
}

func (t *task) _postATCReq() (res *http.Response, err error) {
	uri := t.baseURL.String() + "/cart/" + t.pData.sku
	form, _ := buildATCForm(t.recaptcha.response)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return nil, err
	}
	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	//req.Header.Set("referer", t.productURL.String())

	res, err = t.client.Do(req)
	return
}

func (t *task) _handleATCRes(res *http.Response) error {
	defer res.Body.Close()
	if res.StatusCode > 299 {
		err := errors.New("Unexpected Status: " + res.Request.RequestURI + " " + res.Status)
		return err
	}
	client.Decompress(res)
	data := atcResponse{}
	json.NewDecoder(res.Body).Decode(&data)

	if data.Error.Info.RecaptchaRequired {
		t.recaptcha.sitekey = data.Error.Info.Sitekey
		return errCaptchaRequired
	}

	if data.Count < 1 || len(data.Contents) < 1 {
		bodyB, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return err
		}
		t.log.Debug(string(bodyB))
		return errATCNotAdded
	}

	t.shippingMethodID = data.Delivery.DeliveryMethodID
	t.pData.name = data.Contents[0].Name
	t.pData.imageURL = data.Contents[0].Image.URL

	t.log.Info("Successfully Added " + strconv.Itoa(data.Count) + " Item(s) to Cart! (" + data.Ref + ")")
	return nil
}
