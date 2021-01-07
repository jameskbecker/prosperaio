package demandware

import (
	"compress/gzip"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

//GetProductShowURL ...
func (t *Task) GetProductShowURL() error {
	t.warn("Fetching Product Data...")
	req, err := http.NewRequest("GET", t.ProductURL.String(), nil)
	if err != nil {
		return err
	}

	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", t.UserAgent)
	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("sec-fetch-site", "none")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("sec-fetch-dest", "document")
	req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	res, err := t.Client.Do(req)
	if err != nil {
		return err
	}

	switch res.StatusCode {
	case 200:
		resBody := decompressBody(res)
		body, _ := ioutil.ReadAll(resBody)
		fmt.Println(string(body))
		optID, err := parseOption(resBody, t.Size)
		if err == nil {

		}
		val := t.BaseURL.String() + optID
		//fmt.Println("Product-Show URL: " + val)
		t.PDataURL = val

		// t.OptionID = optID
		// t.ValueID = valID
		return nil

	default:
		return errors.New(res.Status)
	}

}

func decompressBody(res *http.Response) io.Reader {
	fmt.Println(res.Header.Get("Content-Encoding"))
	switch res.Header.Get("Content-Encoding") {
	case "gzip":
		dcb, _ := gzip.NewReader(res.Body)
		return dcb
	// case "deflate":
	// 	dcb, _ := flate.NewReader(bytes.NewReader(res.Body[2:]))
	// 	return dcb
	// case "br":
	// 	break
	default:
		return res.Body
	}
}

func parseOption(resR io.Reader, s string) (string, error) {
	doc, err := goquery.NewDocumentFromReader(resR)
	if err != nil {
		return "", err
	}

	matches := doc.Find(`a[data-value="` + s + `"]`)
	first := matches.First()

	val, exists := first.Attr("data-href")
	if !exists {
		return "", errors.New("Size Not Found")
	}

	return val, nil
}

//GetProductData ...
func (t *Task) GetProductData() error {
	//t.warn("Fetching Product Data...")
	req, err := http.NewRequest("GET", t.PDataURL+"&format=ajax", nil)
	if err != nil {
		return err
	}

	req.Header.Set("user-agent", t.UserAgent)
	req.Header.Set("accept", "application/json, text/javascript, */*; q=0.01")
	req.Header.Set("sec-fetch-site", "none")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-dest", "empty")
	//req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	req.Header.Set("referer", t.ProductURL.String())
	req.Header.Set("x-requested-with", "XMLHttpRequest")
	req.Header.Set("content-type", "application/json")
	res, err := t.Client.Do(req)
	if err != nil {
		return err
	}

	switch res.StatusCode {

	case 200:
		t.info("Fetched Product Data!")
		body := productShow{}
		json.NewDecoder(res.Body).Decode(&body)

		t.BPID = body.Product.ID
		t.PName = body.Product.Name
		t.PBrand = body.Product.Brand

		t.debg("Found Product - " + t.PBrand + " " + t.PName)
	case 403:
		t.lErr.Println("Unable to fetch product data -" + res.Status)
		_, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return err

		}
		//fmt.Println(string(body))
		return errors.New("FORBIDDEN")

	default:
		t.lErr.Println("Unexpected GetproductData response " + res.Status)
		return errors.New("")
	}

	// body, err := ioutil.ReadAll(res.Body)
	// if err != nil {
	// 	return err
	// }

	// fmt.Println(string(body))
	return nil
}

//AddToCart ...
func (t *Task) AddToCart() error {
	t.warn("Adding to cart...")
	path := "/add-product?format=ajax"
	uri := "https://" + t.BaseURL.Hostname() + path
	form := t.cartForm()

	req, err := http.NewRequest("POST", uri, strings.NewReader(form))
	if err != nil {
		return err
	}

	req.Header.Set("x-requested-with", "XMLHttpRequest")
	req.Header.Set("user-agent", t.UserAgent)
	req.Header.Set("accept", "application/json, text/javascript, */*; q=0.01")
	req.Header.Set("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
	//req.Header.Set("origin", "https://"+t.ProductURL.Hostname())
	//req.Header.Set("referer", t.ProductURL.String())
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("cache-control", "no-store")
	req.Header.Set("sec-fetch-dest", "empty")
	//req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	res, err := t.Client.Do(req)
	if err != nil {
		return errors.New(res.Status)
	}

	switch res.StatusCode {

	case 200:
		t.info("Successfully added item to cart!")

	case 403:
		t.lErr.Println("Unable to add to cart - " + res.Status)
		// _, err := ioutil.ReadAll(res.Body)
		// if err != nil {
		// 	return err

		// }
		return errors.New("FORBIDDEN")

	default:
		return errors.New("Unexpected ATC response " + res.Status)
	}

	body := atcResponse{}
	json.NewDecoder(res.Body).Decode(&body)
	if len(body.Cart.Items) < 1 {
		return errors.New("Not Added")
	}
	t.ShipmentID = body.Cart.Items[0].ShipmentID
	//fmt.Println("ShipmentUUID " + t.ShipmentID)
	t.debg("ATC Message: " + body.Message)

	return nil
}
