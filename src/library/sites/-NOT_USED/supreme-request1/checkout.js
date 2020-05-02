const builder = require('./builder');
const cheerio = require('cheerio');
const { utilities } = require('../../other');

exports.getForm = function () {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.baseUrl}/mobile`,
			method: 'GET',
			headers: {
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
				'accept-language': 'en-us',
				'accept-encoding': 'br, gzip, deflate',
				'user-agent': this.userAgent
			}
		}, (error, response, body) => {
			if (error) {
				reject(error);
			}
			else if (response.statusCode !== 200) {
				switch (response.statusCode) {

				}
			}
			else {
				let formElements = [];
				let $ = cheerio.load(body);
				let checkoutWrapper = $("#checkoutViewTemplate").html();
				$ = cheerio.load(checkoutWrapper);
				let checkoutForm = $('form[action="https://www.supremenewyork.com/checkout.json"]').html();
				$ = cheerio.load(checkoutForm);
				$(':input').each(function () {
					let name;
					let placeholder;
					let value;
					let id;
					if ($(this).attr('name') /*&& !$(this).attr('style')*/) { //country selector has style (width: 100%)
						name = $(this).attr('name');
						let tagName = $(this).prop('tagName')
						if (tagName === 'INPUT' && $(this).val()) value = $(this).val();
						if ($(this).attr('placeholder')) placeholder = $(this).attr('placeholder');
						else if ($(this).attr('id')) id = $(this).attr('id');
						let formElement = {
							name: name
						}
						if (placeholder) formElement.placeholder = placeholder;
						if (value) formElement.value = value;
						if (id) formElement.id = id;
						formElements.push(formElement);	
					}

				})
				this.formElements = formElements;
				resolve();
			}
		})
	})
}

exports.submit = function () {
	return new Promise((resolve, reject) => {
		if (this.shouldStop == true) {
			let error = new Error();
			error.code = 'STOP';
			reject(error);
			return;
		}
		console.log(builder.bind(this)(`parsed-checkout`))
		this.request({
			url: `https://${this.baseUrl}/checkout.json`,
			method: 'POST',
			proxy: utilities.formatProxy(this.taskData.additional.proxy),
			json: true,
			jar: this.cookieJar,
			followAllRedirects: true,
			headers: {
				'accept': 'application/json',
				'accept-encoding': 'gzip, deflate',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'origin': `https://${this.baseUrl}`,
				'referer': `https://${this.baseUrl}/mobile`,
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'user-agent': this.userAgent,
				'x-requested-with': 'XMLHttpRequest'
			},
			form: builder.bind(this)(`parsed-checkout`)
		}, (error, response, body) => {
			if (error) {
				reject(error);
			}
			else if (response.statusCode !== 200) {
				let err = new Error();
				switch (response.statusCode) {
					case 302:
					case 303:
						err.code = 'EMPTY CART';
						return reject(err);
					case 429:
						err.code = 'BANNED';
						return reject(err);
					case 500:
						this.setStatus('Invalid Form. Using Form Parser.', 'ERROR');
					default:
						console.log(response.statusCode)
				}
			}
			else {
				this.checkoutData = body;
				resolve();
			}
		})
	})
}

exports.getStatus = function () {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.baseUrl}/checkout/${this.slug}/status.json`,
			method: 'GET',
			jar: this.cookieJar,
			json: true,
			headers: {
				"accept": "application/json",
				"accept-encoding": "gzip, deflate",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
				"referer": `https://${this.baseUrl}/mobile`,
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"user-agent": this.userAgent,
				"x-requested-with": "XMLHttpRequest"
			}
		}, (error, response, body) => {
			if (error) {
				reject(error);
			}
			else if (response.statusCode !== 200) {

			}
			else {
				resolve(body);
			}
		})
	})
}

// exports.fetchCardinalJWT = function() {
// 	return new Promise((resolve, reject) => {
// 		if (this.shouldStop == true) {
// 			let error = new Error();
// 			error.code = 'STOP';
// 			reject(error);
// 			return;
// 		}
// 		this.request({
// 			url: `https://${this.baseUrl}/checkout/totals_mobile.js`,
// 			method: 'GET',
// 			jar: this.cookieJar,
// 			headers: {
// 				'accept': 'text/html',
// 				'x-requested-with': 'XMLHttpRequest',
// 				'user-agent': this.userAgent,
// 				'sec-fetch-mode': 'cors',
// 				'sec-fetch-site': 'same-origin',
// 				'referer': `https://${this.baseUrl}/mobile`,
// 				'accept-encoding': 'gzip, deflate',
// 				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
// 				'if-none-match': 'W/"498ecdb7b3c7acb17f7514f66bbb5b9d"'
// 			},
// 			qs: builder.bind(this)('totals-mobile')
// 		}, (error, response, body) => {
// 			if (error) {

// 			}
// 			else if (response.statusCode !== 200) {

// 			}
// 			else {
// 				let $ = cheerio.load(body);
// 				let jwt_value = $('#jwt_cardinal').val()
// 				let subtotal = $('#subtotal').text();
// 				let shipping = $('#shipping').text();
// 				let salesTaxTotal = $('#sales-tax-total').text();
// 				let vatDiscountTotal = $('#vat-discount-total').text();
// 				let total = $('#total').text();
// 			}
// 		})
// 	})
// }

// exports.fetchCardinalId = function() {
// 	return new Promise((resolve, reject) => {
// 		if (this.shouldStop == true) {
// 			let error = new Error();
// 			error.code = 'STOP';
// 			reject(error);
// 			return;
// 		}
// 		this.request({
// 			url: 'https://centinelapi.cardinalcommerce.com/V1/Order/JWT/Init',
// 			method: 'POST',
// 			jar: this.cookieJar,
// 			headers: {
// 				'accept': '*/*',
// 				'accept-encoding': 'gzip, deflate',
// 				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
// 				'content-type': 'application/json;charset=UTF-8',
// 				'sec-fetch-mode': 'cors',
// 				'x-cardinal-tid': 'Tid-78b080c4-c600-430f-afa2-d9ad5f20a006',
// 				'user-agent': this.userAgent,
// 				'origin': `https://${this.baseUrl}`,
// 				'sec-fetch-site': 'cross-site',
// 				'referer': `https://${this.baseUrl}/mobile`
// 			},
// 			form: builder.bind(this)('cardinal-init')

// 		})
// 	})
// }



// exports.submitCardinal = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: `https://${this.baseUrl}/checkout/${this.slug}/cardinal.json`,
// 			method: 'POST',
// 			jar: this.cookieJar,
// 			headers: {
// 				"accept": "application/json",
// 				"accept-encoding": "gzip, deflate",
// 				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
// 				"referer": `https://${this.baseUrl}/mobile`,
// 				"sec-fetch-mode": "cors",
// 				"sec-fetch-site": "same-origin",
// 				"user-agent": this.userAgent,
// 				"x-requested-with": "XMLHttpRequest"
// 			},
// 			form: builder.bind(this)('checkout-eu')
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {

// 			}
// 			else {
// 				resolve(body)
// 			}
// 		})
// 	})
// }