package meshdesktop

import (
	"net/http"
	"net/url"
	"strings"
	"time"

	"prosperaio/config"
	"prosperaio/utils"
	"prosperaio/utils/client"
	"prosperaio/utils/log"

	"github.com/fatih/color"
)

//Run mesh desktop task
func Run(i config.TaskInput, ipc chan utils.IPCMessage) {
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
	ipc <- utils.IPCMessage{Channel: "incrementCart"}

	//Checkout Process
	t.registerEmail()
	t.addAddress()
	t.addShipping()
	t.updateBilling()
	t.submitOrder()
	ipc <- utils.IPCMessage{Channel: "incrementCheckout"}

	err = t.sendSuccess()
	if err != nil {
		t.log.Debug(t.ppURL)
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
	settings         config.Settings
	pData            productData
	monitorDelay     time.Duration
	retryDelay       time.Duration
	id               int
	site             string
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
		baseURL:      getBaseURL(i.Site, i.Region),
		profile:      i.Profile,
		settings:     i.Settings,
		site:         i.Site,
		region:       i.Region,
		size:         i.Size,
		id:           i.ID,
		monitorDelay: time.Duration(i.Settings.MonitorDelay) * time.Millisecond,
		retryDelay:   time.Duration(i.Settings.RetryDelay) * time.Millisecond,
	}
	c := client.Create("100.76.72.18:8888", 1)
	t.client = &c
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
