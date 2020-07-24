package main

//Data ...
type Data struct {
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

//GetProfile ...
// func GetProfile() *Data {
// 	mockProfile := Data{
// 		ProfileName: "Test",
// 		Billing: Contact{
// 			FirstName: "John",
// 			LastName:  "Elliot",
// 			Email:     "johnelliot@gmail.com",
// 			Telephone: "01590362209",
// 			Address1:  "Joseph Roth Str",
// 			Address2:  "110",
// 			City:      "Bonn",
// 			Zip:       "53175",
// 			Country:   "DE",
// 			State:     ""},

// 		Shipping: Contact{
// 			FirstName: "John",
// 			LastName:  "Elliot",
// 			Email:     "johnelliot@gmail.com",
// 			Telephone: "01590362209",
// 			Address1:  "Joseph Roth Str",
// 			Address2:  "110",
// 			City:      "Bonn",
// 			Zip:       "53175",
// 			Country:   "DE",
// 			State:     ""},

// 		Payment: Payment{
// 			Type:       "visa",
// 			CardNumber: "4242 4242 4242 4242",
// 			ExpMonth:   "11",
// 			ExpYear:    "2024",
// 			Cvv:        "498",
// 		}}

// 	return &mockProfile
// }
