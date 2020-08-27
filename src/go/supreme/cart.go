package supreme

import (
	"compress/gzip"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

//AddToCart an item to cart
func (t *InputOptions) AddToCart() error {
	region := "eu"
	qs := url.Values{}

	switch region {
	case "eu":
		qs.Set("qty", strconv.Itoa(t.Quantity))
		qs.Set("size", strconv.Itoa(t.SizeID))
		qs.Set("style", strconv.Itoa(t.StyleID))
	}

	request, err := http.NewRequest("POST", t.ProductURL+`/add.json`, strings.NewReader(qs.Encode()))
	if err != nil {
		return err
	}

	url := t.BaseURL.Scheme + "://" + t.BaseURL.Host

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Add("Accept-Encoding", "gzip, deflate, br")
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Add("Origin", url)
	request.Header.Add("Referer", url+"/mobile")
	request.Header.Add("User-Agent", t.UserAgent)
	request.Header.Add("X-Requested-With", "XMLHttpRequest")

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	var reader io.Reader
	var pureCart string
	switch response.Header.Get("content-encoding") {

	case "gzip":
		uncompressedBody, err := gzip.NewReader(response.Body)

		if err != nil {
			log.Println(err.Error())
			reader = response.Body
		} else {
			reader = uncompressedBody
		}
		break
	default:
		log.Println("Unexpected Content-Encoding: " + response.Header.Get("content-encoding"))
		reader = response.Body
	}

	body, err := ioutil.ReadAll(reader)
	if err != nil {
		return err
	}

	for _, cookie := range t.Client.Jar.Cookies(t.BaseURL) {
		if cookie.Name == "pure_cart" {
			pureCart = cookie.Value
			break
		}
	}

	t.CookieSub = pureCart
	t.CartResponse = string(body)
	return nil
}

type cartResponseItem struct {
	SizeID  string `json:"size_id"`
	InStock bool   `json:"in_stock"`
}
