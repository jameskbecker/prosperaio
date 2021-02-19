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

	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	res, err = t.client.Do(req)
	return
}

func (t *task) _handleProductRes(res *http.Response) (bool, error) {
	defer res.Body.Close()
	if res.StatusCode > 299 {
		err := errors.New("Unexpected Status: " + res.Request.RequestURI + " " + res.Status)
		return false, err
	}
	client.Decompress(res)

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return false, err
	}

	sitekey, hasSitekey := scrapeCaptchaSitekey(doc)
	if !hasSitekey {
		return true, errNoSiteKey
	}
	t.log.Debug("Found Sitekey: " + sitekey)
	t.recaptcha.sitekey = sitekey

	_, recaptchaEnabled := scrapeCaptchaScript(doc)
	if !recaptchaEnabled {
		t.log.Warn("Recaptcha disabled. Skipping")
		return true, nil
	}
	return false, nil
}

func scrapeCaptchaSitekey(doc *goquery.Document) (string, bool) {
	selector := "[data-sitekey]"
	recaptchaWidget := doc.Find(selector)
	return recaptchaWidget.Attr("data-sitekey")
}

func scrapeCaptchaScript(doc *goquery.Document) (string, bool) {
	selector := "#recaptchaSourceEnabled"
	srcSelector := doc.Find(selector)
	return srcSelector.Attr("src")
}
