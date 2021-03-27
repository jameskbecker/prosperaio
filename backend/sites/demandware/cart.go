package demandware

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"prosperaio/utils/client"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func (t *task) getProductShowURL() {
	res, err := t._getProductShowReq()
	if err != nil {
		t.retry(err, t.getProductShowURL)
	}
	err = t._handleProductShowRes(res)
	if err != nil {
		t.retry(err, t.getProductShowURL)
	}
}

func (t *task) _getProductShowReq() (*http.Response, error) {
	t.log.Warn("Fetching Product Data...")
	req, err := http.NewRequest("GET", t.productURL.String(), nil)
	if err != nil {
		return nil, err
	}

	setDefaultHeaders(req, t.userAgent, t.baseURL.String())
	req.Header.Del("x-requested-with")
	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("sec-fetch-site", "none")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("sec-fetch-dest", "document")

	return t.client.Do(req)
}

func (t *task) _handleProductShowRes(res *http.Response) error {
	defer res.Body.Close()
	client.Decompress(res)
	switch res.StatusCode {
	case 200:
		//body, _ := ioutil.ReadAll(resBody)
		optID, err := parseOption(res.Body, t.size)
		if err != nil {
			return errPUrlOption
		}
		val := t.baseURL.String() + optID
		fmt.Println("Product-Show URL: " + val)
		t.pDataURL = val

		// t.OptionID = optID
		// t.ValueID = valID
		return nil

	default:
		return errors.New(res.Status)
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
		return "", errSizeNotFound
	}

	return val, nil
}

func (t *task) getProductData() {
	res, err := t._getProductDataReq()
	if err != nil {
		t.retry(err, t.getProductData)
	}
	err = t._handleProductDataRes(res)
	if err != nil {
		t.retry(err, t.getProductData)
	}
}

func (t *task) _getProductDataReq() (*http.Response, error) {
	//t.warn("Fetching Product Data...")
	req, err := http.NewRequest("GET", t.pDataURL+"&format=ajax", nil)
	if err != nil {
		return nil, err
	}

	setDefaultHeaders(req, t.userAgent, t.baseURL.String())
	req.Header.Set("content-type", "application/json")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("referer", t.productURL.String())

	return t.client.Do(req)
}

type productShow struct {
	Product productShowProduct `json:"product"`
}

type productShowProduct struct {
	ID    string `json:"id"`
	Name  string `json:"productName"`
	Brand string `json:"brand"`
}

func (t *task) _handleProductDataRes(res *http.Response) error {
	defer res.Body.Close()
	client.Decompress(res)
	switch res.StatusCode {

	case 200:
		t.log.Info("Fetched Product Data!")
		body := productShow{}
		json.NewDecoder(res.Body).Decode(&body)

		t.bPID = body.Product.ID
		t.pName = body.Product.Name
		t.pBrand = body.Product.Brand

		t.log.Debug("Found Product - " + t.pBrand + " " + t.pName)
	case 403:
		t.log.Error("Unable to Fetch Product Data - " + res.Status)
		//fmt.Println(string(body))
		return errForbidden

	default:
		t.log.Error("Unexpected GetproductData response " + res.Status)
		return errors.New("")
	}

	// body, err := ioutil.ReadAll(res.Body)
	// if err != nil {
	// 	return err
	// }

	// fmt.Println(string(body))
	return nil
}

func (t *task) addToCart() {
	res, err := t._postATCReq()
	if err != nil {
		t.retry(err, t.addToCart)
	}
	err = t._handleATCRres(res)
	if err != nil {
		t.retry(err, t.addToCart)
	}
}

func (t *task) _postATCReq() (*http.Response, error) {
	t.log.Warn("Adding to cart...")
	path := "/add-product?format=ajax"
	uri := "https://" + t.baseURL.Hostname() + path
	form := t.cartForm()

	req, err := http.NewRequest("POST", uri, strings.NewReader(form))
	if err != nil {
		return nil, err
	}
	setDefaultHeaders(req, t.userAgent, t.baseURL.String())
	req.Header.Set("cache-control", "no-store")
	req.Header.Set("content-type", "application/x-www-form-urlencoded; charset=UTF-8")
	//req.Header.Set("origin", "https://"+t.ProductURL.Hostname())
	//req.Header.Set("referer", t.ProductURL.String())
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")

	return t.client.Do(req)
}

type atcResponse struct {
	Action  string `json:"action"`
	Message string `json:"message"`
	Error   bool   `json:"error"`
	Cart    cart   `json:"cart"`
}

type cart struct {
	Items []cartItem `json:"items"`
}

type cartItem struct {
	ShipmentID string `json:"shipmentUUID"`
}

func (t *task) _handleATCRres(res *http.Response) error {
	defer res.Body.Close()
	switch res.StatusCode {

	case 200:
		t.log.Info("Successfully added item to cart!")

	case 403:
		t.log.Error("Unable to add to cart - " + res.Status)
		// _, err := ioutil.ReadAll(res.Body)
		// if err != nil {
		// 	return err

		// }
		return errForbidden

	default:
		return errors.New("Unexpected ATC response " + res.Status)
	}

	body := atcResponse{}
	json.NewDecoder(res.Body).Decode(&body)
	if len(body.Cart.Items) < 1 {
		return errATCNotAdded
	}
	t.shipmentID = body.Cart.Items[0].ShipmentID
	//fmt.Println("ShipmentUUID " + t.ShipmentID)
	t.log.Debug("ATC Message: " + body.Message)
	return nil
}
