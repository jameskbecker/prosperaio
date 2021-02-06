package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"prosperaio/utils/client"
	"strings"
	"time"
)

func (t *task) registerEmail() {
	for {
		body, err := t._postGuestReq()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		err = t._handleGuestRes(body)
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
	}
}

func (t *task) _postGuestReq() (body io.ReadCloser, err error) {
	uri := t.baseURL.String() + "/checkout/guest/"
	form := guestForm(t.profile.Email)
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return
	}

	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	req.Header.Set("referer", t.baseURL.String()+"/checkout/login/")

	res, err := t.client.Do(req)
	if err != nil {
		return
	}

	body, err = client.Decompress(res)
	return

}

func (t *task) _handleGuestRes(body io.ReadCloser) error {
	data := messageResponse{}
	json.NewDecoder(body).Decode(&data)

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
