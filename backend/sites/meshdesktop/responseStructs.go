package meshdesktop

type atcResponse struct {
	ID              string       `json:"ID"`
	Href            string       `json:"href"`
	Count           int          `json:"count"`
	HasGuest        bool         `json:"canCheckoutAsGuest"`
	Ref             string       `json:"reference"`
	Customer        *interface{} `json:"customer"`
	BillingAddress  *interface{} `json:"billingAddress"`
	DeliveryAddress *interface{} `json:"deliveryAddress"`
	Delivery        delivery     `json:"delivery"`
	Contents        []contents   `json:"contents"`
	Error           atcError     `json:"error"`
}

type atcError struct {
	Message string       `json:"message"`
	Info    atcErrorInfo `json:"info"`
}

type atcErrorInfo struct {
	RecaptchaRequired bool   `json:"recaptchaRequired"`
	Sitekey           string `json:"sitekey"`
}

type contents struct {
	Name  string `json:"name"`
	Image image  `json:"image"`
}

type image struct {
	URL string `json:"originalURL"`
}

type delivery struct {
	DeliveryMethodID string `json:"deliveryMethodID"`
}
