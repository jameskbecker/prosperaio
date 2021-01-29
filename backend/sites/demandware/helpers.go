package demandware

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

const bold = "\u001b[1m"
const reset = "\u001b[0m"
const yellow = "\u001b[33m"
const blue = "\u001b[34m"
const green = "\u001b[32m"
const red = "\u001b[31m"

//GetPXCookie ...
func (t *Task) GetPXCookie() (string, error) {
	t.warn("Fetching px cookie...")
	uri := "http://127.0.0.1:8080/px/v1/generate"
	qs := url.Values{}
	qs.Set("site", "snipes")
	//qs.Set("productUrl", t.BaseURL.String())

	req, err := http.NewRequest("GET", uri+"?"+qs.Encode(), nil)
	if err != nil {
		return "", err
	}

	c := http.Client{}

	res, err := c.Do(req)
	if err != nil {
		return "", err
	}

	switch res.StatusCode {
	case 200:
		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return "", err
		}

		var px pxResponse
		err = json.Unmarshal(body, &px)
		if err != nil {
			return "", err
		}

		return px.Cookies[0].Value, nil
	default:
		t.lErr.Println("Failed to fetch PX Cookie: " + res.Status)

		return "", errors.New("Unexpected Status")
	}

	// body, err := ioutil.ReadAll(res.Body)
	// if err != nil {
	// 	return "", err
	// }

}

//SubmitRegistration ...
func (t *Task) SubmitRegistration() error {
	t.warn("Generating Account...")
	form := t.registrationForm()

	qs := url.Values{}
	qs.Set("rurl", "1")
	qs.Set("format", "ajax")

	path := "/on/demandware.store/Sites-" + t.SiteID + "-Site/de_DE/Account-SubmitRegistration"
	url := t.BaseURL.String() + path + "?" + qs.Encode()
	req, err := http.NewRequest("POST", url, strings.NewReader(form))
	if err != nil {
		return err
	}

	res, err := t.Client.Do(req)
	if err != nil {
		return err
	}

	ioutil.ReadAll(res.Body)

	return nil
}

//GetCSRFToken ...
func (t *Task) GetCSRFToken() error {
	t.warn("Fetching secret token...")
	req, err := http.NewRequest("GET", t.BaseURL.String()+"/registration", nil)
	if err != nil {
		return err
	}

	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", t.UserAgent)
	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("sec-fetch-dest", "document")
	//req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	req.Header.Set("referer", t.BaseURL.String()+"/on/demandware.store/Sites-"+t.SiteID+"-Site/de_DE/Checkout-Login")

	res, err := t.Client.Do(req)
	if err != nil {
		return err
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return err
	}

	matches := doc.Find(`input[name="csrf_token"]`)
	first := matches.First()

	val, exists := first.Attr("value")
	if !exists {
		return errors.New("Value Non-Existant")
	}

	t.CSRFToken = val
	//log.Println("Fetched CSRF Token: " + t.CSRFToken)

	return nil
}
