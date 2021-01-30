package wearestrap

import (
	"net/http"
	"net/url"
	"time"

	"prosperaio/config"
	"prosperaio/utils/log"
)

//Address ...
// type Address struct {
// 	First   string
// 	Last    string
// 	Address string
// 	City    string
// 	Zip     string
// 	Country string
// 	Phone   string
// }

type task struct {
	id           int
	productURL   *url.URL
	baseURL      string
	size         string
	checkoutURL  string
	thumbnailURL string
	token        string
	staticToken  string
	monitor      time.Duration
	retry        time.Duration
	profile      config.Profile
	pData        productData
	log          log.Logger
	client       *http.Client
}

type productData struct {
	Token, PID, CustID, PVal, Name string
}

type atcResponse struct {
	Success bool   `json:"success"`
	Errors  string `json:"errors"`
	Qty     int    `json:"quantity"`
	Cart    cart   `json:"cart"`
}

type cart struct {
	Products []product `json:"products"`
}

type product struct {
	Cover imageData `json:"cover"`
}

type imageData struct {
	Medium image `json:"medium"`
}

type image struct {
	URL    string `json:"url"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
}

type addressResponse struct {
	EmptyCart     bool        `json:"emptyCart"`
	IsVirtualCart bool        `json:"isVirtualCart"`
	PurchaseError bool        `json:"minimalPurchaseError"`
	Account       accountRes  `json:"account"`
	Invoice       interface{} `json:"invoice"`
}

type accountRes struct {
	NewToken       string `json:"newToken"`
	NewStaticToken string `json:"newStaticToken"`
}

type ppTokenResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token"`
}

type webhookData struct {
	ProductName  string
	CheckoutURL  string
	thumbnailURL string
}
