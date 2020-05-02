function build(type) {
	let body;
	switch (type) {
		case 'cart':
			body = {
				"merchantId": 12572,
				"productId": "14533750",
				"quantity": 1,
				"scale": 2024,
				"size": 24,
				"customAttributes": ""
			}
			break;

		case 'create-checkout':
			body = {
				"bagId": "7081f054-1cb0-47ef-9299-4e4f01c7afc0",
				"guestUserEmail": 	"jamesbecker16@icloud.com"
			}
			break;

		case 'shipping-info':
			body = {
				"shippingAddress":{
					"firstName":"James",
					"lastName":"Becker",
					"phone":"01590376220",
					"country":{
						"name":"United Kingdom",
						"id":"215"
					},
					"addressLine1":"81 Burney Avenue",
					"addressLine2":"CL-43C3",
					"addressLine3":"",
					"city":{
						"name":"Surbiton"
					},
					"state":{
						"name":"Surrey"
					},
					"zipCode":"KT58DF"
				},
				"billingAddress":{
					"firstName":"James",
					"lastName":"Becker",
					"phone":"01590376220",
					"country":{
						"name":"United Kingdom",
						"id":"215"
					},
					"addressLine1":
					"81 Burney Avenue",
					"addressLine2":"CL-43C3",
					"addressLine3":"",
					"city":{
						"name":"Surbiton"
					},
					"state":{
						"name":"Surrey"
					},
					"zipCode":"KT58DF"
				}
			}
			break;

		case 'other-billing':
			body = {
				"billingAddress":{
					"addressLine1":"81 Burney Avenue",
					"addressLine2":"CL-43C3",
					"city":{"countryId":215,"id":0,"name":"Surbiton"},
					"country":{
						"alpha2Code":"GB",
						"alpha3Code":"GBR",
						"culture":"en-GB",
						"id":215,
						"name":"United Kingdom",
						"nativeName":"United Kingdom",
						"region":"Europe",
						"regionId":0,
						"subfolder":"/en-GB",
						"continentId":3
					},
					"firstName":"James",
					"id":"00000000-0000-0000-0000-000000000000",
					"lastName":"Becker",
					"phone":"01590376220",
					"state":{
						"code":"Surrey",
						"countryId":0,
						"id":0,
						"name":"Surrey"
					},
					"zipCode":"KT58DF",
					"userId":0,
					"isDefaultBillingAddress":false,
					"isDefaultShippingAddress":false
				}
			}
			break;

		case 'submit-payment':
			body = {
				"cardNumber": "5273463241722312",
				"cardExpiryMonth": 1,
				"cardExpiryYear": 2024,
				"cardName": "James Kieran Becker",
				"cardCvv": "700",
				"paymentMethodType": "CreditCard",
				"paymentMethodId": "e13bb06b-392b-49a0-8acd-3f44416e3234",
				"savePaymentMethodAsToken": true
			}
	}
	//console.log(body);
	return body;
}

module.exports = build;