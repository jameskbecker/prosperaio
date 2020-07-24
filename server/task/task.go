package task

type task struct {
	Profile          string    `json:"profile"`
	Mode             string    `json:"mode"`
	RestockMode      string    `json:"restockMode"`
	Site             string    `json:"site"`
	ProxyList        string    `json:"proxyList"`
	Timer            string    `json:"timer"`
	CheckoutAttempts int       `json:"checkoutAttempts"`
	CartDelay        int       `json:"cartDelay"`
	CheckoutDelay    int       `json:"checkoutDelay"`
	MonitorRestocks  bool      `json:"monitorRestocks"`
	BypassCaptcha    bool      `json:"bypassCaptcha"`
	BypassThreeDS    bool      `json:"bypassThreeDS"`
	Products         []product `json:"products"`
}

type product struct {
	Keywords string `json:"keywords"`
	Category string `json:"category"`
	Size     string `json:"size"`
	Style    string `json:"style"`
	Qty      int    `json:"qty"`
}
