const builder = require('./builder');
const { utilities } = require('../../other');

exports.add = function() {	////ADD RESPONSE CODE HANDLING
	return new Promise((resolve, reject) => {
		function runStage() {
			if (this.shouldStop) return this.stop();
			this.request({
				url: `https://${this.baseUrl}/shop/${this.productData.productId}/add.json`,
				method: 'POST',
				proxy: utilities.formatProxy(this.taskData.additional.proxy),
				json: true,
				jar: this.cookieJar,
				headers: {
					'accept':	'application/json',
					'accept-encoding': 'br, gzip, deflate',
					'accept-language': 'en-us',
					'origin':	`https://${this.baseUrl}`,
					'referer': `https://${this.baseUrl}/mobile`,
					'user-agent':	this.userAgent,
					'x-requested-with':	'XMLHttpRequest'
				},
				form: builder.bind(this)('cart')
			}, (error, response, body) => {
				if(error) {
					switch (error.code) {
						case 'ETIMEDOUT':
							this.setStatus('Timed Out.', 'ERROR');
							return setTimeout(runStage.bind(this), this.taskData.delays.error);

						default:
							this.setStatus('Unexpected Error.', 'Error');
							return setTimeout(runStage.bind(this), this.taskData.delays.error);
					}
				}
				else if (response.statusCode !== 200) {
					switch(response.statusCode) {
						case 429:
							error = new Error();
							error.code = 'BANNED';
							return reject(error);
						default:
							error = new Error();
							error.code = 'UNEXPECTED';
							return reject(error);
					}
					
				}
				else {
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
		}
		runStage.bind(this)();
	})
}

exports.remove = function() {
	return new Promise((resolve, reject) => {
		if (this.shouldStop == true) {
			let error = new Error();
			error.code = 'STOP';
			reject(error);
			return;
		}
		this.request({
			url: `https://${this.baseUrl}/shop/${this.productData.productId}/remove.json`,
			method: 'POST',
			proxy: utilities.formatProxy(this.taskData.additional.proxy),
			json: true,
			jar: this.cookieJar,
			headers: {
				"accept":	"application/json",
				"accept-encoding":	"gzip, deflate, br",
				"accept-language":	"en-GB,en-US;q=0.9,en;q=0.8",
				"content-type":	"application/x-www-form-urlencoded",
				"origin":	"https://www.supremenewyork.com",
				"referer":	"https://www.supremenewyork.com/mobile",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"user-agent":	this.userAgent,
				"x-requested-with":	"XMLHttpRequest"
			},
			form: {
				size: '' + this.productData.sizeId,
			}
		}, (error, response, body) => {})
	})
}

exports.check = function() {
	return new Promise((resolve) => {
		if (this.shouldStop == true) {
			let error = new Error();
			error.code = 'STOP';
			reject(error);
			return;
		}
		this.request({
			url: `https://${this.baseUrl}/shop/cart.json`,
			method: 'GET',
			proxy: utilities.formatProxy(this.taskData.additional.proxy),
			json: true,
			jar: this.cookieJar,
			headers: {
				"accept":	"application/json",
				"accept-encoding":	"gzip, deflate, br",
				"accept-language":	"en-GB,en-US;q=0.9,en;q=0.8",
				"content-type":	"application/x-www-form-urlencoded",
				"origin":	"https://www.supremenewyork.com",
				"referer":	"https://www.supremenewyork.com/mobile",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"user-agent":	this.userAgent,
				"x-requested-with":	"XMLHttpRequest"
			},
			form: builder.cartForm(this.productData.sizeId, this.productData.styleId, parseInt(this.products[0].productQty))
		}, (error, response, body) => {
			
			resolve();
		})
	})
}