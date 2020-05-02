const buildForm = require('./form-builder');
const cheerio = require('cheerio');

exports.add = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `http://${this.baseUrl}/cart/add.js`,
			method: 'POST',
			jar: this.cookies,
			headers: {
				"accept":	"*/*",
				"accept-encoding": "gzip, deflate",
				"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
				"content-type": "application/x-www-form-urlencoded",
				"origin":	`https://${this.baseUrl}`,
				"referer": this.productData.productUrl,
				"user-agent":	this.userAgent,
				"x-requested-with":	"XMLHttpRequest"
			},
			form: buildForm.bind(this)('cart')
		}, (error, response, body) => {
			if (error) {
				console.log(error)
				reject(error);
			}
			else if (response.statusCode !== 200) {
				switch (response.statusCode) {
					default: console.log(response.statusCode)
				}
				console.log(body)
			}
			else {
				resolve();
			}
		})
	})
}

exports.getNote = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.baseUrl}/cart`,
			method: 'GET',
			jar: this.cookies,
			headers: {
				"accept": "text/html, application/xhtml+xml",
				"accept-encoding":	"gzip, deflate",
				"accept-language":	"en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
				"turbolinks-referrer":	this.productData.productUrl,
				"referer": this.productData.productUrl,
				"user-agent": this.userAgent
			}
		}, (error, response, body) => {
			if (error) {
				console.log(error)
				reject(err)
			}
			else if (response.statusCode !== 200) {
				switch (response.statusCode) {
					default: console.log(response.statusCode)
				}
			}
			else {
				const $ = cheerio.load(body);
				let note = $('input#note').val();
				if (!note) {
					console.log('Note Not Found');
					console.log(body)
				}
				else {
					this.note = note;
					console.log(this.note)
					resolve();
				}
			}
		})
	})
}

exports.pollShipping = function () {
	return new Promise((resolve, reject) => {
		this.request({
			url: `${this.baseUrl}/cart/shipping_rates.json`,
			method: 'GET',
			json: true,
			qs: {
				'shipping_address[zip]' : '',
				'shipping_address[country]' : '',
				'shipping_address[province]' : ''
			}
		}, (error, response, body) => {
			
		})
	})
}