package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"prosperaio/utils/client"
	"strconv"
	"time"

	"github.com/PuerkitoBio/goquery"
)

func (t *task) getCaptchaData() (skip bool) {
	for {
		res, err := t._getProductReq()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}

		skip, err = t._handleProductRes(res)
		res.Body.Close()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
	}
	return
}

func (t *task) addToCart() {
	for {
		if t.forceCaptcha {
			t.log.Warn("Checking for Captcha")
			skip := t.getCaptchaData()
			if !skip {
				t.getCaptcha()
			}
		}
		t.log.Warn("Adding to Cart")
		res, err := t._postATCReq()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}

		err = t._handleATCRes(res)
		res.Body.Close()
		if err != nil {
			t.log.Error(err.Error())
			if err.Error() == "ATC Failed: ReCAPTCHA Required" {
				t.getCaptcha()
			}
			time.Sleep(t.retryDelay)
			continue
		}
		break
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

	t.recaptchaSitekey = sitekey
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

func (t *task) _postATCReq() (res *http.Response, err error) {
	uri := t.baseURL.String() + "/cart/" + t.pData.sku
	form, _ := buildATCForm(t.recaptchaResponse)
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
	client.Decompress(res)
	data := atcResponse{}
	json.NewDecoder(res.Body).Decode(&data)

	if data.Error.Info.RecaptchaRequired {
		t.recaptchaSitekey = data.Error.Info.Sitekey
		return errors.New("ATC Failed: ReCAPTCHA Required")
	}

	if data.Count < 1 || len(data.Contents) < 1 {
		bodyB, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return err
		}
		return errors.New("Added 0 items to Cart - " + string(bodyB))
	}

	t.shippingMethodID = data.Delivery.DeliveryMethodID
	t.pData.name = data.Contents[0].Name
	t.pData.imageURL = data.Contents[0].Image.URL

	t.log.Info("Successfully Added " + strconv.Itoa(data.Count) + " Item(s) to Cart! (" + data.Ref + ")")
	return nil
}
