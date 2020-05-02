const buildForm = require('./form-builder');
const cheerio = require('cheerio');	

function reserveBasketItems() {
	let options = {
		url: `${this.baseUrl}/${this.region}/checkout/reserveBasketItemsAjax/timestamp/${Date.now()}`,
		method: 'GET',
		jar: this.cookieJar,
		json: true,
		headers: {
			"accept": "application/json, text/javascript, */*; q=0.01",
			"sec-fetch-dest": "empty",
			"x-requested-with": "XMLHttpRequest",
			"user-agent": this.userAgent,
			"sec-fetch-site": "same-origin",
			"sec-fetch-mode": "cors",
			"referer": "https://www.kickz.com/de/cart",
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7"
		}
	}
	console.log(options)
	return this.request(options);

	// return new Promise((resolve, reject) => {
	// 	this.request({
	// 		url: `https://${this.baseUrl}/${this.region}/checkout/reserveBasketItemsAjax/timestamp/${Date.now()}`,
	// 		method: 'GET',
	// 		jar: this.cookies,
	// 		headers: {
	// 			'Accept': 'application/json, text/javascript, */*; q=0.01',
	// 			'Accept-Encoding': 'gzip, deflate',
	// 			'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
	// 			'Connection': 'keep-alive',
	// 			'Host': this.baseUrl,
	// 			'Referer': `https://${this.baseUrl}/${this.region}/cart`,
	// 			'User-Agent': this.userAgent,
	// 			'X-Requested-With': 'XMLHttpRequest'
	// 		}
	// 	}, (error, response, body) => {
	// 		if (error) {
	// 			reject(error);
	// 		}
	// 		else if (response.statusCode !== 200) {
	// 			switch (response.statusCode) {
	// 				default:
	// 					error = new Error();
	// 					error.code = 'UNEXPECTED';
	// 					reject(error);
	// 			}
	// 		}
	// 		else {
	// 			body = JSON.parse(body)
	// 			if (body.hasOwnProperty('state') && body.state == 'RESERVED') {
	// 				resolve();
	// 			}
	// 			else if (body.hasOwnProperty('state') && body.state == 'REQUESTED') {
	// 				error = new Error();
	// 				error.code = 'REQUESTED';
	// 				reject(error);
	// 			}
	// 			else {
	// 				console.log(body)
	// 				error = new Error();
	// 				error.code = 'UNEXPECTED';
	// 				reject(error);
	// 			}
	// 		}
	// 	})
	// })
}

function loginOffer() {
	let options = {
		url: `${this.baseUrl}/${this.region}/checkout/login_offer`,
		method: 'GET',
		jar: this.cookies,
		headers: {
			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
			'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
			'Host': this.baseUrl,
			'Connection': 'keep-alive',
			'Referer': `https://${this.baseUrl}/de/cart`,
			'Upgrade-Insecure-Requests': '1',
			'User-Agent': this.userAgent
		}
	}
	return this.request(options);
	// return new Promise((resolve, reject) => {
	// 	this.request({
	// 		url: `https://${this.baseUrl}/de/checkout/login_offer`,
	// 		method: 'GET',
	// 		jar: this.cookies,
	// 		headers: {
	// 			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
	// 			'Accept-Encoding': 'gzip, deflate',
	// 			'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
	// 			'Host': this.baseUrl,
	// 			'Connection': 'keep-alive',
	// 			'Referer': `https://${this.baseUrl}/de/cart`,
	// 			'Upgrade-Insecure-Requests': '1',
	// 			'User-Agent': this.userAgent
	// 		}
	// 	}, (error, response, body) => {
	// 		if (error) {
	// 			reject(error);
	// 		}
	// 		else if (response.statusCode != 200) {

	// 		}
	// 		else {
	// 			console.log('Got Login Offer')
	// 			resolve();
	// 		}
	// 	})
	// })
}

function addressHint() {
	let options = {
		url: `${this.baseUrl}/${this.region}/checkout/addresses/method/addressHint`,
		method: 'POST',
		jar: this.cookieJar,
		json: true,
		headers: {
			"accept": "application/json, text/plain, */*",
			"sec-fetch-dest": "empty",
			"user-agent": this.userAgent,
			"content-type": "application/x-www-form-urlencoded",
			"origin": this.baseUrl,
			"sec-fetch-site": "same-origin",
			"sec-fetch-mode": "cors",
			"referer": `${this.baseUrl}/${this.region}/checkout/addresses`,
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
		},
		form: buildForm.bind(this)('address')
	}
	return this.request(options);
}

function paymentSummarySubmit() {
	let options = {
		url: `${this.baseUrl}/${this.region}/checkout/paymentSummarySubmit`,
		method: 'POST',
		jar: this.cookies,
		json: true,
		headers: {
			"accept": "application/json, text/plain, */*",
			"sec-fetch-dest": "empty",
			"user-agent": this.userAgent,
			"content-type": "application/x-www-form-urlencoded",
			"origin": this.baseUrl,
			"sec-fetch-site": "same-origin",
			"sec-fetch-mode": "cors",
			"referer": `${this.baseUrl}/${this.region}/checkout/paymentSummary`,
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
		},
		form: buildForm.bind(this)('submit-order')
	}
	return this.request(options);
}

function paymentMethodSubmit() {
	let options = {
		url: `${this.baseUrl}/${this.region}/checkout/${this.paymentEndpoint}`,
		method: 'POST',
		jar: this.cookies,
		json: true,
		headers: {
			"accept": "application/json, text/plain, */*",
			"sec-fetch-dest": "empty",
			"user-agent": this.userAgent,
			"content-type": "application/x-www-form-urlencoded",
			"origin": this.baseUrl,
			"sec-fetch-site": "same-origin",
			"sec-fetch-mode": "cors",
			"referer": `${this.baseUrl}/${this.region}/checkout/paymentSummary`,
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8"
		},
		form: buildForm.bind(this)('submit-payment')
	}
	return this.request(options);
}

function getConfirmation() {
	return new Promise((resolve, reject) => {
		this.request({
			url: this.payloadUrl,
			method: 'GET',
			jar: this.cookies,
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
				'Cache-Control': 'max-age=0',
				'Connection': 'keep-alive',
				'Host': this.baseUrl,
				'Upgrade-Insecure-Requests': '1',
				'User-Agent': this.userAgent
			}
		}, (error, response, body) => {
			if (error) {
				reject(error);
			}
			else if (response.statusCode !== 200) {
				switch (response.statusCode) {
					default:
						error = new Error();
						error.code = 'UNEXPECTED';
						reject(error);
				}
			}
			else {
				try {
					const $ = cheerio.load(body);
					let checkoutData = JSON.parse($('script[type="kspa-data"][data-prop="checkout"]').html());
					let orderData = checkoutData.wizard.order;
					let productName = orderData.productName;
					let orderNumber = orderData.orderNumber;

					this.orderNumber = orderNumber;
					resolve();
				}
				catch(err) {	}
			}
		})
	})
}

module.exports = { reserveBasketItems, addressHint, paymentSummarySubmit, paymentMethodSubmit, getConfirmation }