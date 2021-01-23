package meshmobile

import (
	"net/http"
	"net/url"
)

type task struct {
	client     *http.Client
	productURL *url.URL
	baseURL    string
	sku        string
	useragent  string
}

type atcForm struct {
	Customisations          bool        `json:"customisations"`
	CartPosition            interface{} `json:"cartPosition"`
	RecaptchaResponse       bool        `json:"recaptchaResponse"`
	CartProductNotification interface{} `json:"cartProductNotification"`
	QuantityToAdd           int         `json:"quantityToAdd"`
}

type apiResponse struct {
	ID       string `json:"ID"`
	Href     string `json:"href"`
	Count    int    `json:"count"`
	HasGuest bool   `json:"canCheckoutAsGuest"`
}

type guestResponse struct {
	Message string `json:"message"`
}

/* API STRUCTS */
type customer struct {
	Phone     string    `json:"phone"`
	Gender    string    `json:"gender"`
	FirstName string    `json:"firstName"`
	Addresses []address `json:"addresses"`
	Title     string    `json:"title"`
	Email     string    `json:"email"`
	IsGuest   bool      `json:"isGuest"`
	LastName  string    `json:"lastName"`
}
type address struct {
	Locale                  string `json:"locale"`
	County                  string `json:"county"`
	Country                 string `json:"country"`
	Address1                string `json:"address1"`
	Town                    string `json:"town"`
	Postcode                string `json:"postcode"`
	IsPrimaryBillingAddress bool   `json:"isPrimaryBillingAddress"`
	IsPrimaryAddress        bool   `json:"isPrimaryAddress"`
	Address2                string `json:"address2"`
}

type atcWrapper struct {
	Channel  string       `json:"channel"`
	Contents []atcContent `json:"contents"`
}

type atcContent struct {
	Schema string `json:"$schema"`
	SKU    string `json:"SKU"`
	Qty    int    `json:"quantity"`
}

type paymentMethod struct {
	Type      string   `json:"type"`
	Terminals terminal `json:"terminals"`
}

type terminal struct {
	SuccessURL string `json:"successURL"`
	FailureURL string `json:"failureURL"`
	TimeoutURL string `json:"timeoutURL"`
}
