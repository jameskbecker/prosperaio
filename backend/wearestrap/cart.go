package wearestrap

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

func getProductData(productURL string, c *http.Client) (strings.Reader, error) {
	body := strings.Reader{}
	req, err := http.NewRequest("GET", productURL, nil)
	if err != nil {
		return body, err
	}

	req.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	req.Header.Set("accept-encoding", "gzip, deflate, br")
	req.Header.Set("accept-language", "en-GB,en;q=0.9")
	//req.Header.Set("referer", "https://wearestrap.com/es/s-1/marca_2-nike/categorias_2-zapatillas")
	req.Header.Set("sec-fetch-dest", "document")
	req.Header.Set("sec-fetch-mode", "navigate")
	req.Header.Set("sec-fetch-site", "same-origin")
	req.Header.Set("sec-fetch-user", "?1")
	req.Header.Set("upgrade-insecure-requests", "1")
	req.Header.Set("user-agent", useragent)

	res, err := c.Do(req)
	if err != nil {
		return body, err
	}

	bodyB, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return body, err
	}

	body = *strings.NewReader(string(bodyB))

	return body, nil
}

func parseProductData(data strings.Reader) (productData, error) {
	pData := productData{}
	doc, err := goquery.NewDocumentFromReader(&data)
	if err != nil {
		return pData, err
	}

	tokenSelector := `input[name="token"]`
	tokenMatch := doc.Find(tokenSelector)
	token, exists := tokenMatch.Attr("value")
	if !exists {
		return pData, errors.New("Token Not Found")
	}
	pData.Token = token

	PIDSelector := `input[name="id_product"],[id="product_page_product_id"]`
	PIDMatch := doc.Find(PIDSelector)
	PID, exists := PIDMatch.Attr("value")
	if !exists {
		return pData, errors.New("PID Not Found")
	}
	pData.PID = PID

	custIDSelector := `input[name="id_customization"],[id="product_customization_id"]`
	custIDMatch := doc.Find(custIDSelector)
	custID, exists := custIDMatch.Attr("value")
	if !exists {
		return pData, errors.New("Product Customization ID Not Found")
	}
	pData.CustID = custID

	sizeCode := "EU_" + strings.ReplaceAll(size, ".", "-")
	group1Selector := `[data-referencia="` + sizeCode + `"]`
	group1Match := doc.Find(group1Selector)
	group1, exists := group1Match.Attr("data-valor")
	if !exists {
		return pData, errors.New("Group[1] value Not Found")
	}
	pData.PVal = group1

	return pData, nil
}

func add(form url.Values, c *http.Client) (int, error) {
	formEncoded := form.Encode()
	formReader := strings.NewReader(formEncoded)
	req, err := http.NewRequest("POST", baseURL+"/es/carrito", formReader)
	if err != nil {
		return 0, err
	}

	for _, v := range defaultHeaders() {
		req.Header.Set(v[0], v[1])
	}
	req.Header.Set("referer", pURL)

	res, err := c.Do(req)
	if err != nil {
		return 0, err
	}
	// bBody, err := ioutil.ReadAll(res.Body)
	// if err != nil {
	// 	return err
	// }

	body := atcResponse{}
	json.NewDecoder(res.Body).Decode(&body)

	if !body.Success || body.Errors != "" {
		return 0, errors.New("Error Adding to Cart")
	}

	return body.Qty, nil
}