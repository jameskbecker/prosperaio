package main

import (
	"compress/gzip"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	// "github.com/google/brotli/go/cbrotli"
)

//GetHomePage ...
func (t *Task) GetHomePage() error {
	request, err := http.NewRequest("GET", "https://www.off---white.com", nil)

	if err != nil {
		return err
	}

	request.Header.Add("upgrade-insecure-requests", "1")
	request.Header.Add("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36")
	request.Header.Add("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	request.Header.Add("sec-fetch-site", "none")
	request.Header.Add("sec-fetch-mode", "navigate")
	request.Header.Add("sec-fetch-user", "?1")
	request.Header.Add("sec-fetch-dest", "document")
	request.Header.Add("accept-encoding", "gzip, deflate")
	request.Header.Add("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	response, err := t.Client.Do(request)

	if err != nil {
		return err
	}

	var reader io.Reader

	switch response.Header.Get("Content-Encoding") {
	// case "br":
	// 	r, err := cbrotli.NewReader(response.Body)
	// 	if err != nil {
	// 		return err
	// 	}
	// 	reader = r
	// 	break

	case "gzip":
		r, err := gzip.NewReader(response.Body)
		if err != nil {
			return err
		}
		reader = r
		break
	default:
		log.Println(response.Header.Get("Content-Encoding"))
		reader = response.Body
	}

	body, err := ioutil.ReadAll(reader)

	if err != nil {
		return err
	}

	log.Println(string(body))
	log.Println(response.Header)

	return nil
}

type item struct {
	CustomAttributes string `json:"customAttributes"`
	MerchantID       int    `json:"merchantId"`
	ProductID        string `json:"productId"`
	Quantity         int    `json:"quantity"`
	Scale            int    `json:"scale"`
	Size             int    `json:"size"`
}

type guestOrder struct {
	BagID          string `json:"json:"bagId"`
	GuestUserEmail string `json:"guestUserEmail	"`
}

type contactInfo struct {
	ShippingAddress address        `json:"shippingAddress"`
	billingAddress  billingAddress `json:"billingAddress"`
}

type address struct {
	FirstName string  `json:"firstName"`
	LastName  string  `json:"lastName"`
	Phone     string  `json:"phone"`
	Country   country `json:"country"`
	Address1  string  `json:"addressLine1"`
	Address2  string  `json:"addressLine2"`
	Address3  string  `json:"addressLine3"`
	City      city    `json:"city"`
	State     state   `json:"state"`
	ZipCode   string  `json:"zipCode"`
}

type billingAddress struct {
	*address
	ID                       int  `json:"id"`
	userID                   int  `json:"userId"`
	IsDefaultBillingAddress  bool `json:"isDefaultBillingAddress"`
	isDefaultShippingAddress bool `json:"isDefaultShippingAddress"`
}

type country struct {
	Name        string `json:"name"`
	ID          string `json:"id"`
	Alpha2Code  string `json:"alpha2Code"`
	Alpha3Code  string `json:"alpha3Code"`
	Culture     string `json:"culture"`
	NativeName  string `json:"nativeName"`
	Region      string `json:"region"`
	RegionID    int    `json:"regionId"`
	Subfolder   string `json:"subfolder"`
	ContinentID int    `json:"continentId"`
}

type city struct {
	CountryID int    `json:"countryId"`
	ID        int    `json:"id"`
	Name      string `json:"name"`
}

type state struct {
	CountryID int    `json:"countryId"`
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Code      string `json:"code"`
}

type shippingOption struct {
	Discount              int             `json:"discount"`
	Merchants             []int           `json:"merchants"`
	Price                 int             `json:"price"`
	FormattedPrice        string          `json:"formattedPrice"`
	ShippingCostType      int             `json:"shippingCostType"`
	ShippingService       shippingService `json:"shippingService"`
	ShippingWithoutCapped int             `json:"shippingWithoutCapped"`
	BaseFlatRate          int             `json:"baseFlatRate"`
}

type shippingService struct {
	Description              string   `json:"description"`
	ID                       int      `json:"id"`
	Name                     string   `json:"name"`
	Type                     string   `json:"type"`
	MinEstimatedDeliveryHour int      `json:"minEstimatedDeliveryHour"`
	MaxEstimatedDeliveryHour int      `json:"maxEstimatedDeliveryHour"`
	TrackingCodes            []string `json:"trackingCodes"`
}

type paymentInfo struct {
	CardNumber               string `json:"cardNumber"`
	CardExpiryMonth          int    `json:"cardExpiryMonth"`
	CardExpiryYear           int    `json:"cardExpiryYear"`
	CardName                 string `json:"cardName"`
	CardCvv                  string `json:"cardCvv"`
	PaymentMethodType        string `json:"paymentMethodType"`
	PaymentMethodID          string `json:"paymentMethodId"`
	SavePaymentMethodAsToken bool   `json:"savePaymentMethodAsToken"`
}

/*
{
	"billingAddress": {
		"city": {
			"countryId": 77,
			"id": 0,
			"name": "Bonn"
		},
		"country": {
			"alpha2Code": "DE",
			"alpha3Code": "DEU",
			"culture": "de-DE",
			"id": 77,
			"name": "Germany",
			"nativeName": "Germany",
			"region": "Europe",
			"regionId": 0,
			"subfolder": "/de-DE",
			"continentId": 3
		},
		"id": "00000000-0000-0000-0000-000000000000",
		"lastName": "Becker",
		"state": {
			"countryId": 0,
			"id": 0,
			"code": "NRW",
			"name": "NRW"
		},
		"userId": 0,
		"isDefaultBillingAddress": false,
		"isDefaultShippingAddress": false,
		"addressLine1": "Joseph Roth Strasse 110",
		"addressLine2": "",
		"firstName": "James",
		"phone": "015903762209",
		"zipCode": "53175"
	}
}
*/
