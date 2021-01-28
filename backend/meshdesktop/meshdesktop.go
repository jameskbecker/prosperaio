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
	c, _ := client.Create(i.Proxy)
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
	err = t.getStockData()
	if err != nil {
		t.log.Error(err.Error())
	}
	t.log.Debug("SKU: " + t.pData.sku)
	t.log.Debug("Price: " + t.pData.price)
	err = t.add()
	if err != nil {
		t.log.Error(err.Error())
	}

	t.log.Warn("Checking Out")
	err = t.initGuest()
	if err != nil {
		t.log.Error(err.Error())
	}

	wg.Done()
}
func (t *task) updatePrefix() {
	tID := fmt.Sprintf("%04d", t.id)
	prefix := "[" + tID + "] [jd-gb_frontend] [" + t.size + "] "
	t.log = log.Logger{Prefix: prefix}
}

func (t *task) webhookMessage() discord.Message {
	size := "N/A"
	if t.size != "" {
		size = t.size
	}
	fields := []discord.Field{
		{Name: "Product", Value: t.pData.name, Inline: false},
		{Name: "PID", Value: strconv.Itoa(t.pData.pid), Inline: false},
		{Name: "Site", Value: "wearestrap", Inline: true},
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
		{"accept-encoding", "gzip, deflate, br"},
		{"accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7"},
	}
}
