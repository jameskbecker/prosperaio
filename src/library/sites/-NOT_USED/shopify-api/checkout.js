const builder = require('./builder');
const cheerio = require('cheerio');
exports.create = function () {
	return new Promise((resolve, reject) => {
		let path = ['dsml-eflash'].includes(this.taskData.site.id) ? '/wallets/checkouts' : '/wallets/checkouts.json';
		this.request({
			url: `https://${this.taskData.site.baseUrl}${path}`,
			method: 'POST',
			jar: this.cookieJar,
			headers: {
				'X-Shopify-Storefront-Access-Token': this.apiToken,
				'Host': this.taskData.site.baseUrl,
				'Content-Type': 'application/json',
				'User-Agent': this.userAgent
			},
			followRedirect: false,
			json: true,
			body: builder('contact', { billing: this.profile.billing, country: 'Germany'})
		}, (error, response, body) => {
			if (error) {
				let err = new Error();
				err.code = 'CONNECTION';
				reject(err);
			}
			else {
			//	console.log(body)
				switch (response.statusCode) {
					case 200:
					case 201:
					case 202:
						console.log(response)
						this.checkoutUrl = body.checkout.web_url;
						this.checkoutToken = body.checkout.token;
						resolve();
						break;
					case 303:
						this.setStatus('IN QUEUE', 'WARNING');
						this.isQueued = true;
						let queueToken;
						try {
							for (let i = 0; i < response.headers['set-cookie'].length; i++) {
								if (response.headers.set-cookie[i].includes('_shopify_ctd')) {
									queueToken = response.headers.set-cookie[i].split(';')[0].split(`_shopify_ctd=`)[1];
								}
							}
						} catch(err) {}
						if (queueToken) {
							this.queueToken = queueToken;
							resolve();
						}
						else {
							let err = new Error();
							err.code = ('NO QUEUE TOKEN');
							reject(err);
						}
						break;
					case 422:
						console.log('FORM ERROR')
						reject();
						break;
					default:
						console.log('ERROR POLLING CHECKOUT.');
						reject();
						break;
				}
			}
			/* 
			checkout url ----> body['web_url']
			body.order_id
			body.order
			*/
		})

	})
}

exports.get = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.taskData.site.baseUrl}/wallets/checkouts/${this.checkoutToken}.json`,
			method: 'GET',
			jar: this.cookieJar,
			json: true,
			followAllRedirects: false,
			headers: {
				"accept": "application/json",
				"accept-encoding": "gzip, deflate",
				"Connection": "keep-alive",
				'Content-Type': 'application/json',
				'Host': this.taskData.site.baseUrl,
				'X-Shopify-Storefront-Access-Token': this.apiToken,
				'User-Agent': this.userAgent
			}
		}, (error, response, body) => {
			if (error) {

			}
			else {
				switch (response.statusCode) {
					case 200:
						console.log(body);
						resolve();
				}
			}
		})
	})
}

exports.getSessionId = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: 'https://elb.deposit.shopifycs.com/sessions',
			method: 'POST',
			jar: this.cookieJar,
			followAllRedirects: true,
			json: true,
			headers: {
				'Accept': 'application/json',
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'en-US;q=0.8',
				'Content-Type': 'application/json',
				'Host': 'elb.deposit.shopifycs.com',
				'Connection': 'keep-alive',
				'Origin': 'https://checkout.shopifycs.com',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s	'
			},
			body: builder.creditCard.bind(this)()
		}, (error, response, body) => {
			if (!error) {
				switch (response.statusCode) {
					case 200:
						if (body.hasOwnProperty('id')) {
							this.sessionId = body.id;
							resolve();
						}
						else {
							let err = new Error();
							err.code = 'NO SESSION';
							reject(err);
						}
					default: console.log(response.statusCode)

				}
			}
			else {
				let err = new Error();
				err.code = 'Request Error';
				reject('err');
			}
		})
	})
}

exports.getCheckoutToken = function () {
	return new Promise((resolve, reject) => {
		this.request({
			url: this.checkoutUrl,
			method: 'GET',
			headers: {
				"accept":	"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"accept-encoding":	"gzip, deflate",
				"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
				"cache-control":	"max-age=0",
				"content-type":	"application/x-www-form-urlencoded",
				"origin":	`https://${this.baseUrl}`,
			//	"referer": `${this.checkoutUrl}?previous_step=shipping_method&step=payment_method`,
				"upgrade-insecure-requests":	"1",
				"user-agent":	this.userAgent,
			}
		}, (error, response, body) => {
			if (error) console.log(error)
			else {
				console.log(body)
				let $ = cheerio.load(body);
				let authToken = $('input[name="authenticity_token"]').val();
				if(authToken) {
					this.checkoutAuth = authToken;
					resolve();
				}
				else {
					reject()
				}
			}
		})
	})
}

