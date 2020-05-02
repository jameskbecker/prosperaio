const builder = require('./builder');
const cheerio = require('cheerio');
const { utilities } = require('../../other');
 
fetchCardinalData() = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.baseUrl}/checkout/totals_mobile.js`,
			method: 'GET',
			jar: this.cookieJar,
			headers: {
				'accept': 'text/html',
				'x-requested-with': 'XMLHttpRequest',
				'user-agent': this.userAgent,
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'referer': `https://${this.baseUrl}/mobile`,
				'accept-encoding': 'gzip, deflate',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'if-none-match': 'W/"498ecdb7b3c7acb17f7514f66bbb5b9d"'
			},
			qs: builder.bind(this)('totals-mobile')
		}, (error, response, body) => {
			if (error) {

			}
			else if (response.statusCode !== 200) {

			}
			else {
				let $ = cheerio.load(body);
				let jwt_value = $('#jwt_cardinal').val()
				let subtotal = $('#subtotal').text();
				let shipping = $('#shipping').text();
				let salesTaxTotal = $('#sales-tax-total').text();
				let vatDiscountTotal = $('#vat-discount-total').text();
				let total = $('#total').text();
			}
		})
	})
}

exports.fetchCardinalId = function() {
	this.request({
		url: 'https://centinelapi.cardinalcommerce.com/V1/Order/JWT/Init',
		method: 'POST',
		jar: this.cookieJar,
		headers: {
			'accept': '*/*',
			'accept-encoding': 'gzip, deflate',
			'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
			'content-type': 'application/json;charset=UTF-8',
			'sec-fetch-mode': 'cors',
			'x-cardinal-tid': 'Tid-78b080c4-c600-430f-afa2-d9ad5f20a006',
			'user-agent': this.userAgent,
			'origin': `https://${this.baseUrl}`,
			'sec-fetch-site': 'cross-site',
			'referer': `https://${this.baseUrl}/mobile`
		}
		
	})
}

exports.submit = function () {
	return new Promise((resolve, reject) => {
		this.request({
			url: 'https://www.supremenewyork.com/checkout.json',
			method: 'POST',
			proxy: utilities.formatProxy(this.taskData.additional.proxy),
			json: true,
			jar: this.cookieJar,
			followAllRedirects: true,
			headers: {
				'accept': 'application/json',
				'accept-encoding': 'gzip, deflate',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'origin': 'https://www.supremenewyork.com',
				'referer': 'https://www.supremenewyork.com/mobile',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'user-agent': this.userAgent,
				'x-requested-with': 'XMLHttpRequest'
			},
			form: builder.checkoutFormMobile.bind(this)()
		}, (error, response, body) => {
			if (error) {

			}
			else if (response.statusCode === 200) {
				let err = new Error();
				try {
					switch (body.status) {
						case 'cardinal_queued':
						case 'queued':
							this.slug = body.slug;
							return resolve();

						case 'failed':
							this.orderNumber = body.id;
							if (body.errors && body.errors.credit_card) {
								err.code = 'INVALID INFO';
							} else if (body.errors && body.errors.order && body.errors.order.terms) {
								err.code = 'TOS';
							} else {
								err.code = 'DECLINED';
							}
							return reject(err);
						case 'outOfStock':
							err.code = 'OOS';
							return reject(err);

						case 'dup':
							err.code = 'DUPLICATE';
							return reject(err);

						case 'canada':
							err.code = 'CANADA'
							return reject(err);

						case 'blocked_country':
							err.code = 'BLOCKED COUNTRY'
							return reject(err);

						case 'paid':
							this.orderNumber = body.id;
							err.code = 'PAID';
							return reject(err);
					}
				}
				catch(err) {}
			}
			else {
				let err = new Error();
				switch (response.statusCode) {
					case 302:
					case 303:
						err.code = 'EMPTY CART';
						return reject(err);
					case 429:
						err.code = 'BANNED';
						return reject(err);
				}

			}
		})
	})
}