package main

import (
	"compress/gzip"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/google/uuid"
)

//GetStockData fetches data from either mobile_stock.json, shop.json or mobile/products.json
func (t *Task) GetStockData(endpoint string) error {

	request, _ := http.NewRequest("GET", t.BaseURL+`/`+endpoint, nil)

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Accept-Lanaguage", "en-us")
	request.Header.Add("Upgrade-Insecure-Requests", "1")
	request.Header.Add("User-Agent", t.UserAgent)
	request.Header.Add("X-Requested-With", "XMLHttpRequest")

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	var body stockResponse
	json.NewDecoder(response.Body).Decode(&body)

	foundProduct := false
	categories := body.Categories
	matchedCategory, foundCategory := categories[t.InputCat]

	if !foundCategory {
		return errors.New("Error: Category Not Found")
	}

	var matchedProduct stockItem

	for i, v := range matchedCategory {
		if matchedCategory[i].matchesKWs(&t.InputKW) {
			matchedProduct = v
			foundProduct = true
			break
		}
	}

	if !foundProduct {
		return errors.New("Error: Product Not Found")
	}

	t.ProductName = matchedProduct.Name
	t.ProductID = matchedProduct.ID

	return nil
}

//GetProductData fetches data of a given product id
func (t *Task) GetProductData() error {
	request, err := http.NewRequest("GET", t.BaseURL+`/shop/`+strconv.Itoa(t.ProductID)+`.json`, nil)
	if err != nil {
		return err
	}

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Accept-Lanaguage", "en-us")
	request.Header.Add("Upgrade-Insecure-Requests", "1")
	request.Header.Add("User-Agent", t.UserAgent)
	request.Header.Add("X-Requested-With", "XMLHttpRequest")

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	var body productResponse
	json.NewDecoder(response.Body).Decode(&body)

	var matchedStyle productStyle

	for _, v := range body.Styles {
		matchedStyle = v
		if v.matchesKWs(&t.InputStyle) {
			break
		}
	}

	t.StyleName = matchedStyle.Name
	t.StyleID = matchedStyle.ID

	var matchedSize productSize
	for _, v := range matchedStyle.Sizes {
		matchedSize = v
		if strings.ToLower(v.Name) == strings.ToLower(t.InputSize) {
			break
		}
	}

	t.SizeName = matchedSize.Name
	t.SizeID = matchedSize.ID

	return nil
}

//GetTicket ...
func (t *Task) getTicket() error {
	request, err := http.NewRequest("GET", "https://www.supremenewyork.com/ticket.wasm", nil)
	if err != nil {
		return err
	}

	request.Header.Add("User-Agent", t.UserAgent)

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	//Close Request Once Function is Completed
	defer response.Body.Close()

	//body, err := ioutil.ReadAll(response.Body)
	// if err != nil {
	// 	return err
	// }

	return nil

}

