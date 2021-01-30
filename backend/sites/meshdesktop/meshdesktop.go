package meshdesktop

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

//Run mesh desktop task
func Run(i config.TaskInput) {
	t := *initTask(i)
	t.log.Debug("Starting Task")

	t.stockRoutine()
	t.log.Debug("SKU: " + t.pData.sku)
	t.log.Debug("Price: " + t.pData.price)

	t.atcRoutine()
	t.checkoutRoutine()

	err := discord.PostWebhook(i.WebhookURL, t.webhookMessage())
	if err != nil {
		fmt.Println(t.checkoutURL)
		panic(err)
	}
	i.WG.Done()
}

type task struct {
	client           *http.Client
	productURL       *url.URL
	log              log.Logger
	profile          config.Profile
	pData            productData
	monitorDelay     time.Duration
	retryDelay       time.Duration
	id               int
	region           string
	size             string
	baseURL          string
	useragent        string
	checkoutURL      string
	addressID        string
	shippingMethodID string
	exportCookies    []byte
}

type productData struct {
	name     string
	pid      int
	sku      string
	imageURL string
	price    string
}

func initTask(i config.TaskInput) *task {
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
		region:     i.Region,
		baseURL:    "https://" + pURL.Hostname(),
		size:       i.Size,
		id:         i.ID,
		pData: productData{
			pid: pid,
		},
		client: &c,
	}

	t.updatePrefix()
	return &t
}

func (t *task) updatePrefix() {
	tID := fmt.Sprintf("%04d", t.id)
	region := strings.ToLower(t.region)
	prefix := "[" + tID + "] [jd-" + region + "_fe] [" + t.size + "] "
	t.log = log.Logger{Prefix: prefix}
}

func setDefaultHeaders(req *http.Request, ua string, bURL string) {
	headers := [][]string{
		{"accept", "*/*"},
		{"x-requested-with", "XMLHttpRequest"},
		{"user-agent", ua},
		{"content-type", "application/json"},
		{"origin", bURL},
		{"sec-fetch-site", "same-origin"},
		{"sec-fetch-mode", "cors"},
		{"sec-fetch-dest", "empty"},
		{"accept-encoding", "gzip"},
		{"accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7"},
	}

	for _, v := range headers {
		req.Header.Set(v[0], v[1])
	}
}
