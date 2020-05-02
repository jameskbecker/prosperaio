const builder = require('./builder');
const { utilities, logger } = require('../../other');

function add() {
	return new Promise((resolve, reject) => {
		if (this.shouldStop) {
			let error = new Error();
			error.code = 'STOP';
			reject(error);
			return;
		}
		this.request({
			url: this.baseUrl + '/shop/' + this.productId + '/add.json',
			method: 'POST',
			//proxy: utilities.formatProxy(this.taskData.additional.proxy),
			json: true,
			jar: this.cookieJar,
			headers: {
				'accept':	'application/json',
				'accept-encoding':	'gzip, deflate, br',
				'accept-language':	'en-GB,en-US;q=0.9,en;q=0.8',
				'content-type':	'application/x-www-form-urlencoded',
				'origin':	this.baseUrl,
				'referer':	this.baseUrl + '/mobile',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'user-agent':	this.userAgent,
				'x-requested-with':	'XMLHttpRequest'
			},
			form: builder.bind(this)('cart')
		}, (error, response, body) => {
			if(error) {
				reject(error);
			}
			else if (response.statusCode !== 200) {
				error = new Error();
				switch(response.statusCode) {
					case 429:		
						error.code = 'BANNED';
					default:
						error.code = 'UNEXPECTED';
				}
				reject(error);
			}
			else {
				logger.info(`Cart Response:\n${JSON.stringify(body)}`);
				if (body.length > 0 && body[0].in_stock === true) {
					let responseCookies = response.headers['set-cookie'];
					let pureCart;
					for (let i = 0; i < responseCookies.length; i++) {
						if (responseCookies[i].includes('pure_cart')) {
							pureCart = responseCookies[i].split(';')[0].split('=')[1];
							break;
						}
					}
					if (pureCart) this.cookieSub = pureCart;
					resolve();
				}
				else {
					let err = new Error();
					err.code = 'OOS';
					reject(err);
				}
			}
		})
	})
}

function remove() {
	return new Promise((resolve, reject) => {
		if (this.shouldStop == true) {
			let error = new Error();
			error.code = 'STOP';
			reject(error);
			return;
		}
		this.request({
			url: this.baseUrl + '/shop/' + this.productId + '/remove.json',
			method: 'POST',
			proxy: utilities.formatProxy(this.taskData.additional.proxy),
			json: true,
			jar: this.cookieJar,
			headers: {
				'accept':	'application/json',
				'accept-encoding':	'gzip, deflate, br',
				'accept-language':	'en-GB,en-US;q=0.9,en;q=0.8',
				'content-type':	'application/x-www-form-urlencoded',
				'origin':	this.baseUrl,
				'referer':	this.baseUrl + '/mobile',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'user-agent':	this.userAgent,
				'x-requested-with':	'XMLHttpRequest'
			},
			form: {
				size: '' + this.productData.sizeId,
			}
		}, (error, response, body) => {})
	})
}

function check() {
	return new Promise((resolve) => {
		if (this.shouldStop == true) {
			let error = new Error();
			error.code = 'STOP';
			reject(error);
			return;
		}
		this.request({
			url: this.baseUrl + '/shop/cart.json',
			method: 'GET',
			//proxy: utilities.formatProxy(this.taskData.additional.proxy),
			json: true,
			jar: this.cookieJar,
			headers: {
				'accept':	'application/json',
				'accept-encoding':	'gzip, deflate, br',
				'accept-language':	'en-GB,en-US;q=0.9,en;q=0.8',
				'content-type':	'application/x-www-form-urlencoded',
				'origin':	this.baseUrl,
				'referer':	this.baseUrl + '/mobile',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'user-agent':	this.userAgent,
				'x-requested-with':	'XMLHttpRequest'
			},
			form: builder.cartForm(this.productData.sizeId, this.productData.styleId, parseInt(this.products[0].productQty))
		}, (error, response, body) => {
			
			resolve();
		})
	})
}

module.exports = { add }