package supreme

import (
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

//Totals ...
func (t *Task) Totals() error {
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
		log.Println(jwtValue)
		t.CardinalJWT = jwtValue
	}

	totalElement := document.Find(`#total`)
	totalValue := totalElement.Text()

	if totalValue != "" {
		t.OrderTotal = totalValue
	}
	return nil

}

//Submit the order
func (t *Task) Submit() error {
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

//Status checks the status of submitted order
func (t *Task) Status() error {
	request, err := http.NewRequest("GET", t.BaseURL+"/checkout/"+t.Slug+"/status.json", nil)

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
