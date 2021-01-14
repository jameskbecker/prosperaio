package sneakavenue

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

//Run Logic
func Run(input TaskInput) {
	cookieJar, _ := cookiejar.New(nil)

	task := &sneakAvenue{
		ProductURL: input.ProductURL,
		SizeInput:  input.SizeInput,
		Billing:    input.Billing,
		Shipping:   input.Shipping,
		Client: http.Client{
			Jar: cookieJar,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
		BaseURL:   "https://www.sneak-a-venue.com",
		UserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36",
	}

	//Scrape Size Attribute Value
	for {
		sv, err := task.getSizeValue()
		if err != nil {
			fmt.Println(err)
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		task.AttrVal = sv
		break
	}

	//Initialise Product ie: Get Product IDs
	for {
		err := task.initialiseProduct()
		if err != nil {
			fmt.Println(err)
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		break
	}

	//Add Product to Cart
	for {
		err := task.addToCart()
		if err != nil {
			fmt.Println(err)
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		break
	}

	//Confirm Cart ie: Start Checkout
	for {
		err := task.confirmCart()
		if err != nil {
			fmt.Println(err)
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		break
	}

	//Submit Address
	for {
		err := task.submitAddress()
		if err != nil {
			fmt.Println(err)
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		break
	}

	//Submit Payment Method
	for {
		err := task.submitPaymentMethod()
		if err != nil {
			fmt.Println(err)
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		break
	}

	//Confirm Order
	for {
		paypalURL, err := task.confirmOrder()
		if err != nil {
			fmt.Println(err)
			time.Sleep(1000 * time.Millisecond)
			continue
		}
		fmt.Println(paypalURL)
		break
	}

}

func (sa *sneakAvenue) getSizeValue() (string, error) {
	request, err := http.NewRequest("POST", sa.ProductURL, nil)
	if err != nil {
		return "", err
	}

	request.Header.Set("upgrade-insecure-requests", "1")
	request.Header.Set("user-agent", sa.UserAgent)
	request.Header.Set("accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	request.Header.Set("sec-fetch-site", "none")
	request.Header.Set("sec-fetch-mode", "navigate ")
	request.Header.Set("sec-fetch-user", "?1")
	request.Header.Set("sec-fetch-dest", "document")
	request.Header.Set("accept-encoding", "") //gzip, deflate, br
	request.Header.Set("accept-language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")

	res, err := sa.Client.Do(request)
	if err != nil {
		return "", err
	}

	defer res.Body.Close()

	data, _ := findSize(sa.SizeInput, res)
	if err != nil {
		return "", err
	}

	return data, nil
}

func findSize(query string, res *http.Response) (string, error) {
	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		return "", err
	}

	matches := doc.Find(`option:contains("` + query + `")`)
	first := matches.First()

	val, exists := first.Attr("value")
	if !exists {
		return "", errors.New("Value Non-Existant")
	}

	return val, nil
}

func (sa *sneakAvenue) initialiseProduct() error {
	form := url.Values{}
	form.Set("chosen_attribute_value", sa.AttrVal)
	// ↓ Maybe this is not needed?
	form.Set("returnHtmlSnippets[partials][0][module]", "product")
	form.Set("returnHtmlSnippets[partials][0][path]", "_productDetail")
	form.Set("returnHtmlSnippets[partials][0][partialName]", "buybox")

	request, err := http.NewRequest("POST", sa.ProductURL, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}

	request.Header.Set("Accept", "*/*")
	request.Header.Set("Accept-Encoding", "") //gzip, deflate, br
	request.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
	request.Header.Set("Origin", sa.BaseURL)
	request.Header.Set("Referer", sa.ProductURL)
	request.Header.Set("Sec-Fetch-Site", "same-origin")
	request.Header.Set("Sec-Fetch-Mode", "cors")
	request.Header.Set("Sec-Fetch-Dest", "empty")
	request.Header.Set("User-Agent", sa.UserAgent)
	request.Header.Set("x-requested-with", "XMLHttpRequest")

	res, err := sa.Client.Do(request)
	if err != nil {
		return err
	}

	defer res.Body.Close()

	// buf, _ := ioutil.ReadAll(res.Body)
	// fmt.Println("PInit Response: \n" + string(buf))

	var body productInitResponse
	err = json.NewDecoder(res.Body).Decode(&body)
	if err != nil {
		return err
	}
	fmt.Println(body)
	sa.ProductID = strconv.Itoa(body.InitializedProduct.ID)
	sa.BSID = strconv.Itoa(body.InitializedProduct.BSID)

	return nil
}

func (sa *sneakAvenue) addToCart() error {
	uri := sa.BaseURL + "/cart/add"
	qs := url.Values{}
	qs.Set("product_bs_id", sa.BSID)
	qs.Set("product_id", sa.ProductID)
	qs.Set("amount", "1")
	//qs.Set("addToCart", "Add to cart")
	qs.Set("ajax", "true")
	qs.Set("forward[module]", "cart")
	qs.Set("forward[action]", "wasadded")
	qs.Set("addToCart", "")

	// ↓ Maybe this is not needed?
	qs.Set("returnHtmlSnippets[partials][0][module]", "cart")
	qs.Set("returnHtmlSnippets[partials][0][partialName]", "cartHeader")
	qs.Set("returnHtmlSnippets[partials][0][params][template]", "default")
	qs.Set("returnHtmlSnippets[partials][1][module]", "cart")
	qs.Set("returnHtmlSnippets[partials][1][partialName]", "cartHeader")
	qs.Set("returnHtmlSnippets[partials][1][returnName]", "stickyCartHeader")
	qs.Set("returnHtmlSnippets[partials][1][params][template]", "sticky")
	qs.Set("returnHtmlSnippets[partials][2][module]", "cart")
	qs.Set("returnHtmlSnippets[partials][2][partialName]", "modalWasadded")

	fmt.Println(uri + "?" + qs.Encode())
	request, err := http.NewRequest("POST", uri+"?"+qs.Encode(), nil)
	if err != nil {
		return err
	}

	request.Header.Set("Accept", "*/*")
	request.Header.Set("Accept-Encoding", "gzip, deflate, br")
	request.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Set("Content-Length", "0")
	request.Header.Set("Origin", "https://www.sneak-a-venue.com")
	request.Header.Set("Referer", sa.ProductURL)
	request.Header.Set("Sec-Fetch-Site", "same-origin")
	request.Header.Set("Sec-Fetch-Mode", "cors")
	request.Header.Set("Sec-Fetch-Dest", "empty")
	request.Header.Set("User-Agent", sa.UserAgent)
	request.Header.Set("x-requested-with", "XMLHttpRequest")

	res, err := sa.Client.Do(request)
	if err != nil {
		return err
	}

	buf, _ := ioutil.ReadAll(res.Body)
	fmt.Println("ATC Response: \n" + string(buf))

	var body payment
	err = json.NewDecoder(res.Body).Decode(&body)

	return nil
}

func (sa *sneakAvenue) confirmCart() error {
	uri := sa.BaseURL + "/cart"
	form := url.Values{}
	form.Set("quantity["+sa.ProductID+"]", "1")
	form.Set("redirectRooting", "@cart")
	form.Set("vouchercode", "")
	form.Set("interim_shipping_country_select", "6")
	form.Set("next_x", "Proceed to checkout")
	form.Set("next_x_value", "@cart_address")

	request, err := http.NewRequest("POST", uri, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}

	request.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	request.Header.Set("Accept-Encoding", "gzip, deflate, br")
	request.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Origin", "https://www.sneak-a-venue.com")
	request.Header.Set("Referer", sa.BaseURL+"/cart")
	request.Header.Set("Sec-Fetch-Site", "same-origin")
	request.Header.Set("Sec-Fetch-Mode", "navigate")
	request.Header.Set("Sec-Fetch-User", "?1")
	request.Header.Set("Sec-Fetch-Dest", "document")
	request.Header.Set("User-Agent", sa.UserAgent)
	request.Header.Set("upgrade-insecure-requests", "1")

	res, err := sa.Client.Do(request)
	if err != nil {
		return err
	}

	buf, _ := ioutil.ReadAll(res.Body)
	fmt.Println("Cart Confirmation Response: \n" + string(buf))

	var body payment
	err = json.NewDecoder(res.Body).Decode(&body)

	return nil
}

func (sa *sneakAvenue) submitAddress() error {
	uri := sa.BaseURL + "/cart/address"
	form := url.Values{}
	form.Set("billAddressId", "-1")
	form.Set("guestdata[email]", sa.Billing.Email)
	form.Set("guestdata[email_repeat]", sa.Billing.Email)
	form.Set("billaddress[salutation]", "1")
	form.Set("billaddress[forename]", sa.Billing.FirstName)
	form.Set("billaddress[lastname]", sa.Billing.LastName)
	form.Set("billaddress[street]", sa.Billing.Address1)
	form.Set("billaddress[street_number]", sa.Billing.Address2)
	form.Set("billaddress[addition]", "")
	form.Set("billaddress[zipcode]", sa.Billing.Zip)
	form.Set("billaddress[city]", sa.Billing.City)
	form.Set("billaddress[country]", "6") //UK
	form.Set("billaddress[phone]", sa.Billing.Phone)
	form.Set("guestdata[date_of_birth]", "")
	form.Set("shippingaddress[use_shipping_address]", "0")
	form.Set("shippingAddressId", "-1")
	form.Set("shippingaddress[salutation]", "1")
	form.Set("shippingaddress[forename]", "")
	form.Set("shippingaddress[lastname]", "")
	form.Set("shippingaddress[street]", sa.Shipping.Address1)
	form.Set("shippingaddress[street_number]", sa.Shipping.Address2)
	form.Set("shippingaddress[addition]", "")
	form.Set("shippingaddress[zipcode]", sa.Shipping.Zip)
	form.Set("shippingaddress[city]", sa.Shipping.City)
	form.Set("shippingaddress[country]", "6") //UK
	form.Set("registerguest[password]", "")
	form.Set("registerguest[password_repeat]", "")
	form.Set("back_x_value", "@cart")
	form.Set("next_x", "Continue to payment")
	form.Set("next_x_value", "@cart_payment")

	fmt.Println(form.Encode())
	request, err := http.NewRequest("POST", uri, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}

	request.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	request.Header.Set("Accept-Encoding", "gzip, deflate, br")
	request.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Set("Cache-Control", "max-age=0")
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Origin", sa.BaseURL)
	request.Header.Set("Referer", sa.BaseURL+"/cart/address")
	request.Header.Set("Sec-Fetch-Site", "same-origin")
	request.Header.Set("Sec-Fetch-Mode", "navigate")
	request.Header.Set("Sec-Fetch-User", "?1")
	request.Header.Set("Sec-Fetch-Dest", "document")
	request.Header.Set("User-Agent", sa.UserAgent)
	request.Header.Set("upgrade-insecure-requests", "1")

	res, err := sa.Client.Do(request)
	if err != nil {
		return err
	}

	buf, _ := ioutil.ReadAll(res.Body)
	fmt.Println("Address Response: \n" + string(buf))

	var body payment
	err = json.NewDecoder(res.Body).Decode(&body)

	return nil
}

func (sa *sneakAvenue) submitPaymentMethod() error {
	uri := sa.BaseURL + "/cart/paymentmethod"
	form := url.Values{}
	form.Set("payment_method_id", "5")
	form.Set("shipping_method_id", "220")
	form.Set("back_x_value", "@cart_address")
	form.Set("next_x", "Continue to summary")
	form.Set("next_x_value", "@cart_check")

	fmt.Println(form.Encode())
	request, err := http.NewRequest("POST", uri, strings.NewReader(form.Encode()))
	if err != nil {
		return err
	}

	request.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9")
	request.Header.Set("Accept-Encoding", "gzip, deflate, br")
	request.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Set("Cache-Control", "max-age=0")
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Origin", sa.BaseURL)
	request.Header.Set("Referer", sa.BaseURL+"/cart/paymentmethod")
	request.Header.Set("Sec-Fetch-Site", "same-origin")
	request.Header.Set("Sec-Fetch-Mode", "navigate")
	request.Header.Set("Sec-Fetch-User", "?1")
	request.Header.Set("Sec-Fetch-Dest", "document")
	request.Header.Set("User-Agent", sa.UserAgent)
	request.Header.Set("upgrade-insecure-requests", "1")

	res, err := sa.Client.Do(request)
	if err != nil {
		return err
	}

	buf, _ := ioutil.ReadAll(res.Body)
	fmt.Println("Address Response: \n" + string(buf))

	var body payment
	err = json.NewDecoder(res.Body).Decode(&body)

	return nil
}

func (sa *sneakAvenue) confirmOrder() (string, error) {
	uri := sa.BaseURL + "/cart/last-check"
	form := url.Values{}
	form.Set("next_x", "Buy now")
	form.Set("next_x_value", "@order_finished")

	request, err := http.NewRequest("POST", uri, strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}

	request.Header.Set("Accept", "*/*")
	request.Header.Set("Accept-Encoding", "gzip, deflate, br")
	request.Header.Set("Accept-Language", "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7")
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	request.Header.Set("Origin", sa.BaseURL)
	request.Header.Set("Referer", sa.BaseURL+"/cart")
	request.Header.Set("Sec-Fetch-Site", "same-origin")
	request.Header.Set("Sec-Fetch-Mode", "navigate")
	request.Header.Set("Sec-Fetch-User", "?1")
	request.Header.Set("Sec-Fetch-Dest", "document")
	request.Header.Set("User-Agent", sa.UserAgent)
	request.Header.Set("upgrade-insecure-requests", "1")

	res, err := sa.Client.Do(request)
	if err != nil {
		return "", err
	}

	if res.StatusCode != 302 {
		return "", errors.New("Response Status Not 302: " + res.Status)
	}

	redirectURL := res.Header.Get("location")

	if !strings.Contains(redirectURL, "paypal") {
		buf, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return "", errors.New("Invalid Redirect: " + redirectURL + " & Error Reading Body")
		}
		fmt.Println(string(buf))
		return "", errors.New("Invalid Redirect: " + redirectURL)
	}

	return redirectURL, nil
}