exports.update = function (form) {	
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.taskData.site.baseUrl}/wallets/checkouts/${this.checkoutToken}.json`,
			method: 'PATCH',
			jar: this.cookieJar,
			headers: {
				"accept": "application/json",
				"accept-encoding": "gzip, deflate",
				"Connection": "keep-alive",
				'Content-Type': 'application/json',
				'Host': this.taskData.site.baseUrl,
				'X-Shopify-Storefront-Access-Token': this.apiToken,
			//	'x-shopify-checkout-authorization-token': this.specialKey || '',
				'referer': '' + this.checkoutUrl || '',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
			},
			body: JSON.stringify(form)
		}, (error, response, body) => {
			if (!error) {
		;
				switch (response.statusCode) {
					case 200:
					case 201:
					case 202:

						resolve();
						break;
					default:
						//console.log(response)
						let err = new Error();
						err.code = "UNEXPECTED";
						reject(err);
				}
			}
			else {

			}
		})
	})
}



exports.getRates = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.taskData.site.baseUrl}/wallets/checkouts/${this.checkoutToken}/shipping_rates.json`,
			method: 'GET',
			jar: this.cookieJar,
			headers: {
				'X-Shopify-Storefront-Access-Token': this.apiToken,
				'Host': this.taskData.site.baseUrl,
				'Content-Type': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
			},
			json: true
		}, (error, response, body) => {
			if (error) {
				let err = new Error();
				err.code = 'CONNECTION';
				reject(err);
			}
			else {
				switch(response.statusCode) {
					case 200:
						if (body.shipping_rates.length > 0) {
							this.shipping.id = body.shipping_rates[0].id;
							resolve();
						}
						else {
							let err = new Error();
							err.code = 'NO RATES';
							reject(err);
						}
						break;
				}
			}
		})
	})
}

exports.submitOrder = function() {
	return new Promise((resolve, reject) => {
		console.log(JSON.stringify(builder.apiSubmitOrder(this.sessionId, this.shippingId, this.captchaResponse, this.checkoutAuth)))
		this.request({
			url: this.checkoutUrl,
			//url: `https://${this.taskData.site.baseUrl}/wallets/checkouts/${this.checkoutToken}.json`,
			method: 'PATCH',
			jar: this.cookieJar,
			followAllRedirects: false,
	//		json: true,
			headers: {
				// 'connection': 'keep-alive',
				// 'cache-control': 'max-age=0',
				// 'origin': this['baseURL'],
				// 'upgrade-insecure-requests': '1',
				// 'content-type': 'application/x-www-form-urlencoded',
				// 'user-agent': this['_ua'],
				// 'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
				// 'referer': this['_checkoutURL'] + '?previous_step=shipping_method&step=payment_method',
				// 'accept-encoding': 'gzip, deflate, br',
				// 'accept-language': 'en-US,en;q=0.9',
				// 'x-shopify-uniquetoken': this['getUniqueToken'](),
				// 'authorization': `Basic${btoa('' + this.apiToken)}`,
				// 'x-shopify-checkout-version': this['_ver'],
				// 'x-shopify-visittoken': this['getVisitToken'](),
				// 'x-shopify-checkout-authorization-token': this['_specialKey']


				"Accept-Encoding": "gzip, deflate",
				"Connection": "keep-alive",
				'Content-Type': 'application/json',
				"Host": this.taskData.site.baseUrl,
				"User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s',
				"X-Shopify-Storefront-Access-Token": this.apiToken,

			//	"Cache-Control": "no-cache",
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
			//	"Referer": `${this.checkoutUrl}?step=payment_method&previous_step=shipping_method`
				
				// "Accept-Language": "en-US;q=0.8",
				
				// "X-Shopify-Checkout-Version": '2018-03-05',
				// "Upgrade-Insecure-Requests": 1,
				
			},
			
			body: JSON.stringify(builder.apiSubmitOrder(this.sessionId, this.shippingId, this.captchaResponse, this.checkoutAuth))
		}, (error, response, body) => {
			if (!error) {
				let err;
				//console.log(body);
				console.log(response)
				console.log(this.cookieJar)
				switch (response.statusCode) {
					case 200:
					case 201:
					case 202:
						if (body.toLowerCase().indexOf('new rate') !== -1) {
							err = new Error();
							err.code = 'SHIPPING';
							reject(err);
						}
						if (body.toLowerCase().indexOf('captcha validation failed') !== -1) {
							err = new Error();
							err.code = 'CAPTCHA';
							reject(err);
						}
						if (body.toLowerCase().indexOf('processing') !== -1) resolve();
						break;
					default:
						console.log(response.statusCode)
						err = new Error();
						err.code = "UNEXPECTED";
						resolve	(err);
				}
			}
			else {
				console.log(error)
			}
		})
	})
}

