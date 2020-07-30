package supreme

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"
)

//GetStockData fetches data from either mobile_stock.json, shop.json or mobile/products.json
func (t *Task) GetStockData(endpoint string) error {

	request, _ := http.NewRequest("GET", t.BaseURL+`/`+endpoint, nil)

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Accept-Lanaguage", "en-us")
	request.Header.Add("Upgrade-Insecure-Requests", "1")
	request.Header.Add("User-Agent", t.UserAgent)
	request.Header.Add("X-Requested-With", "XMLHttpRequest")

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	if response.StatusCode >= 300 && response.StatusCode <= 599 {
		return errors.New("Error Fetching Stock Data --> " + response.Status)
	}

	defer response.Body.Close()

	var body stockResponse
	json.NewDecoder(response.Body).Decode(&body)
	log.Println(body)
	foundProduct := false
	categories := body.Categories
	matchedCategory, foundCategory := categories[t.InputCat]

	if !foundCategory {
		return errors.New("Error: Category " + t.InputCat + " Not Found")
	}

	var matchedProduct stockItem

	for i, v := range matchedCategory {
		if matchedCategory[i].matchesKWs(&t.InputKW) {
			matchedProduct = v
			foundProduct = true
			break
		}
	}

	if !foundProduct {
		return errors.New("Error: Product Not Found")
	}

	t.ProductName = matchedProduct.Name
	t.ProductID = matchedProduct.ID

	return nil
}

//GetProductData fetches data of a given product id
func (t *Task) GetProductData() error {
	request, err := http.NewRequest("GET", t.BaseURL+`/shop/`+strconv.Itoa(t.ProductID)+`.json`, nil)
	if err != nil {
		return err
	}

	request.Header.Add("Accept", "application/json")
	request.Header.Add("Accept-Lanaguage", "en-us")
	request.Header.Add("Upgrade-Insecure-Requests", "1")
	request.Header.Add("User-Agent", t.UserAgent)
	request.Header.Add("X-Requested-With", "XMLHttpRequest")

	response, err := t.Client.Do(request)
	if err != nil {
		return err
	}

	defer response.Body.Close()

	var body productResponse
	json.NewDecoder(response.Body).Decode(&body)

	var matchedStyle productStyle

	for _, v := range body.Styles {
		matchedStyle = v
		if v.matchesKWs(&t.InputStyle) {
			break
		}
	}

	t.StyleName = matchedStyle.Name
	t.StyleID = matchedStyle.ID

	var matchedSize productSize
	for _, v := range matchedStyle.Sizes {
		matchedSize = v
		if strings.ToLower(v.Name) == strings.ToLower(t.InputSize) {
			break
		}
	}

	t.SizeName = matchedSize.Name
	t.SizeID = matchedSize.ID

	return nil
}

func (data nameID) matchesKWs(keywords *string) bool {
	splitKeywords := strings.Split(*keywords, ",")

	name := strings.ToLower((data).Name)
	for _, v := range splitKeywords {
		input := strings.ToLower(string(v[1:]))
		if string(v[0]) == "+" && !strings.Contains(name, input) {
			return false
		} else if string(v[0]) == "-" && strings.Contains(name, input) {
			return false
		}
	}

	return true
}

type stockResponse struct {
	Categories map[string][]stockItem `json:"products_and_categories"`
}

type nameID struct {
	Name string `json:"name"`
	ID   int    `json:"id"`
}

type stockItem struct {
	nameID
}

type productStyle struct {
	nameID
	ImageURL string        `json:"image_url"`
	Sizes    []productSize `json:"sizes"`
}

type productSize struct {
	nameID
	StockLevel int `json:"stock_level"`
}

type productResponse struct {
	Styles []productStyle `json:"styles"`
}
