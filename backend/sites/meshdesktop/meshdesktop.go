package meshdesktop

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"prosperaio/config"
	"prosperaio/utils/client"
	"prosperaio/utils/log"

	"github.com/fatih/color"
)

//Run mesh desktop task
func Run(i config.TaskInput) {
	t, err := initTask(i)
	if err != nil {
		color.Red(err.Error())
		return
	}
	t.log.Debug("Starting Task")

	t.stockRoutine()
	t.atcRoutine()
	//cli.IncrementCount("cartCount")
	// err := t.checkoutRoutine()
	// if err != nil {
	// 	t.log.Error(err.Error())
	// 	return
	// }
	// //cli.IncrementCount("checkoutCount")

	// err = discord.PostWebhook(i.WebhookURL, t.webhookMessage())
	// if err != nil {
	// 	fmt.Println(t.ppURL)
	// 	panic(err)
	// }
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
		profile:      i.Profile,
		region:       i.Region,
		size:         i.Size,
		id:           i.ID,
		monitorDelay: i.MonitorDelay,
		retryDelay:   i.RetryDelay,
	}
	c := client.Create(i.Proxy, 1)
	t.client = &c

	pURL, err := url.Parse(i.MonitorInput)
	if err != nil {
		return
	}

	splitPath := strings.Split(pURL.Path, "/")
	if len(splitPath) < 4 {
		return
	}

	t.productURL = pURL
	t.baseURL = "https://" + pURL.Hostname()
	t.pData.pid = splitPath[3]

	t.updatePrefix()
	return
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
