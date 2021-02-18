package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"prosperaio/utils/client"
	"strconv"

	"github.com/PuerkitoBio/goquery"
)

func (t *task) getCaptchaData() {
	if !t.forceCaptcha {
		return
	}
	t.log.Warn("Checking for Recaptcha")
	res, err := t._getProductReq()
	if err != nil {
		t.retry(err, t.getCaptchaData)
		return
	}

	t.recaptcha.skip, err = t._handleProductRes(res)
	if err != nil {
		t.retry(err, t.getCaptchaData)
		return
	}

	if !t.recaptcha.skip {
		t.getCaptcha()
	}
}

func (t *task) _getProductReq() (res *http.Response, err error) {
	path := "/product/0/" + t.pData.pid + "/"
	uri := t.baseURL.String() + path
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		return
	}

	//Set Headers
	setDefaultHeaders(req, t.useragent, t.baseURL.String())

	//Send Request
	res, err = t.client.Do(req)
	return
}

func (t *task) _handleProductRes(res *http.Response) (skip bool, err error) {
	defer res.Body.Close()
	if res.StatusCode > 299 {
		err = errors.New("Unexpected Status: " + res.Request.RequestURI + " " + res.Status)
		return
	}
	client.Decompress(res)
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return
	}

	selector := "[data-sitekey]"
	recaptchaWidget := doc.Find(selector)
	sitekey, _ := recaptchaWidget.Attr("data-sitekey")
	if sitekey == "" {
		t.log.Warn("No Recaptcha Sitekey Found. Skipping")
		skip = true
		return
	}

	t.recaptcha.sitekey = sitekey
	t.log.Debug("Found Sitekey: " + sitekey)

	srcSelector := doc.Find("#recaptchaSourceEnabled")
	_, exists := srcSelector.Attr("src")
	if !exists {
		t.log.Warn("Recaptcha disabled. Skipping")
		skip = true
		return
	}
	return
}

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
