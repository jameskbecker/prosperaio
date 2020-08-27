package supreme

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

//Stock monitor from either mobile_stock.json, shop.json or mobile/products.json
func (t *InputOptions) Stock(endpoint string) error {
	url := t.BaseURL.Scheme + "://" + t.BaseURL.Host + "/" + endpoint

	request, err := http.NewRequest("GET", url, nil)
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

	if response.StatusCode < 200 || response.StatusCode > 299 {
		return errors.New("ESTATUS")
	}

	defer response.Body.Close()

	var body stockResponse
	var matchedProduct stockItem

	json.NewDecoder(response.Body).Decode(&body)

	categories := body.Categories
	if len(categories) == 0 {
		return errors.New("ECLOSED")
	}

	matchedCategory, foundCategory := categories[t.Category]
	if !foundCategory {
		return errors.New("ENOCAT")
	}

	for i, v := range matchedCategory {
		if matchedCategory[i].matchesKWs(&t.Keywords) {
			matchedProduct = v
			break
		}
	}

	if matchedProduct.ID == 0 {
		return errors.New("ENOPDCT")
	}

	t.ProductName = matchedProduct.Name
	t.ProductID = matchedProduct.ID

	return nil
}

//Product monitor
func (t *InputOptions) Product() error {
	path := "/shop/" + strconv.Itoa(t.ProductID)
	t.ProductURL = t.BaseURL.Scheme + "://" + t.BaseURL.Host + path

	request, err := http.NewRequest("GET", t.ProductURL+".json", nil)
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
	var matchedStyle productStyle
	var matchedSize productSize

	json.NewDecoder(response.Body).Decode(&body)

	for _, v := range body.Styles {
		if v.matchesKWs(&t.StyleKeywords) {
			matchedStyle = v
			break
		}
	}

	for _, v := range matchedStyle.Sizes {
		if strings.ToLower(v.Name) == strings.ToLower(t.SizeKeywords) {
			matchedSize = v
			break
		}
	}

	t.StyleName = matchedStyle.Name
	t.StyleID = matchedStyle.ID
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
