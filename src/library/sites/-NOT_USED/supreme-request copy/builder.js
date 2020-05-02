module.exports = function (type) {
	let form;
	switch (type) {
		case 'cart':
			form = {
				"size": this.productData.sizeId,
				"style": this.productData.styleId,
				"qty": this.taskData.productQty || 1
			}
			return form;
		
		case 'totals-mobile':
			form = {
				'order[billing_country]':	this.profile.billing.country,
				'cookie-sub':	this.cookieSub,
				'mobile':	true
			}
			return form;

		case 'cardinal-init': {
			form = {
				"BrowserPayload": {
					"Order": {
						"OrderDetails": {},
						"Consumer": {
							"BillingAddress": {},
							"ShippingAddress": {},
							"Account": {}
						},
						"Cart": [],
						"Token": {},
						"Authorization": {},
						"Options": {},
						"CCAExtension": {}
					},
					"SupportsAlternativePayments": {
						"cca": true,
						"hostedFields": false,
						"applepay": false,
						"discoverwallet": false,
						"wallet": false,
						"paypal": false,
						"visacheckout": false
					}
				},
				"Client": {
					"Agent": "SongbirdJS",
					"Version": "1.26.0"
				},
				"ConsumerSessionId": null,
				"ServerJWT": this.cardinalJWT
			}
			return form;
		}

		case 'checkout-eu':
			form = {
				'store_credit_id': '',
				'from_mobile': '1',
				'cookie-sub': this.cookieSub,
				'cardinal_id': this.cardinalId,
				'same_as_billing_address': '1',
				'order[billing_name]': `${this.profile.billing.first} ${this.profile.billing.last}`,
				'order[email]': this.profile.billing.email,
				'order[tel]': this.profile.billing.telephone,
				'order[billing_address]': this.profile.billing.address1,
				'order[billing_address_2]': this.profile.billing.address2,
				'order[billing_address_3]': '',
				'order[billing_city]': this.profile.billing.city,
				'order[billing_zip]': this.profile.billing.zip,
				'order[billing_country]': this.profile.billing.country,
				'store_address': '1',
				'credit_card[type]': this.profile.payment.type,
				'credit_card[cnb]': this.profile.payment.cardNumber,
				'credit_card[month]': this.profile.payment.expiryMonth,
				'credit_card[year]': this.profile.payment.expiryYear,
				'credit_card[vval]': this.profile.payment.cvv,
				'order[terms]': '1',
				'g-recaptcha-response': this.captchaResponse,
				'is_from_ios_native': '1'
			}
			return form;
		case 'checkout-us':
			form = {
				'store_credit_id': '',
				'from_mobile': '1',
				'cookie-sub': this.cookieSub,
				'same_as_billing_address': 1,
				'order[billing_name]': '', //fake billing name 
				'order[bn]': `${this.profile.billing.first} ${this.profile.billing.last}`,
				'order[email]': this.profile.billing.email,
				'order[tel]': this.profile.billing.telephone,
				'order[billing_address]': this.profile.billing.ad,
				'order[billing_address_2]': this.profile.billing.address2,
				'order[billing_zip]': this.profile.billing.zip,
				'order[billing_city]': this.profile.billing.city,
				'order[billing_country]': 'USA',
				'credit_card[cnb]': this.profile.payment.cardNumber,
				'credit_card[month]': this.profile.payment.expiryMonth,
				'credit_card[year]': this.profile.payment.expiryYear,
				'credit_card[rsusr]': this.profile.payment.cvv,
				'order[terms]': '1',
				'g-recaptcha-response': this.captchaResponse,
				'is_from_ios_native': '1'
			}
			return form;
		case 'checkout-jp':
			form = {
				'store_credit_id': '',
				'from_mobile': 1,
				'cookie-sub': this.cookieSub,
				'same_as_billing_address': 1,
				'order[billing_name]': `${this.profile.billing.first} ${this.profile.billing.last}`,
				'order[email]': this.profile.billing.email,
				'order[tel]': this.profile.billing.telephone,
				'order[billing_address]': this.profile.billing.address1,
				'order[billing_city]': this.profile.billing.city,
				'order[billing_zip]': this.profile.billing.zip,
				'credit_card[month]': this.profile.payment.expiryMonth,
				'credit_card[year]': this.profile.payment.expiryYear,
				'order[terms]': 0,
				'order[terms]': 1,
				'g-recaptcha-response': this.captchaResponse,
				'is_from_ios_native': 1
			}
			form['order[billing_state]'] = this.profile.billing.state;
			form['store_address'] = 1;
			form['credit_card[type]'] = this.profile.payment.type;
			form['credit_card[cnb]'] = this.profile.payment.cardNumber;
			from['credit_card[vval]'] = this.profile.payment.cvv;
			return form;
	}
}


