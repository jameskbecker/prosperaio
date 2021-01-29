package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
)

func (t *task) initGuest() error {
	uri := t.baseURL + "/checkout/guest/"
	form := guestForm(t.profile.Email)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return err
	}

	setDefaultHeaders(req, t.useragent, t.baseURL)
	req.Header.Set("referer", t.baseURL+"/checkout/login/")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	message, err := parseGuestResponse(res.Body)
	if err != nil {
		return err
	}

	t.log.Debug("Guest EP Message: " + message)
	return nil
}

func parseGuestResponse(resBody io.Reader) (string, error) {
	body := messageResponse{}
	json.NewDecoder(resBody).Decode(&body)

	switch strings.ToLower(body.Message) {
	case "success":
		return body.Message, nil

	case "email address is not valid.":
		err := errors.New("Invalid email address")
		return body.Message, err
	default:
		err := errors.New("Guest EP Error: " + "'" + body.Message + "'")
		return body.Message, err
	}
}
