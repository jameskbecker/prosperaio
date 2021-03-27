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

func (t *task) getPXCookie() {
	t.log.Warn("Fetching px cookie...")
	res, err := t._getPXApiReq()
	if err != nil {
		t.retry(err, t.getPXCookie)
	}

	px3, err := t._handlePXApiRes(res)
	if err != nil {
		t.retry(err, t.getPXCookie)
	}

	t.px3 = px3
	cookies := []*http.Cookie{
		{Name: "hideLocalizationDialog", Value: "true"},
		{Name: "acceptCookie", Value: "true"},
		//{Name: "customerCountry", Value: "gb"},
		{Name: "_px3", Value: t.px3},
	}

	t.client.Jar.SetCookies(t.baseURL, cookies)
}

func (t *task) _getPXApiReq() (*http.Response, error) {
	uri := "http://127.0.0.1:8080/px/v1/generate"
	qs := url.Values{}
	qs.Set("site", "snipes")
	//qs.Set("productUrl", t.BaseURL.String())

	req, err := http.NewRequest("GET", uri+"?"+qs.Encode(), nil)
	if err != nil {
		return nil, err
	}

	c := http.Client{}

	return c.Do(req)
}

type pxResponse struct {
	Cookies []cookie `json:"cookies"`
	Error   string   `json:"error"`
}

type cookie struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

func (t *task) _handlePXApiRes(res *http.Response) (string, error) {
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
		t.log.Error("Failed to fetch PX Cookie: " + res.Status)

		return "", errors.New("unexpected status")
	}

}

func (t *task) submitRegistration() {
	_, err := t._submitRegistrationReq()
	if err != nil {
		t.retry(err, t.submitRegistration)
	}
}

func (t *task) _submitRegistrationReq() (*http.Response, error) {
	t.log.Warn("Generating Account...")
	form := t.registrationForm()

	qs := url.Values{}
	qs.Set("rurl", "1")
	qs.Set("format", "ajax")

	path := "/on/demandware.store/Sites-" + t.siteID + "-Site/de_DE/Account-SubmitRegistration"
	url := t.baseURL.String() + path + "?" + qs.Encode()
	req, err := http.NewRequest("POST", url, strings.NewReader(form))
	if err != nil {
		return nil, err
	}

	/* HEADERS ?!?!?!?!?? */

	return t.client.Do(req)
}

//Get CSFR Token for valid POST requests
func (t *task) getCSRFToken() {
	t.log.Warn("Fetching secret token...")
	res, err := t._getCSFRTokenReq()
	if err != nil {
		t.retry(err, t.getCSRFToken)
	}

	err = t._handleCSFRTokenRes(res)
	if err != nil {
		t.retry(err, t.getCSRFToken)
	}
}

func (t *task) _getCSFRTokenReq() (*http.Response, error) {
	req, err := http.NewRequest("GET", t.baseURL.String()+"/registration", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", t.userAgent)
	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("sec-fetch-dest", "document")
	//req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	req.Header.Set("referer", t.baseURL.String()+"/on/demandware.store/Sites-"+t.siteID+"-Site/de_DE/Checkout-Login")

	return t.client.Do(req)
}

func (t *task) _handleCSFRTokenRes(res *http.Response) error {
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return err
	}

	matches := doc.Find(`input[name="csrf_token"]`)
	first := matches.First()

	val, exists := first.Attr("value")
	if !exists {
		return errCSFRNoVal
	}

	t.csrfToken = val
	//log.Println("Fetched CSRF Token: " + t.CSRFToken)

	return nil
}
