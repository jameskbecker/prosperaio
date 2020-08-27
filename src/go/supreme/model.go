package supreme

import (
	"log"
	"net"
	"net/http"
	"net/url"
	"time"
)

//InputOptions ...
type InputOptions struct {
	ID                     string
	Address                *address
	Socket                 *net.Conn
	Card                   *card
	Client                 http.Client
	Warn, Info, Debug, Err *log.Logger
	BaseURL                *url.URL
	CheckoutResponse       checkoutResponse
	UserAgent              string

	ProductURL string

	Keywords      string
	StyleKeywords string
	Category      string
	SizeKeywords  string
	Quantity      int

	Slug      string
	CookieSub string

	CardinalJWT string
	CardinalTid string
	CardinalID  string

	OrderTotal   string
	CartResponse string

	ProductName string
	StyleName   string
	SizeName    string

	ProductID   int
	StyleID     int
	SizeID      int
	OrderNumber int

	CookieString string
	TicketPath   string

	ErrorDelay   time.Duration
	MonitorDelay time.Duration
}

type address struct {
	FirstName string
	LastName  string
	Email     string
	Telephone string
	Address1  string
	Address2  string
	City      string
	Zip       string
	Country   string
	State     string
}

type card struct {
	Type   string
	Number string
	Month  string
	Year   string
	CVV    string
}
