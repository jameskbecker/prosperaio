const Request = require("request")
const request = Request.defaults({
	gzip: true,
	jar: true,
	timeout: 10000
});
const cheerio = require("cheerio");

let useragent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
let dirURL_input = "https://www.bstn.com/p/jordan-wmns-air-jordan-4-retro-nrg-aq9128-600-93686"

//Navigate to Product Page
request({
	url: dirURL_input,
	headers: {
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
		"accept-encoding": "gzip",
		"accept-language": "accept-language",
		"upgrade-insecure-requests": 1,
		"user-agent": useragent
	}
	
}, (error, response, body) => {
	
})
setTimeout(() => {
//Add to Cart
request({
	url: "https://www.bstn.com/cart/add",
	method: "POST",
	headers: {
		"accept": "*/*",
		"accept-encoding": "gzip",
		"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
		"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		"origin": "https://www.bstn.com",
		"referer": dirURL_input,
		"user-agent": useragent,
		"x-requested-with": "XMLHttpRequest"
	},
	form: {
		"product_id": "143883",
		"product_bs_id": "93696",
		"amount": "",
		"ajax": true,
		"redirectRooting": "",
		"addToCart": "",
		"returnHtmlSnippets[partials][0][module]": "cart",
		"returnHtmlSnippets[partials][0][partialName]": "cartHeader",
		"returnHtmlSnippets[partials][0][returnName]": "headerCartDesktop",
		"returnHtmlSnippets[partials][0][params][template]": "Standard",
		"returnHtmlSnippets[partials][1][module]": "cart",
		"returnHtmlSnippets[partials][1][partialName]": "cartHeader",
		"returnHtmlSnippets[partials][1][returnName]": "cartErrors",
		"returnHtmlSnippets[partials][1][params][template]": "errorMessage",
		"returnHtmlSnippets[partials][2][module]": "cart",
		"returnHtmlSnippets[partials][2][partialName]": "cartHeader",
		"returnHtmlSnippets[partials][2][returnName]": "headerCartMobile",
		"returnHtmlSnippets[partials][2][params][template]": "mobileNavbar",
		"returnHtmlSnippets[partials][3][module]": "product",
		"returnHtmlSnippets[partials][3][path]": "_productDetail",
		"returnHtmlSnippets[partials][3][partialName]": "buybox",
		"returnHtmlSnippets[partials][3][returnName]": "buybox",
		"returnHtmlSnippets[partials][3][params][bsId]": "93696",
		"returnHtmlSnippets[partials][4][module]": "cart",
		"returnHtmlSnippets[partials][4][partialName]": "modalWasadded",
	}
	
}, (error, response, body) => {
	console.log(response.headers)
})
}, 2000);

