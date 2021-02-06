package captcha

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"
)

//InputParams ...
type InputParams struct {
	APIKey  string
	Sitekey string
	URL     string
}

func Request2Captcha(i InputParams) (code string, err error) {
	form := url.Values{}
	form.Set("key", i.APIKey)
	form.Set("method", "userrecaptcha")
	form.Set("googlekey", i.Sitekey)
	form.Set("pageurl", i.URL)
	form.Set("json", "1")

	res, err := http.Get("http://2captcha.com/in.php?" + form.Encode())
	if err != nil {
		return
	}

	body := twoCapRes{}
	json.NewDecoder(res.Body).Decode(&body)

	if body.Status < 1 {
		err = errors.New("Request Error")
		return
	}

	if body.Request == "IP_BANNED" || body.Request == "MAX_USER_TURN" || strings.HasPrefix(body.Request, "ERROR_") {
		err = errors.New(body.Request)
		return
	}

	return getSolution(i.APIKey, body.Request)
}

func getSolution(apiKey string, reqID string) (code string, err error) {
	form := url.Values{}
	form.Set("key", apiKey)
	form.Set("action", "get")
	form.Set("id", reqID)
	form.Set("json", "1")
	ran := false
	pollInterval := 5 * time.Second
	for i := 0; i < 10; i++ {
		res, erro := http.Get("http://2captcha.com/res.php?" + form.Encode())
		if err != nil {
			err = erro
			return
		}

		body := twoCapRes{}
		json.NewDecoder(res.Body).Decode(&body)

		if body.Request == "CAPCHA_NOT_READY" {
			if !ran {
				time.Sleep(10 * time.Second)
				ran = true
			}
			time.Sleep(pollInterval)
			continue
		}

		if strings.HasPrefix(body.Request, "ERROR_") {
			err = errors.New(body.Request)
			return
		}
		code = body.Request
		break

	}
	return
}

type twoCapRes struct {
	Status  int    `json:"status"`
	Request string `json:"request"`
}
