package meshdesktop

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"sync"

	"prosperaio/client"
	"prosperaio/discord"
	"prosperaio/log"
)

//Run mesh desktop task ---> TODO: HANDLE ERRORS
func Run(i Input, taskID int, wg *sync.WaitGroup) {
	//Initalise
	c, _ := client.Create("")
	pURL, err := url.Parse(i.MonitorInput)
	if err != nil {

	}
	splitPath := strings.Split(pURL.Path, "/")
	pid, err := strconv.Atoi(splitPath[3])
	if err != nil {

	}
	t := task{
		productURL: pURL,
		profile:    i.Profile,
		region:     i.Region,
		baseURL:    "https://" + pURL.Hostname(),
		size:       i.Size,
		id:         taskID,
		pData: productData{
			pid: pid,
		},
		client: &c,
	}
	//t.sku = strconv.Itoa(t.plu)
	t.updatePrefix()
	t.log.Debug("Starting Task")

	//ATC PROCESS
	err = t.getStockData()
	if err != nil {
		t.log.Error(err.Error())
	}

	err = t.add()
	if err != nil {
		t.log.Error(err.Error())
	}

	// //CHECKOUT PROCESS
	// err = t.initGuest()
	// if err != nil {
	// 	t.log.Error(err.Error())
	// }

	// err = t.addAddress()
	// if err != nil {
	// 	t.log.Error(err.Error())
	// }
	// err = t.updateDeliveryAddressAndMethod()
	// if err != nil {
	// 	t.log.Error(err.Error())
	// }
	// err = t.updateBillingAddress()
	// if err != nil {
	// 	t.log.Error(err.Error())
	// }
	// checkoutURL, err := t.submitCheckout()
	// if err != nil {
	// 	t.log.Error(err.Error())
	// }

	cookieURL, _ := url.Parse(t.baseURL)
	t.exportCookies, err = client.GetJSONCookies(cookieURL, t.client)
	if err != nil {
		t.log.Error(err.Error())
	}
	qs := url.Values{}
	qs.Set("cookie", string(t.exportCookies))

	t.checkoutURL = "http://localhost/extension.prosperaio.com?" + qs.Encode()
	qs.Set("redirectUrl", t.checkoutURL)
	// t.checkoutURL = "http://localhost/extension.prosperaio.com?" + qs.Encode()
	//fmt.Println(t.checkoutURL)

	err = discord.PostWebhook(i.WebhookURL, t.webhookMessage())
	if err != nil {
		fmt.Println(t.checkoutURL)
		panic(err)
	}
	wg.Done()
}
func (t *task) updatePrefix() {
	tID := fmt.Sprintf("%04d", t.id)
	region := strings.ToLower(t.region)
	prefix := "[" + tID + "] [jd-" + region + "_fe] [" + t.size + "] "
	t.log = log.Logger{Prefix: prefix}
}

func (t *task) webhookMessage() discord.Message {

	//fmt.Println(checkoutURL)
	productName := "N/A"
	pid := "N/A"
	size := "N/A"
	if t.size != "" {
		productName = t.pData.name
	}

	if t.size != "" {
		pid = strconv.Itoa(t.pData.pid)
	}

	if t.size != "" {
		size = t.size
	}

	fields := []discord.Field{
		{Name: "Product", Value: productName, Inline: false},
		{Name: "PID", Value: pid, Inline: true},
		{Name: "Site", Value: "jd-" + strings.ToLower(t.region) + "_fe", Inline: true},
		{Name: "Size", Value: size, Inline: true},
		{Name: "Price", Value: t.pData.price, Inline: true},
		{Name: "Checkout Link", Value: "[Click Here](" + t.checkoutURL + ")", Inline: true},
	}

	embedData := discord.Embed{
		Title:  "Successful Checkout",
		Type:   "rich",
		Color:  3642623,
		Fields: fields,
		Footer: discord.GetFooter(),
	}

	if t.pData.imageURL != "" {
		embedData.Thumbnail = discord.Image{URL: t.pData.imageURL}
	}

	return discord.Message{
		Embeds: []discord.Embed{embedData},
	}
}

func defaultHeaders(useragent string, baseURL string) [][]string {
	return [][]string{
		{"accept", "*/*"},
		{"x-requested-with", "XMLHttpRequest"},
		{"user-agent", useragent},
		{"content-type", "application/json"},
		{"origin", baseURL},
		{"sec-fetch-site", "same-origin"},
		{"sec-fetch-mode", "cors"},
		{"sec-fetch-dest", "empty"},
		{"accept-encoding", "gzip"},
		{"accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7"},
	}
}
