package main

import (
	"log"
	"net/http"
	"time"
)

/*----------------------------------- GENERAL -----------------------------------*/

//Task ...
type Task struct {
	Profile                                                           *Profile
	Client                                                            http.Client
	Warn, Info, Debug, Err                                            *log.Logger
	BaseURL, UserAgent                                                string
	InputKW, InputStyle, InputCat, InputSize, InputQty                string
	Slug, CookieSub, CardinalJWT, CardinalTid, CardinalID, OrderTotal string
	CartResponse                                                      string
	CheckoutResponse                                                  checkoutResponse
	ProductName, StyleName, SizeName                                  string
	ProductID, StyleID, SizeID, OrderNumber                           int
	ErrorDelay, MonitorDelay                                          time.Duration
}

//Profile ...
type Profile struct {
	ProfileName  string   `json:"profileName"`
	Billing      *Contact `json:"billing"`
	Shipping     *Contact `json:"shipping"`
	Payment      *Payment `json:"payment"`
	SameShipping bool
}

//Contact ...
type Contact struct {
	FirstName string `json:"first"`
	LastName  string `json:"last"`
	Email     string `json:"email"`
	Telephone string `json:"telephone"`
	Address1  string `json:"address1"`
	Address2  string `json:"address2"`
	City      string `json:"city"`
	Zip       string `json:"zip"`
	Country   string `json:"country"`
	State     string `json:"state"`
}

//Payment ...
type Payment struct {
	Type       string `json:"type"`
	CardNumber string `json:"cardNumber"`
	ExpMonth   string `json:"expiryMonth"`
	ExpYear    string `json:"expiryYear"`
	Cvv        string `json:"cvv"`
}
