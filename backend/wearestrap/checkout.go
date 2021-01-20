package wearestrap

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func (t *task) modifyAccountAndAddress() error {
	url := t.baseURL + "/es/pedido?modifyAccountAndAddress"
	form := t.accountAndAddress().Encode()
	req, err := http.NewRequest("POST", url, strings.NewReader(form))
	if err != nil {
		return err
	}

	req.Header.Set("referer", t.baseURL+"/es/pedido")
	for _, v := range defaultHeaders(t.baseURL) {
		req.Header.Set(v[0], v[1])
	}

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	body := addressResponse{}
	json.NewDecoder(res.Body).Decode(&body)
	return nil
}

func (t *task) getToken() error {
	uri := t.baseURL + "/es/pedido"
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		return err
	}
	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", useragent)
	req.Header.Set("accept", "	text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("sec-fetch-dest", "document")
	req.Header.Set("referer", t.baseURL+"/es/carrito?action=show")
	//req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	//<input type="hidden" class="orig-field" name="token" value="c45c161fb8309f28f326322bb88d8a12">

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return err
	}

	tokenMatch := doc.Find(`input[name="token"]`)
	token, exists := tokenMatch.Attr("value")
	if !exists {
		return errors.New("Checkout Token Not Found")
	}

	t.log.Debug("Found Checkout Token: " + token)
	t.token = token
	return nil
}

//might be apple to add this to modify acc and address
func (t *task) acceptGDPR() error {
	form := gdpr(t.staticToken).Encode()
	url := t.baseURL + "/es/pedido"
	req, err := http.NewRequest("POST", url, strings.NewReader(form))
	if err != nil {
		return err
	}

	for _, v := range defaultHeaders(t.baseURL) {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", t.baseURL+"/es/pedido")

	t.client.Do(req)

	return nil
}

func (t *task) acceptTerms() error {
	form := terms(t.staticToken).Encode()
	url := t.baseURL + "/es/pedido"
	req, err := http.NewRequest("POST", url, strings.NewReader(form))
	if err != nil {
		return err
	}

	for _, v := range defaultHeaders(t.baseURL) {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", t.baseURL+"/es/pedido")

	t.client.Do(req)

	return nil
}

func (t *task) getPPURL() (string, error) {
	url := t.baseURL + "/es/module/paypal/ecInit?credit_card=0&getToken=1"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("accept", "*/*")
	//req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9")
	req.Header.Set("referer", t.baseURL+"/es/pedido")
	req.Header.Set("rsec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("user-agent", useragent)
	req.Header.Set("x-requested-with", "XMLHttpRequest")

	res, err := t.client.Do(req)
	if err != nil {
		return "", err
	}

	body := ppTokenResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	token := body.Token
	if !body.Success || body.Token == "" {
		return "", errors.New("Error getting PayPal Token")
	}

	return "https://www.paypal.com/checkoutnow?token=" + token, nil
}
