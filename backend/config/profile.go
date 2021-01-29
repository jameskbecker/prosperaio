package config

//Profile ...
type Profile struct {
	Name     string
	Email    string
	Phone    string
	Billing  Address
	Shipping Address
}

//Address ...
type Address struct {
	FirstName string
	LastName  string
	Address1  string
	Address2  string
	PostCode  string
	City      string
	Country   string
	State     string
}
