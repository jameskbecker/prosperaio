package meshmobile

import (
	"encoding/json"
	"net/url"
)

func (t *task) buildATCForm() (form []byte, err error) {
	content := atcContent{
		Schema: "https://prod.jdgroupmesh.cloud/stores/jdsportsuk/schema/CartProduct",
		SKU:    t.sku,
		Qty:    1,
	}
	form, err = json.Marshal(atcWrapper{
		Channel:  "iphone-app",
		Contents: []atcContent{content},
	})
	return form, err
}

func (t *task) buildCustomerForm() (form []byte, err error) {
	form, err = json.Marshal(customer{
		Phone:     "",
		Gender:    "",
		FirstName: "",
		LastName:  "",
		Addresses: []address{},
		Title:     "",
		Email:     "",
		IsGuest:   true,
	})
	return form, err
}

func (t *task) cardForm() url.Values {
	form := url.Values{}
	form.Set("displayGroup", "card")
	form.Set("card.cardNumber", "")
	form.Set("card.cardHolderName", "")
	form.Set("card.expiryMonth", "")
	form.Set("card.expiryYear", "")
	form.Set("card.cvcCode", "")

	form.Set("sig", "")
	form.Set("merchantReference", "")
	form.Set("brandCode", "brandCodeUndef")
	form.Set("paymentAmount", "")
	form.Set("currencyCode", "")
	form.Set("shipBeforeDate", "2021-01-23")
	form.Set("skinCode", "I4ES7AFg")
	form.Set("merchantAccount", "JD_SportsOMS")
	form.Set("stage", "pay")
	form.Set("sessionId", "")
	form.Set("sessionValidity", "")

	form.Set("shopperBehaviorLog", "")
	form.Set("shopperEmail", "")
	form.Set("shopperLocale", "gb")
	form.Set("shopperReference", "")
	form.Set("shopper.firstName", "")
	form.Set("shopper.lastName", "")

	form.Set("recurringContract", "")
	form.Set("resURL", "https://ok")
	form.Set("allowedMethods", "card")
	form.Set("blockedMethods", "paypal,kcp_creditcard,kcp_payco,kcp_banktransfer,directEbanking,giropay,ideal,wechatpay,alipay,unionpay,entercash,molpay_ebanking_TH,molpay_paysbuy,multibanco,alipay_wap")
	form.Set("originalSession", "")

	form.Set("billingAddress.street", "")
	form.Set("billingAddress.houseNumberOrName", "")
	form.Set("billingAddress.city", "")
	form.Set("billingAddress.postalCode", "")
	form.Set("billingAddress.stateOrProvince", "")
	form.Set("billingAddress.country", "")
	form.Set("billingAddressType", "2")
	form.Set("billingAddressSig", "")

	form.Set("deliveryAddress.street", "")
	form.Set("deliveryAddress.houseNumberOrName", "")
	form.Set("deliveryAddress.city", "")
	form.Set("deliveryAddress.postalCode", "")
	form.Set("deliveryAddress.stateOrProvince", "")
	form.Set("deliveryAddress.country", "GB")
	form.Set("deliveryAddressType", "2")
	form.Set("deliveryAddressSig", "")

	form.Set("merchantIntegration.type", "HPP")
	form.Set("dfValue", "")
	form.Set("usingFrame", "false")
	form.Set("usingPopUp", "false")
	return form
}
