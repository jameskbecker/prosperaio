const builder = require('./builder');
const { utilities } = require('../../other');

exports.add = function() {	////ADD RESPONSE CODE HANDLING
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://www.supremenewyork.com/shop/${this.productData.productId}/add.json`,
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
			form: builder.cart.bind(this)()
		}, (error, response, body) => {
			if(error) {
				let err = new Error();
				err.code = 'Connection Error';
				reject(err);
			}
			else if (response.statusCode === 200) {
				if (body.length > 0 && body[0].in_stock === true) {
					let responseCookies = response.headers['set-cookie'];
					let pureCart = responseCookies[2].split(';')[0].split('=')[1];
					this.cookieSub = pureCart;
					resolve();
				}
				else {
					let err = new Error();
					err.code = 'OOS';
					reject(err);
				}
			}
			else {
				switch(response.statusCode) {
					case 429:
						err.code = 'BANNED';
						return reject(err);
					default:
				}
			}
		})
	})
}

exports.remove = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://www.supremenewyork.com/shop/${this.productData.productId}/remove.json`,
			method: 'POST',
			// proxy: utilities.formatProxy(this.taskData.additional.proxy),
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
		this.request({
			url: `https://www.supremenewyork.com/shop/cart.json`,
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