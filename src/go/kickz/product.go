package kickz

import (
	"encoding/json"
	"net/http"
)

//GetERP to be able to fetch product data
func (t *Task) GetERP() error {
	return nil
}

//GetProductData ...
func (t *Task) GetProductData() error {
	url := t.BaseURL + "/" + t.Options.Region + "/api/product/erp/" + t.Options.ItemNumber

	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	//Add Headers
	request.Header.Add("Accept", "*/*")
	request.Header.Add("Accept-Encoding", "gzip, deflate, br")
	request.Header.Add("Sec-Fetch-Dest", "document")
	request.Header.Add("Sec-Fetch-Mode", "navigate")
	request.Header.Add("Sec-Fetch-Site", "none")
	request.Header.Add("Sec-Fetch-User", "?1")
	request.Header.Add("Upgrade-Insecure-Requests", "1")
	request.Header.Add("User-Agent", t.UserAgent)

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	var body APIResponse
	json.NewDecoder(response.Body).Decode(&body)

		

	return nil
}
