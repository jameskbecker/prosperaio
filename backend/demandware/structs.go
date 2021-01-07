package demandware

import (
	"log"
	"net/http"
	"net/url"
)

//Input data to run task
type Input struct {
	Site       string
	Mode       string
	ProductURL string
	Size       string
	Profile    Profile
}

//Task ...
type Task struct {
	ProductURL                  *url.URL
	BaseURL                     *url.URL
	Profile                     Profile
	PDataURL                    string
	SiteID                      string
	Site                        string
	Size                        string
	PID                         string
	ShipmentID                  string
	log, lWrn, lInf, lErr, lDbg *log.Logger
	BPID                        string
	TNbr                        string
	PName                       string
	PBrand                      string
	OptionID                    string
	ValueID                     string
	PX3                         string
	CSRFToken                   string
	UserAgent                   string
	Client                      http.Client
}

//Profile ...
type Profile struct {
	Billing  Address
	Shipping Address
	Payment  Payment
	Email    string
	Phone    string
}

//Address ...
type Address struct {
	Title       string
	FirstName   string
	LastName    string
	PostalCode  string
	City        string
	Street      string
	Suite       string
	Address1    string
	Address2    string
	CountryCode string
}

//Payment ...
type Payment struct {
	Method       string
	CardNumber   string
	GiftCardPins string
}

type pxResponse struct {
	Cookie string `json:"cookie"`
	Error  string `json:"error"`
}

type productShow struct {
	Product productShowProduct `json:"product"`
}

type productShowProduct struct {
	ID    string `json:"id"`
	Name  string `json:"productName"`
	Brand string `json:"brand"`
}

type placeOrderResponse struct {
	PaypalURL string `json:"continueUrl"`
	Error     bool   `json:"error"`
}

type atcResponse struct {
	Action  string `json:"action"`
	Message string `json:"message"`
	Error   bool   `json:"error"`
	Cart    cart   `json:"cart"`
}

type cart struct {
	Items []cartItem `json:"items"`
}

type cartItem struct {
	ShipmentID string `json:"shipmentUUID"`
}