// let a = {
// 	"typ": "JWT",
// 	"alg": "HS256"
// }
// let b = {
// 	"jti": "dfefd907-7765-4a4f-aa9c-5a2290c4e85c",
// 	"iat": 1561610908,
// 	"exp": 1561610908,
// 	"iss": "5cf74ede356dce2cb8c59347",
// 	"OrgUnitId": "56099d28f723aa3e24d81c1b",
// 	"ObjectifyPayload": true,
// 	"Payload": {
// 		"OrderDetails": {
// 			"OrderNumber": null,
// 			"Amount": 3200,
// 			"CurrencyCode": "EUR",
// 			"OrderChannel": "S"
// 		}
// 	}
// }


// exports.cart = function (sizeId, styleId, qty = '1') {
// 	let form = {
// 		"size": this.productData.sizeId,
// 		"style": this.productData.styleId,
// 		"qty": this.taskData.productQty || 1
// 	}

// 	return form;
// }

// exports.checkoutFormMobile = function () {
// 	let form;
// 	switch (this.taskData.site.id) {
// 		case 'supreme-eu':
// 			form = {
// 				'store_credit_id': '',
// 				'from_mobile': '1',
// 				'cookie-sub': this.cookieSub,
// 				'cardinal_id': ' ',
// 				'same_as_billing_address': '1',
// 				'order[billing_name]': `${this.profile.billing.first} ${this.profile.billing.last}`,
// 				'order[email]': this.profile.billing.email,
// 				'order[tel]': this.profile.billing.telephone,
// 				'order[billing_address]': this.profile.billing.address1,
// 				'order[billing_address_2]': this.profile.billing.address2,
// 				'order[billing_address_3]': '',
// 				'order[billing_city]': this.profile.billing.city,
// 				'order[billing_zip]': this.profile.billing.zip,
// 				'order[billing_country]': this.profile.billing.country,
// 				'store_address': '1',
// 				'credit_card[type]': this.profile.payment.type,
// 				'credit_card[cnb]': this.profile.payment.cardNumber,
// 				'credit_card[month]': this.profile.payment.expiryMonth,
// 				'credit_card[year]': this.profile.payment.expiryYear,
// 				'credit_card[vval]': this.profile.payment.cvv,
// 				'order[terms]': '1',
// 				'g-recaptcha-response': this.captchaResponse,
// 				'is_from_ios_native': '1'
// 			}
// 			break;

