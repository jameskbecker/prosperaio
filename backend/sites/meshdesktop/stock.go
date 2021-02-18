package meshdesktop

import (
	"errors"
	"net/http"
	"prosperaio/utils"
	"prosperaio/utils/client"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func (t *task) getStock() {
	t.log.Warn("Fetching SKU")
	res, err := t._getStockReq()
	if err != nil {
		t.monitor(err, t.getStock)
		return
	}

	err = t._handleStockRes(res)
	if err != nil {
		t.monitor(err, t.getStock)
		return
	}
}

func (t *task) _getStockReq() (res *http.Response, err error) {
	path := "/product/0/" + t.pData.pid + "/stock/"
	ts := utils.GetTS()
	qs := "_=" + strconv.Itoa(ts)

	//Create Request
	uri := t.baseURL.String() + path + "?" + qs
	req, err := http.NewRequest("GET", uri, nil)
	if err != nil {
		return
	}

	//Set Headers
	setDefaultHeaders(req, t.useragent, t.baseURL.String())
	//req.Header.Set("referer", t.productURL.String())

	//Send Request
	res, err = t.client.Do(req)
	return
}

func (t *task) _handleStockRes(res *http.Response) error {
	defer res.Body.Close()
	if res.StatusCode > 299 {
		err := errors.New("Unexpected Status: " + res.Request.RequestURI + " " + res.Status)
		return err
	}
	client.Decompress(res)
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return err
	}

	selector := "button[data-sku]"
	s := doc.Find(selector)

	//Filter data from selected size
	sel := s.FilterFunction(t._findSize)
	if sel == nil {
		return errSizeNotFound
	}

	//Assign data to task
	t.pData.sku, _ = sel.Attr("data-sku")
	t.pData.price, _ = sel.Attr("data-price")

	if t.pData.sku == "" {
		return errSizeNotFoundOrOOS
	}

	t.log.Debug("SKU: " + t.pData.sku)
	t.log.Debug("Price: " + t.pData.price)

	//If stock status available, check if in stock
	stock, _ := sel.Attr("data-stock")
	if stock == "0" {
		return errOOS
	}

	return nil
}

func (t *task) _findSize(i int, sel *goquery.Selection) bool {
	innerText := sel.Children().Remove().End().Text()
	trimmedSize := strings.TrimSpace(innerText)
	if trimmedSize == t.size {
		return true
	}
	return false
}
