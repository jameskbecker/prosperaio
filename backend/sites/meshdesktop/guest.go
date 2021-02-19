package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"prosperaio/utils/client"
	"strings"
)

func (t *task) registerEmail() {
	t.log.Warn("Signing in As Guest")
	res, err := t._postGuestReq()
	if err != nil {
		t.retry(err, t.registerEmail)
		return
	}
	err = t._handleGuestRes(res)
	if err != nil {
		t.retry(err, t.registerEmail)
	}
}

func (t *task) _postGuestReq() (*http.Response, error) {
	uri := t.baseURL.String() + "/checkout/guest/"
	form := guestForm(t.profile.Email)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return nil, err
	}

	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	req.Header.Set("referer", t.baseURL.String()+"/checkout/login/")

	return t.client.Do(req)
}

func (t *task) _handleGuestRes(res *http.Response) error {
	defer res.Body.Close()
	if res.StatusCode > 299 {
		err := errors.New("Unexpected Status: " + res.Request.RequestURI + " " + res.Status)
		return err
	}
	client.Decompress(res)
	data := messageResponse{}
	json.NewDecoder(res.Body).Decode(&data)

	t.log.Debug("Guest EP Message: " + data.Message)
	switch strings.ToLower(data.Message) {
	case "success":
		return nil

	case "email address is not valid.":
		err := errors.New("Invalid email address")
		return err

	default:
		err := errors.New("Guest EP Error: " + "'" + data.Message + "'")
		return err
	}
}
