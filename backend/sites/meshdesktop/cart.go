package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"prosperaio/utils/client"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

func (t *task) getStockData() error {
	ts := time.Now().UTC().UnixNano() / 1e6
	uri := t.productURL.String() + "/stock/?_=" + strconv.FormatInt(ts, 10)
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		return err
	}
	req.Header.Set("accept", "*/*")
	req.Header.Set("x-requested-with", "XMLHttpRequest")
	req.Header.Set("user-agent", t.useragent)
	req.Header.Set("content-type", "application/json")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("referer", "t.productURL.String()")
	req.Header.Set("accept-encoding", "identity") //TODO: SWITCH BACK TO GZIP ETC
	req.Header.Set("accept-language", "en-GB,en-US;q=0.9,en;q=0.8")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

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
	sku, exists := sel.Attr("data-sku")
	if exists {
		t.pData.sku = sku
		t.updatePrefix()
	}
	price, exists := sel.Attr("data-price")
	if exists {
		t.pData.price = price
	}
	if t.pData.sku == "" {
		return errors.New("Size not found or OOS")
	}

	t.log.Debug("SKU: " + t.pData.sku)
	t.log.Debug("Price: " + t.pData.price)
	return nil
}

func (t *task) findSize(i int, sel *goquery.Selection) bool {
	if strings.TrimSpace(sel.Text()) == t.size {
		return false
	}
	return true
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

func (t *task) addToCart() error {
	uri := t.baseURL + "/cart/" + t.pData.sku
	form, _ := buildATCForm()
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return err
	}
	setDefaultHeaders(req, t.useragent, t.baseURL)
	req.Header.Set("referer", t.productURL.String())
	req.Header.Set("accept-encoding", "identity")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	body := order{}
	bodyD, err := client.Decompress(res)
	if err != nil {
		return err
	}
	json.NewDecoder(bodyD).Decode(&body)

	if body.Count < 1 || len(body.Contents) < 1 {
		return errors.New("Added 0 items to Cart")
	}
	t.log.Info("Successfully Added " + strconv.Itoa(body.Count) + " Item(s) to Cart! (" + body.Ref + ")")
	t.shippingMethodID = body.Delivery.DeliveryMethodID
	t.pData.name = body.Contents[0].Name
	t.pData.imageURL = body.Contents[0].Image.URL
	return nil
}
