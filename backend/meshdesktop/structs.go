package meshdesktop

import (
	"net/http"
	"net/url"
	"time"

	"../log"
)

//Input ...
type Input struct {
	ErrorDelay   time.Duration
	MonitorDelay time.Duration
	MonitorInput string
	Size         string
	Proxy        string
	Email        string
}

type task struct {
	client     *http.Client
	productURL *url.URL
	log        log.Logger
	id         int
	email      string
	size       string
	baseURL    string
	plu        int
	sku        string
	price      string
	useragent  string
}

//Using pointers to show type as null
type atcForm struct {
	Customisations          bool         `json:"customisations"`
	CartPosition            *interface{} `json:"cartPosition"`
	RecaptchaResponse       interface{}  `json:"recaptchaResponse"` // -> false or capRespString
	CartProductNotification *interface{} `json:"cartProductNotification"`
	QuantityToAdd           int          `json:"quantityToAdd"`
}

type order struct {
	ID              string       `json:"ID"`
	Href            string       `json:"href"`
	Count           int          `json:"count"`
	HasGuest        bool         `json:"canCheckoutAsGuest"`
	Ref             string       `json:"reference"`
	Customer        *interface{} `json:"customer"`
	BillingAddress  *interface{} `json:"billingAddress"`
	DeliveryAddress *interface{} `json:"deliveryAddress"`
}

type messageResponse struct {
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

type priceData struct {
	PLU      string         `json:"plu"`
	Name     string         `json:"description"`
	Price    string         `json:"unitPrice"`
	Variants []priceVariant `json:"variants"`
}

type priceVariant struct {
	Name string `json:"name"`
	UPC  string `json:"upc"`
	SKU  string `json:"page_id_variant"`
}

type productData struct {
	price string
	sku   string
}
