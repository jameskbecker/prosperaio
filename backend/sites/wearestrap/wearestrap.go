package wearestrap

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"prosperaio/config"
	"prosperaio/discord"
	"prosperaio/utils/client"
	"prosperaio/utils/log"
)

const useragent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"

//atc url https://wearestrap.com/es/carrito?add=1&id_product=4074&id_product_attribute=14580

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

//Run --
func Run(i config.TaskInput) {
	// //startTS := time.Now()
	c, _ := client.Create(i.Proxy)

	t := task{
		size:    i.Size,
		profile: i.Profile,
		id:      i.ID,
		monitor: i.MonitorDelay,
		retry:   i.RetryDelay,
		client:  &c,
		pData:   productData{PID: "0000"},
	}
	t.updatePrefix()
	pURL, err := url.Parse(i.MonitorInput)
	if err != nil {
		t.log.Error("Invalid Product URL")
		return
	}

	t.productURL = pURL
	t.baseURL = "https://" + t.productURL.Hostname()
	t.log.Debug("Starting Task")

	t.cartProcess()
	t.checkoutProcess()

	discord.PostWebhook(i.WebhookURL, t.webhookMessage())
	i.WG.Done()
}

func (t *task) cartProcess() {
	pDataP := productData{}
	for {
		t.log.Warn("Getting product data")
		body, err := t.getProductData()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.monitor)
			continue
		}

		pData, err := t.parseProductData(body)
		if err != nil {
			t.log.Error("Product Data Not Found")
			time.Sleep(t.monitor)
			continue
		}
		pDataP = pData
		break
	}
	t.pData = pDataP
	t.updatePrefix()
	t.log.Warn("Adding to cart")
	addForm := atcForm(pDataP)
	qtyP := 0
	for {
		qty, err := t.add(addForm)
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		qtyP = qty
		break
	}
	qtyS := strconv.Itoa(qtyP)
	t.log.Info("Successfully added " + qtyS + " item(s) to cart!")

	for {
		t.log.Warn("Verifying ATC")
		err := t.verifyCart()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retry)
			continue
		}
		break
	}

	for {
		t.log.Warn("Getting Blocks")
		err := t.getPaymentAndShippingBlocks()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retry)
			continue
		}
		break
	}
}

func (t *task) checkoutProcess() {
	t.log.Warn("Checking out")
	for {
		t.log.Debug("Getting Checkout Token")
		err := t.getToken()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retry)
			continue
		}
		break
	}
	for {
		t.log.Debug("Submitting Account and Address")
		err := t.modifyAccountAndAddress()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retry)
			continue
		}

		t.log.Debug("Checking Email")
		err = t.checkEmailReq()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retry)
			continue
		}

		t.log.Debug("Accepting GDPR")
		err = t.acceptGDPR()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retry)
			continue
		}

		t.log.Debug("Accepting T&S")
		err = t.acceptTerms()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retry)
			continue
		}
		break
	}

	checkoutURL, err := t.getPPURL()
	if err != nil {
		t.log.Error(err.Error())
		return
	}
	t.checkoutURL = checkoutURL

	t.log.Info("Successfully Checked out!")
	t.log.Debug("Checkout URL: " + checkoutURL)
}

func (t *task) updatePrefix() {
	tID := fmt.Sprintf("%04d", t.id)
	prefix := "[" + tID + "] [wearestrap] [" + t.size + "] [" + t.pData.PID + "] "
	t.log = log.Logger{Prefix: prefix}
}

func defaultHeaders(baseURL string) [][]string {
	return [][]string{
		{"accept", "application/json, text/javascript, */*; q=0.01"},
		//{"accept-encoding", "gzip, deflate, br"},
		{"accept-language", "en-GB,en;q=0.9"},
		{"content-type", "application/x-www-form-urlencoded; charset=UTF-8"},
		{"origin", baseURL},
		{"sec-fetch-site", "same-origin"},
		{"sec-fetch-mode", "cors"},
		{"sec-fetch-dest", "empty"},
		{"user-agent", useragent},
		{"x-requested-with", "XMLHttpRequest"},
	}
}

func (t *task) webhookMessage() discord.Message {
	tn := discord.Image{URL: t.thumbnailURL}
	size := "N/A"
	if t.size != "" {
		size = t.size
	}
	fields := []discord.Field{
		{Name: "Product", Value: t.pData.Name, Inline: false},
		{Name: "Site", Value: "wearestrap", Inline: true},
		{Name: "Size", Value: size, Inline: true},
		{Name: "Checkout Link", Value: "[Click Here](" + t.checkoutURL + ")", Inline: true},
	}

	embedData := discord.Embed{
		Title:  "Successful Checkout",
		Type:   "rich",
		Color:  3642623,
		Fields: fields,
		Footer: discord.GetFooter(),
	}

	if tn.URL != "" {
		embedData.Thumbnail = tn
	}

	return discord.Message{
		Embeds: []discord.Embed{embedData},
	}
}

func getCountryCode(key string) int {
	data := map[string]int{
		"AT": 2,
		"BE": 3,
		"BA": 233,
		"BG": 236,
		"CY": 76,
		"CZ": 16,
		"DK": 20,
		"EE": 86,
		"FI": 7,
		"FR": 8,
		"DE": 1,
		"GR": 9,
		"HU": 143,
		"IE": 26,
		"IT": 10,
		"LV": 125,
		"LI": 130,
		"LT": 131,
		"LU": 12,
		"MT": 139,
		"NL": 13,
		"PL": 14,
		"PT": 15,
		"RO": 36,
		"SK": 37,
		"SI": 193,
		"ES": 6,
		"SE": 18,
		"UA": 216,
		"UK": 17,
	}

	return data[strings.ToUpper(key)]
}
