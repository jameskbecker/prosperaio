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
	err := t._postGuestReq()
	if err != nil {
		t.retry(err, t.registerEmail)
		return
	}
}

func (t *task) _postGuestReq() error {
	uri := t.baseURL.String() + "/checkout/guest/"
	form := guestForm(t.profile.Email)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return err
	}

	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	req.Header.Set("referer", t.baseURL.String()+"/checkout/login/")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode > 299 {
		err := errors.New("Unexpected Status: " + res.Request.RequestURI + " " + res.Status)
		return err
	}
	client.Decompress(res)
	data := messageResponse{}
	json.NewDecoder(res.Body).Decode(&data)

	t.log.Debug("Guest EP Message: " + data.Message)
	return handleGuestResMessage(data.Message)
}

func handleGuestResMessage(message string) error {
	switch strings.ToLower(message) {
	case "success":
		return nil

	case "email address is not valid.":
		return errInvalidEmail

	default:
		err := errors.New("Guest EP Error: " + "'" + message + "'")
		return err
	}
}
