package meshdesktop

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

func (t *task) getProductData() error {
	req, err := http.NewRequest("GET", t.productURL.String(), nil)
	if err != nil {
		return err
	}
	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", "t.useragent")
	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("sec-fetch-site", "none")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("sec-fetch-dest", "document")
	req.Header.Set("accept-encoding", "identity")
	req.Header.Set("accept-language", "en-GB,en-US;q=0.9,en;q=0.8")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	pData, err := parsePriceData(res.Body)
	if err != nil {
		return err
	}

	if pData.Name == "" || len(pData.Variants) == 0 {

	}

	t.log.Info("Found Product Data for: " + pData.Name)
	t.log.Debug(pData.PLU)
	t.log.Debug(pData.Price)
	t.log.Debug(pData.Variants[0].SKU)
	return nil
}

//TODO: consider more reliable method rather than regex
func parsePriceData(body io.ReadCloser) (data priceData, err error) {
	bodyB, err := ioutil.ReadAll(body)
	if err != nil {
		return
	}
	bodyS := string(bodyB)
	dataExp := regexp.MustCompile("(?m)" + `(?:^var dataObject\s?=\s?)(?P<data>\{\n[\w\W]*?^})`)
	match := dataExp.FindStringSubmatch(bodyS)
	if match == nil || len(match) < 2 {
		err = errors.New("Unable to Parse Product Data")
		return
	}
	fmt.Println(match[1])
	err = json.Unmarshal([]byte(match[1]), &data)
	return
}

func (t *task) getStockData() error {
	t.log.Warn("Fetching Stock Data")
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

	doc, err := goquery.NewDocumentFromReader(res.Body)
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

	return nil
}

func (t *task) findSize(i int, sel *goquery.Selection) bool {
	if strings.TrimSpace(sel.Text()) == t.size {
		return false
	}
	return true
}

//Need to put the delivery method id
func (t *task) add() error {
	t.log.Warn("Adding to Cart")
	uri := t.baseURL + "/cart/" + t.pData.sku
	form, _ := buildATCForm()
	req, err := http.NewRequest("POST", uri, bytes.NewBuffer(form))
	if err != nil {
		return err
	}
	req.Header.Set("accept", "*/*")
	req.Header.Set("x-requested-with", "XMLHttpRequest")
	req.Header.Set("user-agent", t.useragent)
	req.Header.Set("content-type", "application/json")
	req.Header.Set("origin", t.baseURL)
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-mode", "cors")
	req.Header.Set("sec-fetch-dest", "empty")
	req.Header.Set("referer", t.productURL.String())
	req.Header.Set("accept-encoding", "identity")
	req.Header.Set("accept-language", "en-GB,en-US;q=0.9,en;q=0.8")

	res, err := t.client.Do(req)
	if err != nil {
		return err
	}

	body := order{}
	json.NewDecoder(res.Body).Decode(&body)

	if body.Count < 1 {
		return errors.New("Added 0 items to Cart")
	}
	t.log.Info("Successfully Added " + strconv.Itoa(body.Count) + " Item(s) to Cart! (" + body.Ref + ")")
	t.shippingMethodID = body.Delivery.DeliveryMethodID
	return nil
}

func (t *task) updateDelivery() {

}