exports.getLatestPaymentId = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.taskData.site.baseUrl}/wallets/checkouts/${this.checkoutToken}/payments.json`,
			method: 'GET',
			jar: this.cookieJar,
			json: true,
			headers: {
				"accept": "application/json",
				"accept-encoding": "gzip, deflate",
				"Connection": "keep-alive",
				'Content-Type': 'application/json',
				'Host': this.taskData.site.baseUrl,
				'X-Shopify-Storefront-Access-Token': this.apiToken,
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
			}
		}, (error, response, body) => {
			if (error) {
				
			}
			else {
				console.log(body);
				let payment = body.payments[body.payments.length - 1];
				
			
				let paymentError;
			let orderNumber;
			let successful = false;
			try {
				let _0x39a791 = JSON[`parse`](body);
				for (let i = 0; i < _0x39a791[`payments`][`length`]; i++) {
					const payment = _0x39a791[`payments`][i];
					if (this[`_total`] == `0.00`) {
						if (_0x39a791[`payments`][i][`checkout`][`order`][`status_url`][`indexOf`](`thank_you`) != -1) {
							successful = true;
							orderNumber = _0x39a791[`payments`][i][`checkout`][`order`][`name`];
						}
					}
					else {
						if (payment[`payment_processing_error_message`]) {
							paymentError = payment[`payment_processing_error_message`];
						}
						if (payment[`transaction`]) {
							const transactionData = payment[`transaction`];
							if (transactionData[`status`] && transactionData[`status`] === `success`) {
								successful = true;
								if (transactionData[`order_id`]) {
									orderNumber = transactionData[`order_id`];
								}
							}
						}
					}
				}
			} catch (err) { }
			if (successful) {
				if (this[`profileData`][`limit`]) this[`limitProfile`]();
				taskLog[`info`][`bind`](this)(`Order ` + orderNumber + ` placed!`);
				this[`orderNum`] = orderNumber;
				this[`sendStats`](this[`taskData`][`config`][`site`], this[`variant`], this[`productName`], `checkout`);
				this[`sendHook`](this[`taskData`][`config`][`site`], this[`variant`], this[`productName`], this[`profileData`][`title`]);
				return this[`softStop`](`Check Email.`, true);
			}
			if (paymentError) {
				if (this[`_payAttempts`] === 0x4) this[`sendStats`](this[`taskData`][`config`][`site`], this[`variant`], this[`productName`], `fail`);
				taskLog[`warn`][`bind`](this)(`Payment error -> ` + paymentError + '!');
				if (paymentError[`indexOf`](`decline`) !== -1) {
					taskLog[`warn`][`bind`](this)(`Payment Declined.`);
				}
				if (paymentError[`indexOf`](`stock`) !== -1) {
					taskLog[`warn`][`bind`](this)(`Payment Failed #` + this[`_payAttempts`] + `, OOS.`);
					return exports[`restockSetup`][`bind`](this)();
				}
				taskActions[`setStatus`][`bind`](this)(`Payment Declined #` + this[`_payAttempts`] + '.', statusColor[`FAIL`]);
				exports[`getNewSValue`][`bind`](this)(_0x1abc24 => {
					exports[`submitPayment`][`bind`](this)(_0x1abc24);
				});
				return;
			}
			taskLog[`info`][`bind`](this)(_0x1df3b7[`zAggW`]);
			_setTimeout(() => exports[`apiPollPayment`][`bind`](this)(), 0x5dc);
		}

		})
	})
}

exports.pollPaymentStatus = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.taskData.site.baseUrl}/wallets/checkouts/${this.checkoutToken}/payments/${this.latestPaymentId}.json`,
			method: 'GET',
			jar: this.cookieJar,
			json: true,
			headers: {
				"accept": "application/json",
				"accept-encoding": "gzip, deflate",
				"Connection": "keep-alive",
				'Content-Type': 'application/json',
				'Host': this.taskData.site.baseUrl,
				'X-Shopify-Storefront-Access-Token': this.apiToken,
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
			}
		}, (error, response, body) => {
			if (error) {
				
			}
			else {
				console.log(body);
			
				resolve();
			}
		})
	})
}