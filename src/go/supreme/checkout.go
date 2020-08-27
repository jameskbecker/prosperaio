package supreme

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/google/uuid"
)

//Totals ...
func (t *InputOptions) Totals() error {
	qs := url.Values{}
	qs.Set("order[billing_country]", t.Address.Country)
	qs.Set("cookie-sub", t.CookieSub)
	qs.Set("mobile", "true")

	path := "/checkout/totals_mobile.js"
	url := t.BaseURL.Scheme + "://" + t.BaseURL.Host + path + "?" + qs.Encode()

	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	request.Header.Set("Accept", "text/html")
	request.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Set("Referer", t.BaseURL.Scheme+t.BaseURL.Host+"/mobile")
	request.Header.Set("User-Agent", t.UserAgent)
	request.Header.Set("X-Requested-With", "XMLHttpRequest")

	lastVisitedFragment := []*http.Cookie{{Name: "lastVisitedFragment", Value: "checkout"}}
	t.Client.Jar.SetCookies(t.BaseURL, lastVisitedFragment)

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

//StartCardinal ...
func (t *InputOptions) StartCardinal() error {
	payload := `{
		"BrowserPayload":{
			"Order":{
				"OrderDetails":{},
				"Consumer":{
					"BillingAddress":{},
					"ShippingAddress":{},
					"Account":{}
				},
				"Cart":[],
				"Token":{},
				"Authorization":{},
				"Options":{},
				"CCAExtension":{}
			},
			"SupportsAlternativePayments":{
				"cca":true,"hostedFields":false,"applepay":false,"discoverwallet":false,"wallet":false,"paypal":false,"visacheckout":false
			}
		},
		"Client":{"Agent":"SongbirdJS","Version":"1.30.2"},
		"ConsumerSessionId":null,
		"ServerJWT":"` + t.CardinalJWT + `"
	}`
	request, _ := http.NewRequest("POST", "https://centinelapi.cardinalcommerce.com/V1/Order/JWT/Init", strings.NewReader(payload))

	uniqueID := uuid.New()
	t.CardinalTid = "Tid-" + uniqueID.String()

	request.Header.Add("accept", "*/*")
	//request.Header.Add("accept-encoding", "gzip, deflate, br")
	request.Header.Add("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Add("content-type", "application/json;charset=UTF-8")
	request.Header.Add("origin", t.BaseURL.Scheme+t.BaseURL.Host)
	request.Header.Add("referer", t.BaseURL.Scheme+t.BaseURL.Host+"/mobile")
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

	replacer := strings.NewReplacer("-", "+", "_", "/")
	b64url := strings.Split(t.CardinalJWT, ".")[1]
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

//Submit the order
func (t *InputOptions) Submit() error {
	form := url.Values{}

	form.Set("store_credit_id", "")
	form.Set("from_mobile", "1")
	form.Set("cookie-sub", t.CookieSub)
	form.Set("cardinal_id", t.CardinalID)
	form.Set("same_as_billing_address", "1")
	form.Set("order[billing_name]", t.Address.FirstName+" "+t.Address.LastName)
	form.Set("order[email]", t.Address.Email)
	form.Set("order[tel]", t.Address.Telephone)
	form.Set("order[billing_address]", t.Address.Address1)
	form.Set("order[billing_address_2]", t.Address.Address2)
	form.Set("order[billing_address_3]", "")
	form.Set("order[billing_city]", t.Address.City)
	form.Set("atok", "sckrsarur")
	form.Set("order[billing_zip]", t.Address.Zip)
	form.Set("order[billing_country]", t.Address.Country)
	form.Set("credit_card[type]", t.Card.Type)
	form.Set("credit_card[cnb]", t.Card.Number)
	form.Set("credit_card[month]", t.Card.Month)
	form.Set("credit_card[year]", t.Card.Year)
	form.Set("credit_card[ovv]", t.Card.CVV)
	form.Set("order[terms]", "1")
	form.Set("g-recaptcha-response", "")

	checkoutForm := form.Encode()
	path := "/checkout.json"
	url := t.BaseURL.Scheme + "://" + t.BaseURL.Host + path

	request, err := http.NewRequest("POST", url, strings.NewReader(checkoutForm))

	if err != nil {
		return err
	}

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	//request.Header.Add("Accept-Encoding", "gzip, deflate, br")
	request.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Add("Origin", t.BaseURL.Scheme+t.BaseURL.Host)
	request.Header.Add("Referer", t.BaseURL.Scheme+t.BaseURL.Host+"/mobile")
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

//Status checks the status of submitted order
func (t *InputOptions) Status() error {
	path := "/checkout/" + t.Slug + "/status.json"
	url := t.BaseURL.Scheme + "://" + t.BaseURL.Host + path

	request, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}

	t.Client.Do(request)
	return nil
}

type checkoutResponse struct {
	Status string                   `json:"status"`
	Slug   string                   `json:"slug,omitempty"`
	ID     int                      `json:"id,omitempty"`
	Page   string                   `json:"page,omitempty"`
	MPA    []map[string]interface{} `json:"mpa,omitempty"`
	MPS    map[string]interface{}   `json:"mps,omitempty"`
}
