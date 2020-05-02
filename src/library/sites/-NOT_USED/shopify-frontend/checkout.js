const formBuilder = require('./form-builder');
const cheerio = require('cheerio');
exports.create = function() {
	return new Promise((resolve, reject) => {
		let options = {
			variantId: this.productData.variantId
		}
		if (this.note) {options.note = this.note};
		console.log(options)
		this.request({
			url: `https://${this.baseUrl}/cart`,
			method: 'POST',
			jar: this.cookies,
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"accept-encoding": "gzip, deflate",
				"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
				"cache-control": "max-age=0",
				"content-type":	"application/x-www-form-urlencoded",
				"origin":	`https://${this.baseUrl}`,
				"referer": `https://${this.baseUrl}/cart`,
				"upgrade-insecure-requests": "1",
				"user-agent": this.userAgent		
			},
			form: formBuilder('create-checkout', options)
		}, (error, response, body) => {
			if (error) {
				reject(error);
			}
			else if (response.statusCode !== 302) {
				switch(response.statusCode) {
					default: console.log(response.statusCode);
				}
			}
			else {
				this.checkoutUrl = response.headers.location;
				console.log(this.checkoutUrl);
				resolve();
			}
		})
	})
}

exports.update = function(type, options) {
	return new Promise((resolve, reject) => {
		this.request({
			url: this.checkoutUrl,
			method: 'POST',
			jar: this.cookies,
			headers: {
				"accept":	"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"accept-encoding":	"gzip, deflate",
				"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
				"cache-control":	"max-age=0",
				"content-type":	"application/x-www-form-urlencoded",
				"origin":	`https://${this.baseUrl}`,
				//"referer": `${this.checkoutUrl}?previous_step=shipping_method&step=payment_method`,
				"upgrade-insecure-requests":	"1",
				"user-agent":	this.userAgent,
			},
			form: formBuilder(type, options)
		}, (error, response, body) => {
			if (error) {
				reject(error)
			}
			else if (response.statusCode !== 302) {
				switch (response.statusCode) {
					default: console.log(statusCode)
				}
				reject();
			}
			else resolve();	
		})
	})
};

exports.getAuthenticityToken = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: this.checkoutUrl,
			method: 'GET',
			jar: this.cookies,
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"accept-encoding": "gzip, deflate",
				"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
				"cache-control": "max-age=0",
				"referer": `${this.cart}`,
				"upgrade-insecure-requests": "1",
				"user-agent": this.userAgent
			}
		}, (error, response, body) => {
			if (error) {
				reject(error);
			}
			else if (response.statusCode !== 200) {
				switch(response.statusCode) {
				
				}
			}
			else {
				const $ = cheerio.load(body);
				let authenticityToken = $('input[name="authenticity_token"]').val();
				let key = $('meta[name="shopify-checkout-authorization-token"]').attr('content');
				if (!authenticityToken) {

				}
				else {
					this.authToken = authenticityToken;
					this.checkoutKey = key;
					console.log(this.authToken, this.checkoutKey);
					resolve();
				}
			}
		})
	})
}