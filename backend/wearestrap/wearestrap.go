package wearestrap

import (
	"fmt"
	"net/url"
	"strings"
	"sync"
	"time"

	"../client"
	"../discord"
	"../log"
)

const useragent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"

//atc url https://wearestrap.com/es/carrito?add=1&id_product=4074&id_product_attribute=14580

//Run --
func Run(i Input, taskID int, wg *sync.WaitGroup) {
	// //startTS := time.Now()
	c, _ := client.Create(i.Proxy)

	t := task{
		size:    i.Size,
		email:   i.Email,
		billing: i.Billing,
		id:      taskID,
		client:  &c,
		pData:   productData{PID: "0000"},
	}
	t.updatePrefix()
	pURL, err := url.Parse(i.ProductURL)
	if err != nil {
		t.log.Error("Invalid Product URL")
		return
	}

	t.productURL = pURL
	t.baseURL = "https://" + t.productURL.Hostname()
	t.log.Debug("Starting Task")

	t.cartProcess()
	//t.checkoutProcess()

	//discord.PostWebhook()
	//wg.Done()
}

func (t *task) cartProcess() {
	pDataP := productData{}
	for {
		t.log.Warn("Getting product data")
		body, err := t.getProductData()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(1000 * time.Millisecond)
			continue
		}

		pData, err := t.parseProductData(body)
		if err != nil {
			t.log.Error("Product Data Not Found")
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		pDataP = pData
		break
	}
	t.pData = pDataP
	t.updatePrefix()
	// t.log.Warn("Adding to cart")
	// addForm := atcForm(pDataP)
	// qtyP := 0
	// for {
	// 	qty, err := t.add(addForm)
	// 	if err != nil {
	// 		t.log.Error(err.Error())
	// 		time.Sleep(1000 * time.Millisecond)
	// 		continue
	// 	}
	// 	qtyP = qty
	// 	break
	// }
	// qtyS := strconv.Itoa(qtyP)
	// t.log.Info("Successfully added " + qtyS + " item(s) to cart!")
}

func (t *task) checkoutProcess() {
	t.log.Warn("Checking out")
	t.log.Debug("Submitting Account and Address")
	err := t.modifyAccountAndAddress(t.client)
	if err != nil {
		t.log.Error(err.Error())
		return
	}
	t.log.Debug("Accepting GDPR")
	err = t.acceptGDPR(t.client)
	if err != nil {
		t.log.Error(err.Error())
		return
	}

	t.log.Debug("Accepting T&S")
	err = t.acceptTerms(t.client)
	if err != nil {
		t.log.Error(err.Error())
		return
	}

	checkoutURL, err := t.getPPURL(t.client)
	if err != nil {
		t.log.Error(err.Error())
		return
	}

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
	logo := discord.Image{URL: i.thumbnailURL}
	fields := []discord.Field{
		discord.Field{Name: "Product", Value: t.pData.Name, Inline: false},
		discord.Field{Name: "Site", Value: "wearestrap", Inline: true},
		discord.Field{Name: "Size", Value: t.size, Inline: true},
		discord.Field{Name: "Checkout Link", Value: "[Click Here](" + i.CheckoutURL + ")", Inline: true},
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
