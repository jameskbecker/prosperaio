package kickz

import "net/http"

//Options entered into package entry func
type Options struct {
	ItemNumber    string
	Region        string
	Size          string
	PaymentMethod string
	Cookie        string
}

//Task state struct
type Task struct {
	Options   *Options
	Client    *http.Client
	BaseURL   string
	UserAgent string

	ProductURL       string
	ProductVariantID string
	TToken           string
}

//APIResponse is the general base format returned from requests
type APIResponse struct {
	State         string                 `json:"state"`
	InfoMessages  []string               `json:"infoMessages"`
	ErrorMessages []string               `json:"errorMessages"`
	FieldErrors   []string               `json:"fieldErrors"`
	Data          map[string]interface{} `json:"data"`
	Success       bool                   `json:"success"`
}

//Prod found in cart response
type Prod struct {
	Qty   int    `json:"quantity"`
	Total string `json:"totalAmount"`
	Count string `json:"totalCount"`
}

//ProductVariant found in cart response
type ProductVariant struct {
	Brand    string `json:"brand"`
	Category string `json:"category"`
	ID       string `json:"id"`
	Name     string `json:"name"`
	Price    string `json:"price"`
	Quantity string `json:"quantity"`
	Variant  string `json:"variant"`
}
