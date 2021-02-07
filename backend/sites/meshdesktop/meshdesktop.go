package meshdesktop

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"prosperaio/config"
	"prosperaio/discord"
	"prosperaio/utils/cli"
	"prosperaio/utils/client"
	"prosperaio/utils/log"

	"github.com/fatih/color"
)

//Run mesh desktop task
func Run(i config.TaskInput) {
	t, err := initTask(i)
	if err != nil {
		color.Red(err.Error())
		i.WG.Done()
		return
	}
	t.log.Debug("Starting Task")

	//Cart Process
	t.getStock()
	t.addToCart()
	cli.IncrementCount("cartCount")

	//Checkout Process
	t.registerEmail()
	t.addAddress()
	t.addShipping()
	t.updateBilling()
	t.submitOrder()
	cli.IncrementCount("checkoutCount")

	cookies := client.GetJSONCookies(t.baseURL, t.client)
	t.webhookURL = buildCheckoutURL(cookies, t.ppURL)
	err = discord.PostWebhook(i.Settings.WebhookURL, t.webhookMessage())
	if err != nil {
		fmt.Println(t.ppURL)
		t.log.Error(err.Error())
		i.WG.Done()
		return
	}
	t.log.Info("Sent Discord Webhook!")
	i.WG.Done()
}

type task struct {
	client           *http.Client
	productURL       *url.URL
	baseURL          *url.URL
	log              log.Logger
	profile          config.Profile
	pData            productData
	monitorDelay     time.Duration
	retryDelay       time.Duration
	id               int
	region           string
	size             string
	useragent        string
	addressID        string
	shippingMethodID string
	adyenURL         string
	ppURL            string
	webhookURL       string
	exportCookies    []byte
}

type productData struct {
	name     string
	pid      string
	sku      string
	imageURL string
	price    string
}

func initTask(i config.TaskInput) (t task, err error) {
	t = task{
		baseURL:      getBaseURL("fp", ""),
		profile:      i.Profile,
		region:       i.Region,
		size:         i.Size,
		id:           i.ID,
		monitorDelay: time.Duration(i.Settings.MonitorDelay) * time.Millisecond,
		retryDelay:   time.Duration(i.Settings.RetryDelay) * time.Millisecond,
	}
	c := client.Create(i.Proxy, 1)
	t.client = &c
	t.log.Debug("Monitor Input: " + i.MonitorInput)
	if !strings.Contains(i.MonitorInput, "/") {
		t.pData.pid = i.MonitorInput

	} else {
		pURL := &url.URL{}
		pURL, err = url.Parse(i.MonitorInput)
		if err != nil {
			return
		}
		splitPath := strings.Split(pURL.Path, "/")

		if len(splitPath) < 4 {
			return
		}
		t.pData.pid = splitPath[3]
	}

	t.updatePrefix()
	return
}
