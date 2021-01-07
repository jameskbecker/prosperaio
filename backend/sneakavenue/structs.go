package sneakavenue

import "net/http"

//TaskInput ...
type TaskInput struct {
	ProductURL string
	SizeInput  string
	Billing    Address
	Shipping   Address
}

//Address ...
type Address struct {
	FirstName string
	LastName  string
	Email     string
	Phone     string
	Address1  string
	Address2  string
	City      string
	Zip       string
	Country   string
	State     string
}

type sneakAvenue struct {
	BaseURL    string
	Billing    Address
	Shipping   Address
	Client     http.Client
	SizeInput  string
	UserAgent  string
	ProductURL string
	PaymentID  string
	PaypalUID  string
	ECToken    string
	AttrVal    string
	ProductID  string
	BSID       string
}

type productInitResponse struct {
	InitializedProduct struct {
		ID   int `json:"id"`
		BSID int `json:"bsId"`
	} `json:"initializedProduct"`
}

type payment struct {
	PaymentID   string `json:"paymentID"`
	Success     bool   `json:"success"`
	RedirectURL string `json:"redirectUrl"`
}
