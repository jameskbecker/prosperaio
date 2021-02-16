package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"prosperaio/utils/client"
	"strings"
	"time"
)

func (t *task) registerEmail() {
	for {
		res, err := t._postGuestReq()
		if res != nil {
			client.Decompress(res)
		}
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		err = t._handleGuestRes(res)
		res.Body.Close()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
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
