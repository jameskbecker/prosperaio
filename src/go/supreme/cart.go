package supreme

import (
	"compress/gzip"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

//Add an item to cart
func (t *Task) Add() error {
	region := "eu"
	qs := url.Values{}

	switch region {
	case "eu":
		qs.Set("qty", t.InputQty)
		qs.Set("size", strconv.Itoa(t.SizeID))
		qs.Set("style", strconv.Itoa(t.StyleID))
	}

	request, err := http.NewRequest("POST", t.BaseURL+`/shop/`+strconv.Itoa(t.ProductID)+`/add.json`, strings.NewReader(qs.Encode()))
	if err != nil {
		return err
	}

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Add("Accept-Encoding", "gzip, deflate, br")
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Add("Origin", t.BaseURL)
	request.Header.Add("Referer", t.BaseURL+"/mobile")
	request.Header.Add("User-Agent", t.UserAgent)
	request.Header.Add("X-Requested-With", "XMLHttpRequest")

	now := time.Now()
	secs := now.Unix()

	cookies := []*http.Cookie{
		{
			Domain: "www.supremenewyork.com",
			Path:   "/",
			Name:   "_tlcket",
			Value:  "3b92c72ce1b33842b4413aea54d6331410fa35a4de3dc628ce6a74d0f511ccfa22f99887515397fe8035ec411ba43ccc4e4b6acb3d9103056d12e024caa8d4aa" + strconv.FormatInt(secs, 10),
		},
	}

	domain, err := url.Parse("https://www.supremenewyork.com")
	if err != nil {
		return err
	}

	t.Client.Jar.SetCookies(domain, cookies)

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	//Close Request Once Function is Completed
	defer response.Body.Close()

	var reader io.Reader
	switch response.Header.Get("content-encoding") {

	case "gzip":
		uncompressedBody, err := gzip.NewReader(response.Body)

		if err != nil {
			t.Err.Println(err.Error())
			reader = response.Body
		} else {
			reader = uncompressedBody
		}
		break
	default:
		t.Err.Println("Unexpected Content-Encoding: " + response.Header.Get("content-encoding"))
		reader = response.Body
	}

	body, err := ioutil.ReadAll(reader)
	if err != nil {
		return err
	}
	for _, cookie := range t.Client.Jar.Cookies(domain) {
		if cookie.Name == "pure_cart" {
			t.CookieSub = cookie.Value
			break
		}
	}
	t.CartResponse = string(body)
	return nil
}

type cartResponseItem struct {
	SizeID  string `json:"size_id"`
	InStock bool   `json:"in_stock"`
}
