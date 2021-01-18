package wearestrap

type productData struct {
	Token, PID, CustID, PVal string
}

type atcResponse struct {
	Success bool   `json:"success"`
	Errors  string `json:"errors"`
	Qty     int        `json:"quantity"`
	Cover   imageData  `json:"cover"`
}

type imageData struct{
	Medium image `json:"medium"`
}

type image struct {
	URL string `json:"url"`
	Width int `json:"width"`
	Height int `json:"height"`
}

type addressResponse struct {
	EmptyCart     bool        `json:"emptyCart"`
	IsVirtualCart bool        `json:"isVirtualCart"`
	PurchaseError bool        `json:"minimalPurchaseError"`
	Account       interface{} `json:"account"`
	Invoice       interface{} `json:"invoice"`
}

type ppTokenResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token"`
}

type webhookData struct {
	ProductName string
	CheckoutURL string
	thumbnailURL string
}