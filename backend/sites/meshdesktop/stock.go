package meshdesktop

import (
	"errors"
	"io"
	"net/http"
	"prosperaio/utils/client"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

func (t *task) getStockData() (decompRes io.ReadCloser, err error) {
	ts := int(time.Now().UTC().UnixNano() / 1e6)
	path := "/product/0/" + t.pData.pid + "/stock/"
	qs := "_=" + strconv.Itoa(ts)

	//Create Request
	uri := t.baseURL + path + "?" + qs
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		return
	}

	//Set Headers
	setDefaultHeaders(req, t.useragent, t.baseURL)
	req.Header.Set("referer", t.productURL.String())

	//Send Request
	res, err := t.client.Do(req)
	if err != nil {
		return
	}

	if res.StatusCode > 299 {
		err = errors.New("Unexpected Status: " + res.Status)
		return
	}

	decompRes, err = client.Decompress(res)
	return
}

func (t *task) parseStockData(body io.ReadCloser) (err error) {
	doc, err := goquery.NewDocumentFromReader(body)
	if err != nil {
		return
	}

	selector := "button[data-sku]"
	s := doc.Find(selector)

	//Filter data from selected size
	sel := s.FilterFunction(t.findSize)
	if sel == nil {
		err = errors.New("Size not found")
		return
	}

	//Assign data to task
	t.pData.sku, _ = sel.Attr("data-sku")
	t.pData.price, _ = sel.Attr("data-price")

	if t.pData.sku == "" {
		err = errors.New("Size not found or OOS")
		return
	}

	t.log.Debug("SKU: " + t.pData.sku)
	t.log.Debug("Price: " + t.pData.price)

	//If stock status available, check if in stock
	stock, _ := sel.Attr("data-stock")
	if stock == "0" {
		err = errors.New("Out of Stock")
		return
	}

	return
}

func (t *task) findSize(i int, sel *goquery.Selection) bool {
	innerText := sel.Children().Remove().End().Text()
	trimmedSize := strings.TrimSpace(innerText)
	if trimmedSize == t.size {
		return true
	}
	return false
}

func (t *task) stockRoutine() {
	for {
		t.log.Warn("Fetching SKU")
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
