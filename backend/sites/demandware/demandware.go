package demandware

import (
	"errors"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"prosperaio/config"
	"prosperaio/utils"
	"prosperaio/utils/client"
	"prosperaio/utils/log"

	"github.com/fatih/color"
)

const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36"

//Run DemandWare task
func Run(i config.TaskInput, ipc chan utils.IPCMessage) {
	t, err := initTask(i)
	if err != nil {
		color.Red(err.Error())
		i.WG.Done()
		return
	}
	t.log.Debug("Starting Task...")

	t.getPXCookie()
	t.getCSRFToken()
	t.submitRegistration()

	//ProductURL Mode
	if t.bPID == "" {
		t.getProductShowURL()
		t.getProductData()
	}

	t.addToCart()
	t.postShipping()
	t.submitPayment()
	t.placeOrder()

	i.WG.Done()

}

type task struct {
	id           int
	log          log.Logger
	monitorDelay time.Duration
	retryDelay   time.Duration

	productURL *url.URL
	baseURL    *url.URL
	region     string
	profile    config.Profile
	pDataURL   string
	siteID     string
	site       string
	size       string
	pid        string
	shipmentID string
	bPID       string
	pName      string
	pBrand     string
	// optionID   string
	// valueID    string
	px3       string
	csrfToken string
	userAgent string
	client    http.Client
}

func initTask(i config.TaskInput) (t task, err error) {
	t = task{
		id:           i.ID,
		region:       i.Region,
		size:         i.Size,
		site:         i.Site,
		profile:      i.Profile,
		client:       client.Create(i.Proxy, 1),
		userAgent:    userAgent,
		monitorDelay: time.Duration(i.Settings.MonitorDelay) * time.Millisecond,
		retryDelay:   time.Duration(i.Settings.RetryDelay) * time.Millisecond,
	}

	t.baseURL = t.getBaseURL(i.Site)

	if !strings.Contains(i.MonitorInput, "www") {
		t.bPID = strings.Replace(i.MonitorInput, `"`, "", 1)
	} else {
		f, err := url.Parse(i.MonitorInput)
		if err != nil {
			panic("Invalid URL")
		}
		t.productURL = f

		pidExp := regexp.MustCompile(`-(?P<pid>\d*?)\.html`)
		match := pidExp.FindStringSubmatch(f.String())
		if match == nil || len(match) < 2 {
			panic("Unable to Parse PID")
		}
		t.pid = match[1]
	}

	siteID, err := getSiteID(strings.ToLower(i.Site + "-" + t.region))
	if err != nil {
		panic(err)
	}
	t.siteID = siteID
	t.updatePrefix()
	return
}

var (
	errUnknownSite  = errors.New("unknown site")
	errPUrlOption   = errors.New("unable to parse product url option")
	errSizeNotFound = errors.New("size not found")
	errATCNotAdded  = errors.New("item not added to cart")
	errCSFRNoVal    = errors.New("no CSFR Value")
	errForbidden    = errors.New("403 forbidden")
)

func (t *task) retry(err error, callback func()) {
	if err != nil {
		switch err {

		default:
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
		}
	}

	callback()
}
