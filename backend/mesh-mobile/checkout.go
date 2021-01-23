package meshmobile

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func (t *task) addAddress() error {
	path := "/myaccount/addressbook/add/"
	reqBody, err := json.Marshal(address{})
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", t.baseURL+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return err
	}

	for _, v := range t.defaultHeaders() {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", "")

	return nil
}