let BSTNform = {
	guest: {
		billing: {
			"billAddressId": "-1",
			"guestdata[email]": "",
			"guestdata[email_repeat]": "",
			"billaddress[salutation]": "",
			"billaddress[forename]": "",
			"billaddress[lastname]": "",
			"billaddress[street]": "",
			"billaddress[street_number]": "",
			"billaddress[addition]": "",
			"billaddress[zipcode]": "",
			"billaddress[city]": "",
			"billaddress[country]": "",
			"billaddress[phone]": "",
			"shippingAddressId": "",
			"shippingaddress[salutation]": "",
			"shippingaddress[forename]": "",
			"shippingaddress[lastname]": "",
			"shippingaddress[street]": "",
			"shippingaddress[street_number]": "",
			"shippingaddress[addition]": "",
			"shippingaddress[zipcode]": "",
			"shippingaddress[city]": "",
			"shippingaddress[country]": "",
			"back_x_value": "@cart",
			"next_x": "Weiter zu Zahlung & Versand",
			"next_x_value:": "@cart_payment"
	
		},
		selectPayment: {
			"payment_method_id": "",
			"shipping_method_id": "",
			"back_x_value": "@cart_address",
			"next_x": "Weiter zur Bestellübersicht",
			"next_x_value": "@cart_check"
		},
		check: {
			gtc: 1,
			next_x: "Kostenpflichtig bestellen",
			next_x_value: "@order_finished"
		},
		pay: {
			"displayGroup": "card",
			"card.cardNumber": "",
			"card.cardHolderName": "",
			"card.expiryMonth": "",
			"card.expiryYear": "",
			"card.cvcCode": "",
			"sig": "????",
			"merchantReference": "????",
			"brandCode": "????",
			"paymentAmount": "",
			"currencyCode": "EUR",
			"shipBeforeDate": "",
			"skinCode": "????",
			"merchantAccount": "BSTNStoreGmbHCOM",
			"shopperLocale": "de",
			"stage": "pay",
			"sessionId": "????",
			"sessionValidity": "data.now()?",
			"countryCode": "DE",
			"shopperEmail": "",
			"merchantReturnData": "",
			"originalSession": "",
			"referrerURL": "https://www.bstn.com/de/cart/adyen/adyen_authorise",
			"dfValue": "????",
			"usingFrame": false,
			"usingPopUp": false,
			"shopperBehaviorLog": '{"numberBind":"1","holderNameBind":"1","cvcBind":"1","deactivate":"2","activate":"1","numberFieldFocusCount":"1","numberFieldLog":"fo@3021,cl@3023,KU@3023,KL@3024,ch@3056,bl@3056","numberFieldClickCount":"1","numberFieldKeyCount":"2","numberUnkKeysFieldLog":"91@3023","numberFieldChangeCount":"1","numberFieldEvHa":"total=0","numberFieldBlurCount":"1","holderNameFieldFocusCount":"1","holderNameFieldLog":"fo@3056,cl@3058,KU@3083,KL@3085,KL@3087,KL@3089,KL@3091,KL@3092,KL@3096,Ks@3097,KU@3100,KL@3115,KU@3118,KL@3123,KL@3124,KL@3126,KL@3128,ch@3136,bl@3136","holderNameFieldClickCount":"1","holderNameFieldKeyCount":"15","holderNameUnkKeysFieldLog":"20@3083,20@3100,219@3118","holderNameFieldChangeCount":"1","holderNameFieldEvHa":"total=0","holderNameFieldBlurCount":"1","cvcFieldFocusCount":"1","cvcFieldLog":"fo@3167,cl@3168,KN@3173,KN@3176,KN@3182,ch@3203,bl@3203","cvcFieldClickCount":"1","cvcFieldKeyCount":"3","cvcFieldChangeCount":"1","cvcFieldEvHa":"total=0","cvcFieldBlurCount":"1"}'
		}
	}
	
}


request({
	url: "https://www.bstn.com/cart/guest",
	method: "POST",
	headers: {
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
		"accept-encoding": "gzip",
		"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
		"content-type": "application/x-www-form-urlencoded",
		"origin": "https://www.bstn.com",
		"referer": "https://www.bstn.com/cart/guest",
		"upgrade-insecure-requests": 1,
		"user-agent": useragent
	},
	form: BSTNform.guest.billing
}, (error, response, body) => {

})

//Payment
request({
	url: "https://www.bstn.com/cart/payment",
	method: "POST",
	headers: {
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
		"accept-encoding": "gzip",
		"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
		"content-type": "application/x-www-form-urlencoded",
		"origin": "https://www.bstn.com",
		"referer": "https://www.bstn.com/cart/payment",
		"upgrade-insecure-requests": 1,
		"user-agent": useragent
	},
	form: BSTNform.guest.selectPayment
})

request({
	url: "https://www.bstn.com/cart/check",
	method: "POST",
	headers: {
		"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
		"accept-encoding": "gzip",
		"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
		"content-type": "application/x-www-form-urlencoded",
		"origin": "https://www.bstn.com",
		"referer": "https://www.bstn.com/cart/check",
		"upgrade-insecure-requests": 1,
		"user-agent": useragent
	},
	form: BSTNform.guest.check
})
