package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"prosperaio/utils/client"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

func (t *task) getStockData() (*http.Response, error) {
	ts := int(time.Now().UTC().UnixNano() / 1e6)
	path := "/stock/?_=" + strconv.Itoa(ts)
	uri := t.productURL.String() + path

	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		return nil, err
	}

	setDefaultHeaders(req, t.useragent, t.baseURL)
	req.Header.Set("referer", t.productURL.String())
	res, err := t.client.Do(req)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (t *task) parseStockData(res *http.Response) error {
	bodyD, err := client.Decompress(res)
	if err != nil {
		return err
	}
	doc, err := goquery.NewDocumentFromReader(bodyD)
	if err != nil {
		return err
	}

	selector := `button[data-e2e="pdp-productDetails-size"]`
	s := doc.Find(selector)

	sel := s.EachWithBreak(t.findSize)
	sku, _ := sel.Attr("data-sku")
	price, _ := sel.Attr("data-price")

	if sku == "" {
		return errors.New("Size not found or OOS")
	}
	t.pData.sku = sku
	t.pData.price = price

	return nil
}

func (t *task) findSize(i int, sel *goquery.Selection) bool {
	if strings.TrimSpace(sel.Text()) == t.size {
		return false
	}
	return true
}

func (t *task) stockRoutine() {
	for {
		t.log.Warn("Fetching Stock Data")
		stockRes, err := t.getStockData()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.monitorDelay)
			continue
		}

		err = t.parseStockData(stockRes)
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.monitorDelay)
			continue
		}
		break
	}

	t.updatePrefix()
}

type order struct {
	ID              string       `json:"ID"`
	Href            string       `json:"href"`
	Count           int          `json:"count"`
	HasGuest        bool         `json:"canCheckoutAsGuest"`
	Ref             string       `json:"reference"`
	Customer        *interface{} `json:"customer"`
	BillingAddress  *interface{} `json:"billingAddress"`
	DeliveryAddress *interface{} `json:"deliveryAddress"`
	Delivery        delivery     `json:"delivery"`
	Contents        []contents   `json:"contents"`
}

type contents struct {
	Name  string `json:"name"`
	Image image  `json:"image"`
}

type image struct {
	URL string `json:"originalURL"`
}

type delivery struct {
	DeliveryMethodID string `json:"deliveryMethodID"`
}

func (t *task) postATC() (*http.Response, error) {
	uri := t.baseURL + "/cart/" + t.pData.sku
	form, _ := buildATCForm()
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return nil, err
	}
	setDefaultHeaders(req, t.useragent, t.baseURL)
	req.Header.Set("referer", t.productURL.String())
	req.Header.Set("accept-encoding", "identity")

	res, err := t.client.Do(req)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func (t *task) parseATCRes(res *http.Response) error {
	body := order{}
	bodyD, err := client.Decompress(res)
	if err != nil {
		return err
	}
	json.NewDecoder(bodyD).Decode(&body)

	if body.Count < 1 || len(body.Contents) < 1 {
		bodyB, _ := ioutil.ReadAll(bodyD)
		fmt.Println(string(bodyB))
		return errors.New("Added 0 items to Cart")
	}

	t.shippingMethodID = body.Delivery.DeliveryMethodID
	t.pData.name = body.Contents[0].Name
	t.pData.imageURL = body.Contents[0].Image.URL

	t.log.Info("Successfully Added " + strconv.Itoa(body.Count) + " Item(s) to Cart! (" + body.Ref + ")")
	return nil
}

func (t *task) atcRoutine() {
	for {
		t.log.Warn("Adding to Cart")
		res, err := t.postATC()
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}

		err = t.parseATCRes(res)
		if err != nil {
			t.log.Error(err.Error())
			time.Sleep(t.retryDelay)
			continue
		}
		break
	}
}