// 		case 'supreme-us':
// 			form = {
// 				'store_credit_id': '',
// 				'from_mobile': 1,
// 				'cookie-sub': this.cookieSub,
// 				'same_as_billing_address': 1,
// 				'order[billing_name]': `${this.profile.billing.first} ${this.profile.billing.last}`,
// 				'order[email]': this.profile.billing.email,
// 				'order[tel]': this.profile.billing.telephone,
// 				'order[billing_address]': this.profile.billing.address1,
// 				'order[billing_city]': this.profile.billing.city,
// 				'order[billing_zip]': this.profile.billing.zip,
// 				'credit_card[month]': this.profile.payment.expiryMonth,
// 				'credit_card[year]': this.profile.payment.expiryYear,
// 				'order[terms]': 0,
// 				'order[terms]': 1,
// 				'g-recaptcha-response': this.captchaResponse,
// 				'is_from_ios_native': 1
// 			}
// 			form['order[billing_name]'] = '';
// 			form['order[bn]'] = `${this.profile.billing.first} ${this.profile.billing.last}`;
// 			form['order[billing_address_2]'] = this.profile.billing.address2;
// 			form['order[billing_state]'] = this.profile.billing.state;
// 			form['order[billing_country]'] = this.profile.billing.country;
// 			form['credit_card[cnb]'] = this.profile.payment.cardNumber;
// 			form['credit_card[rsusr]'] = this.profile.payment.cvv;
// 			break;
// 		case 'supreme-jp':
// 			form = {
// 				'store_credit_id': '',
// 				'from_mobile': 1,
// 				'cookie-sub': this.cookieSub,
// 				'same_as_billing_address': 1,
// 				'order[billing_name]': `${this.profile.billing.first} ${this.profile.billing.last}`,
// 				'order[email]': this.profile.billing.email,
// 				'order[tel]': this.profile.billing.telephone,
// 				'order[billing_address]': this.profile.billing.address1,
// 				'order[billing_city]': this.profile.billing.city,
// 				'order[billing_zip]': this.profile.billing.zip,
// 				'credit_card[month]': this.profile.payment.expiryMonth,
// 				'credit_card[year]': this.profile.payment.expiryYear,
// 				'order[terms]': 0,
// 				'order[terms]': 1,
// 				'g-recaptcha-response': this.captchaResponse,
// 				'is_from_ios_native': 1
// 			}
// 			form['order[billing_state]'] = this.profile.billing.state;
// 			form['store_address'] = 1;
// 			form['credit_card[type]'] = this.profile.payment.type;
// 			form['credit_card[cnb]'] = this.profile.payment.cardNumber;
// 			from['credit_card[vval]'] = this.profile.payment.cvv;
// 			break;
// 		default: form = {}
// 	}
// 	console.log(form)
// 	return form;
// }

// module.exports = function (type) {
// 	switch (type) {
// 		case 'cardinal-init':
// 			let form = {
// 				"BrowserPayload": {
// 					"Order": {
// 						"OrderDetails": { },
// 						"Consumer": {
// 							"BillingAddress": { },
// 							"ShippingAddress": { },
// 							"Account": { }
// 						},
// 						"Cart": [],
// 							"Token": { },
// 						"Authorization": { },
// 						"Options": { },
// 						"CCAExtension": { }
// 					},
// 					"SupportsAlternativePayments": {
// 						"cca": true,
// 							"hostedFields": false,
// 								"applepay": false,
// 									"discoverwallet": false,
// 										"wallet": false,
// 											"paypal": false,
// 												"visacheckout": false
// 					}
// 				},
// 				"Client": {
// 					"Agent": "SongbirdJS",
// 						"Version": "1.26.0"
// 				},
// 				"ConsumerSessionId": null,}
// 					//"ServerJWT": /*BASE 64 ENCODED */
// 					{
// 						"typ":"JWT",
// 						"alg":"HS256"
// 					}.
// 					{
// 						"jti":"dfefd907-7765-4a4f-aa9c-5a2290c4e85c","iat":1561610908,"exp":1561610908,"iss":"5cf74ede356dce2cb8c59347","OrgUnitId":"56099d28f723aa3e24d81c1b","ObjectifyPayload":true,"Payload":{"OrderDetails":{"OrderNumber":null,"Amount":3200,"CurrencyCode":"EUR","OrderChannel":"S"}}}.
// 					0O1XoYx1FyFG2E3cLntvwNx3Syxyaqn5M8Nh8G-MVqU"
// 			}
// 	}
// }