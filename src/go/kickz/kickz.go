package main

import (
	"net/http"
	"net/url"
	"strings"
)

//GetProductData ...
func (t *Task) GetProductData() error {
	request, err := http.NewRequest("GET", t.BaseURL+"/de/api/product/erp/152382001", nil)

	if err != nil {
		return err
	}

	//Add Headers

	response, err := t.Client.Do(request)

	defer response.Body.Close()

	return nil
}

//AddToCart ...
func (t *Task) AddToCart() error {
	formValues := &url.Values{}
	formValues.Set("productVariantIdAjax", "")
	formValues.Set("ttoken", "")
	form := formValues.Encode()

	request, err := http.NewRequest("POST", t.BaseURL+"/de/cart/ajaxAdd", strings.NewReader(form))

	if err != nil {
		return err
	}

	//Add Headers

	response, err := t.Client.Do(request)

	defer response.Body.Close()

	return nil
}

//ReserveCart ...
func (t *Task) ReserveCart() (string, error) {
	request, err := http.NewRequest("GET", t.BaseURL+"/de/checkout/reserveBasketItemsAjax/timestamp/", nil)

	if err != nil {
		return "", err
	}

	//Add Headers

	response, err := t.Client.Do(request)

	defer response.Body.Close()

	return "status", nil
}

//AddressHint ...
func (t *Task) AddressHint() error {
	formValues := &url.Values{}
	formValues.Set("productVariantIdAjax", "")
	formValues.Set("ttoken", "")
	form := formValues.Encode()

	request, err := http.NewRequest("POST", t.BaseURL+"/de/checkout/addresses/method/addressHint", strings.NewReader(form))

	if err != nil {
		return err
	}

	//Add Headers

	response, err := t.Client.Do(request)

	defer response.Body.Close()

	return nil
}

//PaymentSummary ...
func (t *Task) PaymentSummary() error {
	formValues := &url.Values{}
	formValues.Set("productVariantIdAjax", "")
	formValues.Set("ttoken", "")
	form := formValues.Encode()

	request, err := http.NewRequest("POST", t.BaseURL+"/de/checkout/paymentSummarySubmit", strings.NewReader(form))

	if err != nil {
		return err
	}

	//Add Headers

	response, err := t.Client.Do(request)

	defer response.Body.Close()

	return nil
}

//PaymentMethod ...
func (t *Task) PaymentMethod() error {
	formValues := &url.Values{}
	formValues.Set("productVariantIdAjax", "")
	formValues.Set("ttoken", "")
	form := formValues.Encode()

	request, err := http.NewRequest("POST", t.BaseURL+"/de/checkout/${paymentMethodCode}", strings.NewReader(form))

	if err != nil {
		return err
	}

	//Add Headers

	response, err := t.Client.Do(request)

	defer response.Body.Close()

	return nil
}
