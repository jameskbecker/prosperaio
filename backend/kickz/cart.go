package kickz

import (
	"net/http"
	"net/url"
	"strings"
)

//AddToCart ...
func (t *Task) AddToCart() error {
	form := &url.Values{}
	form.Set("productVariantIdAjax", t.ProductVariantID)
	form.Set("ttoken", t.TToken)

	addURL := t.BaseURL + "/" + t.Options.Region + "/cart/ajaxAdd"
	body := strings.NewReader(form.Encode())

	request, err := http.NewRequest("POST", addURL, body)
	if err != nil {
		return err
	}

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Accept-Encoding", "gzip, deflate, br")
	request.Header.Add("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	request.Header.Add("Origin", t.BaseURL)
	//request.Header.Add("Referer", t.Options.ProductURL)
	request.Header.Add("User-Agent", t.UserAgent)
	request.Header.Add("X-Requested-With", "XMLHttpRequest")

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	return nil
}
