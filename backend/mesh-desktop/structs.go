package mesh

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

type address struct {
	SameDelivery bool   `json:"useDeliveryAsBilling"`
	Country      string `json:"country"`
	Locale       string `json:"locale"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	Phone        string `json:"phone"`
	Address1     string `json:"address1"`
	Address2     string `json:"address2"`
	Town         string `json:"town"`
	County       string `json:"county"`
}

type deliveryUpdate struct {
	AddressID    string       `json:"addressId"`
	MethodID     string       `json:"methodId"`
	DeliverySlot deliverySlot `json:"deliverySlot"`
}

type deliverySlot struct {
}

type billingUpdate struct {
	EditAddressID string `json:"editAddressID"`
}