//AddToCart adds an item to cart
func (t *Task) AddToCart() error {
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

//GetMobileTotals ...
func (t *Task) GetMobileTotals() error {
	qs := url.Values{}
	qs.Set("order[billing_country]", t.Profile.Billing.Country)
	qs.Set("cookie-sub", t.CookieSub)
	qs.Set("mobile", "true")

	request, _ := http.NewRequest("GET", t.BaseURL+"/checkout/totals_mobile.js?"+qs.Encode(), nil)

	request.Header.Set("Accept", "text/html")
	request.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Set("Referer", t.BaseURL+"/mobile")
	request.Header.Set("User-Agent", t.UserAgent)
	request.Header.Set("X-Requested-With", "XMLHttpRequest")

	domain, _ := url.Parse("https://www.supremenewyork.com")
	lastVisitedFragment := []*http.Cookie{{
		Domain: "www.supremenewyork.com",
		Path:   "/",
		Name:   "lastVisitedFragment",
		Value:  "checkout",
	}}

	t.Client.Jar.SetCookies(domain, lastVisitedFragment)

	response, err := t.Client.Do(request)

	if err != nil {
		return err
	}

	defer response.Body.Close()

	document, err := goquery.NewDocumentFromReader(response.Body)

	if err != nil {
		return err
	}

	jwtElement := document.Find(`input#jwt_cardinal`)
	jwtValue, exists := jwtElement.Attr("value")

	if exists {
		t.CardinalJWT = jwtValue
	}

	totalElement := document.Find(`#total`)
	totalValue := totalElement.Text()

	if totalValue != "" {
		t.OrderTotal = totalValue
	}
	return nil

}

//ParseCheckoutForm ...
func (t *Task) ParseCheckoutForm() (map[string]string, error) {
	request, err := http.NewRequest("GET", t.BaseURL+"/mobile", nil)

	if err != nil {
		return nil, err
	}

	response, err := t.Client.Do(request)

	if err != nil {
		return nil, err
	}

	defer response.Body.Close()

	document, err := goquery.NewDocumentFromReader(response.Body)

	if err != nil {
		return nil, err
	}

	checkoutViewTemplate := document.Find(`script#checkoutViewTemplate`)

	checkoutForm, _ := goquery.NewDocumentFromReader(strings.NewReader(checkoutViewTemplate.Text()))

	checkoutForm.Find(":input").Each(func(index int, element *goquery.Selection) {

	})

	return nil, nil
}

//InitCardinal ...
func (t *Task) InitCardinal() error {
	payload := `{
		"BrowserPayload":{"Order":{"OrderDetails":{},"Consumer":{"BillingAddress":{},"ShippingAddress":{},"Account":{}},"Cart":[],"Token":{},"Authorization":{},"Options":{},"CCAExtension":{}},"SupportsAlternativePayments":{"cca":true,"hostedFields":false,"applepay":false,"discoverwallet":false,"wallet":false,"paypal":false,"visacheckout":false}},"Client":{"Agent":"SongbirdJS","Version":"1.30.2"},"ConsumerSessionId":null,
		"ServerJWT": "` + t.CardinalJWT + `"
	}`
	request, _ := http.NewRequest("POST", "https://centinelapi.cardinalcommerce.com/V1/Order/JWT/Init", strings.NewReader(payload))

	uniqueID := uuid.New()
	t.CardinalTid = "Tid-" + uniqueID.String()

	request.Header.Add("accept", "*/*")
	//request.Header.Add("accept-encoding", "gzip, deflate, br")
	request.Header.Add("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Add("content-type", "application/json;charset=UTF-8")
	request.Header.Add("origin", t.BaseURL)
	request.Header.Add("referer", t.BaseURL+"/mobile")
	request.Header.Add("user-agent", t.UserAgent)
	request.Header.Add("x-cardinal-tid", t.CardinalTid)

	response, err := t.Client.Do(request)

	if err != nil {
		return err
	}

	defer response.Body.Close()

	var body map[string]string

	json.NewDecoder(response.Body).Decode(&body)

	t.CardinalJWT = body["CardinalJWT"]
	b64url := strings.Split(t.CardinalJWT, ".")[1]
	replacer := strings.NewReplacer("-", "+", "_", "/")
	b64string := replacer.Replace(b64url)
	decodedBytes, err := base64.StdEncoding.DecodeString(b64string)
	if err != nil {
		return err
	}
	var data map[string]string
	json.NewDecoder(strings.NewReader(string(decodedBytes))).Decode(&data)

	t.CardinalID = data["ConsumerSessionId"]

	return nil
}

//PostCheckout submits the order
func (t *Task) PostCheckout() error {
	form := url.Values{}

	form.Set("store_credit_id", "")
	form.Set("from_mobile", "1")
	form.Set("cookie-sub", t.CookieSub)
	form.Set("cardinal_id", t.CardinalID)
	form.Set("same_as_billing_address", "1")
	form.Set("order[billing_name]", t.Profile.Billing.FirstName+" "+t.Profile.Billing.LastName)
	form.Set("order[email]", t.Profile.Billing.Email)
	form.Set("order[tel]", t.Profile.Billing.Telephone)
	form.Set("order[billing_address]", t.Profile.Billing.Address1)
	form.Set("order[billing_address_2]", t.Profile.Billing.Address2)
	form.Set("order[billing_address_3]", "")
	form.Set("order[billing_city]", t.Profile.Billing.City)
	form.Set("atok", "sckrsarur")
	form.Set("order[billing_zip]", t.Profile.Billing.Zip)
	form.Set("order[billing_country]", t.Profile.Billing.Country)
	form.Set("credit_card[type]", t.Profile.Payment.Type)
	form.Set("credit_card[cnb]", t.Profile.Payment.CardNumber)
	form.Set("credit_card[month]", t.Profile.Payment.ExpMonth)
	form.Set("credit_card[year]", t.Profile.Payment.ExpYear)
	form.Set("credit_card[ovv]", t.Profile.Payment.Cvv)
	form.Set("order[terms]", "1")
	form.Set("g-recaptcha-response", "")

	checkoutForm := form.Encode()

	request, err := http.NewRequest("POST", t.BaseURL+"/checkout.json", strings.NewReader(checkoutForm))

	if err != nil {
		return err
	}

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	//request.Header.Add("Accept-Encoding", "gzip, deflate, br")
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Add("Origin", t.BaseURL)
	request.Header.Add("Referer", t.BaseURL+"/mobile")
	request.Header.Add("User-Agent", t.UserAgent)
	request.Header.Add("X-Requested-With", "XMLHttpRequest")

	response, err := t.Client.Do(request)

	if err != nil {
		return err
	}

	defer response.Body.Close()

	// var reader io.Reader
	// switch response.Header.Get("content-encoding") {
	// case "gzip":
	// 	uncompressedBody, err := gzip.NewReader(response.Body)

	// 	if err != nil {
	// 		t.Err.Println(err.Error())
	// 		reader = response.Body
	// 	} else {
	// 		reader = uncompressedBody
	// 	}
	// 	break
	// default:
	// 	t.Err.Println("Unexpected Content-Encoding: " + response.Header.Get("content-encoding"))
	// 	reader = response.Body
	// }

	// body, err := ioutil.ReadAll(reader)
	// if err != nil {
	// 	return err
	// }

	//t.Info.Println("Checkout Response: " + string(body))
	var jsonBody checkoutResponse
	json.NewDecoder(response.Body).Decode(&jsonBody)
	t.CheckoutResponse = jsonBody
	return nil
}

//PollStatus checks the status of submitted order
func (t *Task) PollStatus() error {
	request, err := http.NewRequest("GET", t.BaseURL+"/checkout/"+t.Slug+"/status.json", nil)

	if err != nil {
		return err
	}

	t.Client.Do(request)
	return nil
}

func (data nameID) matchesKWs(keywords *string) bool {
	splitKeywords := strings.Split(*keywords, ",")

	name := strings.ToLower((data).Name)
	for _, v := range splitKeywords {
		input := strings.ToLower(string(v[1:]))
		if string(v[0]) == "+" && !strings.Contains(name, input) {
			return false
		} else if string(v[0]) == "-" && strings.Contains(name, input) {
			return false
		}
	}

	return true
}

type stockResponse struct {
	Categories map[string][]stockItem `json:"products_and_categories"`
}

type nameID struct {
	Name string `json:"name"`
	ID   int    `json:"id"`
}

type stockItem struct {
	nameID
}

type productStyle struct {
	nameID
	ImageURL string        `json:"image_url"`
	Sizes    []productSize `json:"sizes"`
}

type productSize struct {
	nameID
	StockLevel int `json:"stock_level"`
}

type productResponse struct {
	Styles []productStyle `json:"styles"`
}

type cartResponseItem struct {
	SizeID  string `json:"size_id"`
	InStock bool   `json:"in_stock"`
}

type checkoutResponse struct {
	Status string                   `json:"status"`
	Slug   string                   `json:"slug,omitempty"`
	ID     int                      `json:"id,omitempty"`
	Page   string                   `json:"page,omitempty"`
	MPA    []map[string]interface{} `json:"mpa,omitempty"`
	MPS    map[string]interface{}   `json:"mps,omitempty"`
}
