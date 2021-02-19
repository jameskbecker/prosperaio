package meshdesktop

import (
	"errors"
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

	t.updatePrefix()
	t.log.Debug("Starting Task")

	//Cart Process
	t.getStock()
	t.getCaptchaData()
	t.addToCart()
	ipc <- utils.IPCMessage{Channel: "incrementCart"}

	//Checkout Process
	t.registerEmail()
	t.addAddress()
	t.addShipping()
	t.updateBilling()

	if t.checkoutDelay > 0 {
		t.log.Warn("Delaying Checkout")
		time.Sleep(time.Duration(t.checkoutDelay) * time.Millisecond)
	}
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
	id            int
	site          string
	region        string
	profile       config.Profile
	size          string
	paymentMethod string
	forceCaptcha  bool
	checkoutDelay int

	productURL       *url.URL
	pData            productData
	addressID        string
	shippingMethodID string
	recaptcha        recaptcha

	baseURL      *url.URL
	client       *http.Client
	useragent    string
	log          log.Logger
	monitorDelay time.Duration
	retryDelay   time.Duration
	settings     config.Settings

	extensionURL  string
	exportCookies []byte
	ppURL         string
}

type recaptcha struct {
	sitekey  string
	response string
	skip     bool
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
		baseURL:       getBaseURL(i.Site, i.Region),
		profile:       i.Profile,
		settings:      i.Settings,
		site:          i.Site,
		region:        i.Region,
		size:          i.Size,
		id:            i.ID,
		forceCaptcha:  i.ForceCaptcha,
		checkoutDelay: i.Delay,
		monitorDelay:  time.Duration(i.Settings.MonitorDelay) * time.Millisecond,
		retryDelay:    time.Duration(i.Settings.RetryDelay) * time.Millisecond,
	}
	c := client.Create(i.Proxy, 1)
	t.client = &c
	if !strings.Contains(i.MonitorInput, "/") {
		t.pData.pid = i.MonitorInput
		return

	}

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
	return
}

var (
	errSizeNotFound      = errors.New("Size not found")
	errOOS               = errors.New("Out of Stock")
	errSizeNotFoundOrOOS = errors.New("Size not found or OOS")
	errATCNotAdded       = errors.New("Added 0 items to Cart")
	errNoSiteKey         = errors.New("No Recaptcha Sitekey Found. Skipping")
	errCaptchaRequired   = errors.New("ATC Failed: ReCAPTCHA Required")
	errInvalidEmail      = errors.New("Invalid email address")
	errNoAddrID          = errors.New("[C1] Received no address ID")
	errNoRedirect        = errors.New("No Redirect URL")
)

func (t *task) retry(err error, callback func()) {
	if err != nil {
		switch err {
		case errCaptchaRequired:
			t.log.Error(err.Error())
			t.getCaptcha()
			break
		default:
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
		}
	}

	callback()
}

func (t *task) monitor(err error, callback func()) {
	if err != nil {
		t.log.Error(err.Error())
	}
	time.Sleep(t.monitorDelay)
	callback()
}

func checkStatus(status int) (err error) {
	switch {
	case status >= 300 && status <= 399:
		break
	case status >= 400 && status <= 499:
		break
	case status >= 500 && status <= 599:
		break
	}
	return
}
