const builder = require('../builder');
const { utilities } = require('../../../other');

exports.postMobile = function() {
	return new Promise(async (resolve, reject) => {
		let cookieSub = encodeURI(`{"${this.productData.sizeId}":"${this.products[0].quantity}"}`);
		this.request({
			url: `https://www.${this.baseUrl}/checkout.json`,
			method: 'POST',
			proxy: utilities.formatProxy(this.taskData.additional.proxyOptions.proxy),
			json: true,
			jar: this.cookieJar,
			headers: this.headers,
			form: builder.checkoutFormMobile(this.region, cookieSub, this.profile.billing, this.profile.payment, this.captchaResponse)
		}, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				switch (response.statusCode) {
					case 200:
						if (body.slug) {
							this.slug = body.slug;
							resolve();
						} 
						else {
							console.log(body)
							let err = new Error();
							err.code = 'NO CAPTCHA';
							reject(err);
						}
					break;
					case 303:
					break;
				}
			}

			else {
				console.log(response)
				console.log(formMobileEu.bind(this)())
				
			}
		})
	})
}
// const formDesktopEu = function() {
// 	let billingInfo = this.profile.billing;
// 	let paymentInfo = this.profile.payment;
	
// 	let form = {
// 		"utf8": "✓",
// 		"authenticity_token": this.authToken,
// 		"order[billing_name]": `${billingInfo.first} ${billingInfo.last}`,
// 		"order[email]": billingInfo.email,
// 		"order[tel]": billingInfo.telephone,
// 		"order[billing_address]": billingInfo.address1,
// 		"order[billing_address_2]": billingInfo.address2,
// 		"order[billing_address_3]": billingInfo.address3,
// 		"order[billing_city]": billingInfo.city,
// 		"order[billing_zip]": billingInfo.zip,
// 		"order[billing_country]": billingInfo.country,
// 		"same_as_billing_address": 1,
// 		"store_credit_id": "",
// 		"credit_card[type]": paymentInfo.type,
// 		"credit_card[cnb]": paymentInfo.number,
// 		"credit_card[month]": paymentInfo.expMonth,
// 		"credit_card[year]": paymentInfo.expYear,
// 		"credit_card[vval]": paymentInfo.cvv,
// 		"order[terms]": 0,
// 		"order[terms]": 1,
// 		"g-recaptcha-response": this.captchaResponse,
// 		"hpcvv": ""
// 	}
	
// 	return form
// }

// const formMobileEu = function() {
// 	let billingInfo = this.profile.billing;
// 	let paymentInfo = this.profile.payment;
// 	let form = {
// 		"store_credit_id": "",
// 		"from_mobile": 1,
// 		"cookie-sub": encodeURI(`{"${this.productData.sizeId}":"${this.products[0].quantity}"}`),
// 		"same_as_billing_address": 1,
// 		"order[billing_name]": `${billingInfo.first} ${billingInfo.last}`,
// 		"order[email]": billingInfo.email,
// 		"order[tel]": billingInfo.telephone,
// 		"order[billing_address]": billingInfo.address1,
// 		"order[billing_address_2]": billingInfo.address2,
// 		"order[billing_address_3]": billingInfo.address3,
// 		"order[billing_city]": billingInfo.city,
// 		"order[billing_zip]": billingInfo.zip,
// 		"order[billing_country]": billingInfo.country,
// 		"credit_card[type]": paymentInfo.type,
// 		"credit_card[cnb]": paymentInfo.cardNumber,
// 		"credit_card[month]": paymentInfo.expiryMonth,
// 		"credit_card[year]": paymentInfo.expiryYear,
// 		"credit_card[vval]": paymentInfo.cvv,
// 		"order[terms]": 0,
// 		"order[terms]": 1,
// 		"g-recaptcha-response": this.captchaResponse
// 	}
// 	return form;
// }

// exports.postCheckoutDesktopEu = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: `https://www.${this.site.baseUrl}/checkout.json`,
// 			method: 'POST',
// 			json: true,
// 			headers: {
// 				"accept": "*/*",
// 				"accept-encoding": "gzip, deflate",
// 				"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
// 				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
// 				"origin": "https://www.supremenewyork.com",
// 				"referer": "https://www.supremenewyork.com/checkout",
// 				"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
// 				'x-csrf-token': `${this.authToken}`,
// 				"x-requested-with": "XMLHttpRequest"
// 			},
// 			form: checkoutForm.bind(this)()
// 		}, (error, response, body) => {
// 			if (!error && response === 200) {
// 				const status = body.status;
// 				const orderErrors = body.orderErrors;
// 				const errors = body.errors;
// 				const finalCart = body.cart;
// 				if (status === 'failed') {
// 					let taskError = new Error;
// 					if (errors) {
// 						if(errors['credit_card'] === 'number is not a valid credit card number') {
// 							taskError.type = 'Invalid Payment Info';
// 							reject(taskError);
// 						}
// 					}
// 					else {
// 						if(body.page) {
// 							let taskError = new Error();
// 							taskError.type = "Card Decline";
// 							reject(taskError);
// 						}
// 					}
// 				}



// 			}
// 			else {

// 			}
// 		})
// 		resolve();
// 	})
// }

// exports.postCheckoutMobileEu = function() {
// 	return new Promise(async (resolve, reject) => {
// 		this.request({
// 			url: `https://www.${this.baseUrl}/checkout.json`,
// 			method: 'POST',
// 			json: true,
// 			jar: this.cookieJar,
// 			headers: this.headers,
// 			form: formMobileEu.bind(this)()
// 		}, (error, response, body) => {
// 			if (!error && response.statusCode === 200) {
// 				if (body.slug) {
// 					this.slug = body.slug;
// 					resolve();
// 				} 
// 				else {
// 					let err = new Error();
// 					err.code = 'NO CAPTCHA';
// 					reject(err);
// 				}
				
// 			}

// 			else {
// 				console.log(response)
// 				console.log(formMobileEu.bind(this)())
				
// 			}
// 		})
// 	})
// }