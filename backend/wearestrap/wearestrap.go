package wearestrap

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"../client"
	"../discord"
	"../log"
)

const baseURL = "https://wearestrap.com"
const pURL = "https://wearestrap.com/es/basket-/4126-nike-dunk-low-sp-women-dd1503-101.html"
const useragent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"
const size = "42.5"

//atc url https://wearestrap.com/es/carrito?add=1&id_product=4074&id_product_attribute=14580

type task struct {
	log    log.Logger
	client *http.Client
	PData  productData
}

//Run --
func Run(twg *sync.WaitGroup) {
	//startTS := time.Now()
	c, _ := client.Create("")
	t := task{
		client: &c,
		PData:  productData{PID: "0000"},
	}

	t.updatePrefix()
	t.log.Debug("Starting Task")

	t.cartProcess()
	//t.checkoutProcess()

	//discord.PostWebhook()
	//twg.Done()
}

func (t *task) cartProcess() {
	pDataP := productData{}
	for {
		t.log.Warn("Getting product data")
		body, err := getProductData(pURL, t.client)
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(1000 * time.Millisecond)
			continue
		}

		pData, err := parseProductData(body)
		if err != nil {
			t.log.Error("Product Data Not Found")
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		pDataP = pData
		break
	}
	t.PData = pDataP
	t.updatePrefix()
	t.log.Warn("Adding to cart")
	addForm := atcForm(pDataP)
	qtyP := 0
	for {
		qty, err := add(addForm, t.client)
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
}

func (t *task) checkoutProcess() {
	t.log.Warn("Checking out")
	t.log.Debug("Submitting Account and Address")
	err := modifyAccountAndAddress(t.client)
	if err != nil {
		t.log.Error(err.Error())
		return
	}
	t.log.Debug("Accepting GDPR")
	err = acceptGDPR(t.client)
	if err != nil {
		t.log.Error(err.Error())
		return
	}

	t.log.Debug("Accepting T&S")
	err = acceptTerms(t.client)
	if err != nil {
		t.log.Error(err.Error())
		return
	}

	checkoutURL, err := getPPURL(t.client)
	if err != nil {
		t.log.Error(err.Error())
		return
	}

	t.log.Info("Successfully Checked out!")
	t.log.Debug("Checkout URL: " + checkoutURL)
}

func (t *task) updatePrefix() {
	prefix := "[wearestrap] [" + size + "] [" + t.PData.PID + "] "
	t.log = log.Logger{Prefix: prefix}
}

func defaultHeaders() [][]string {
	return [][]string{
		[]string{"accept", "application/json, text/javascript, */*; q=0.01"},
		//[]string{"accept-encoding", "gzip, deflate, br"},
		[]string{"accept-language", "en-GB,en;q=0.9"},
		[]string{"content-type", "application/x-www-form-urlencoded; charset=UTF-8"},
		[]string{"origin", baseURL},
		[]string{"sec-fetch-site", "same-origin"},
		[]string{"sec-fetch-mode", "cors"},
		[]string{"sec-fetch-dest", "empty"},
		[]string{"user-agent", useragent},
		[]string{"x-requested-with", "XMLHttpRequest"},
	}
}

func (t *task) webhookMessage(i webhookData) discord.Message {
	logo := discord.Image{
		URL:    i.thumbnailURL,
		Height: 400,
		Width:  400,
	}

	fields := []discord.Field{
		discord.Field{
			Name:   "Product",
			Value:  i.ProductName,
			Inline: false,
		},
		discord.Field{
			Name:   "Site",
			Value:  "wearestrap",
			Inline: true,
		},
		discord.Field{
			Name:   "Size",
			Value:  size,
			Inline: true,
		},
		discord.Field{
			Name:   "Checkout Link",
			Value:  "[Click Here](" + i.CheckoutURL + ")",
			Inline: true,
		},
	}

	embedData := discord.Embed{
		Title:     "Successful Checkout",
		Type:      "rich",
		Color:     3642623,
		Thumbnail: logo,
		Fields:    fields,
		//Footer:    getFooter(),
	}
	return discord.Message{
		Embeds: []discord.Embed{embedData},
	}
}
