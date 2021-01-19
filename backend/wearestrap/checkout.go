package wearestrap

import (
	"encoding/json"
	"net/http"
	"strings"
)

func (t *task) modifyAccountAndAddress(c *http.Client) error {
	url := t.baseURL + "/es/pedido?modifyAccountAndAddress"
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("referer", t.baseURL+"/es/pedido")
	for _, v := range defaultHeaders(t.baseURL) {
		req.Header.Set(v[0], v[1])
	}

	res, err := c.Do(req)
	if err != nil {
		return err
	}

	body := addressResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	return nil
}

//might be apple to add this to modify acc and address
func (t *task) acceptGDPR(c *http.Client) error {
	form := gdpr().Encode()
	url := t.baseURL + "/es/pedido"
	req, err := http.NewRequest("POST", url, strings.NewReader(form))
	if err != nil {
		return err
	}

	for _, v := range defaultHeaders(t.baseURL) {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", t.baseURL+"/es/pedido")

	c.Do(req)

	return nil
}

func (t *task) acceptTerms(c *http.Client) error {
	form := terms().Encode()
	url := t.baseURL + "/es/pedido"
	req, err := http.NewRequest("POST", url, strings.NewReader(form))
	if err != nil {
		return err
	}

	for _, v := range defaultHeaders(t.baseURL) {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", t.baseURL+"/es/pedido")

	c.Do(req)

	return nil
}

func (t *task) getPPURL(c *http.Client) (string, error) {
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

	res, err := c.Do(req)
	if err != nil {
		return "", err
	}

	body := ppTokenResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	token := body.Token
	if !body.Success || body.Token == "" {

	}

	return "https://www.paypal.com/checkoutnow?token=" + token, nil
}
