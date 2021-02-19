package meshdesktop

import (
	"errors"
	"net/http"
	"prosperaio/utils/client"

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
