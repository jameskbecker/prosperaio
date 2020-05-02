exports.preload = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.taskData.site.baseUrl}/checkout/poll`,
			method: 'POST',
			jar: this.cookieJar,
			headers: {
				'Accept': 'application/json',
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'en-US,en;q=0.8',
				'Connection': 'close',
				'Referer': this.baseURL + '/api/checkouts.json',
				'X-Shopify-Customer-Access-Token': this.customerId ? this.customerId : null,
				'X-Shopify-Checkout-Version': '2016-09-06',
				'X-Shopify-Storefront-Access-Token': this.apiToken,
				'User-Agent': this.userAgent
			},
			followRedirect: true,
			qs: {
				'_ctd': this.queueToken,
				'_ctd_update': ''
			}
		}, (error, response, body) => {
			if (error) {
				let err = new Error();
				err.code = 'CONNECTION';
				reject(err);
			}
			else {
				console.log(body)
				switch (response.statusCode) {
					case 201:
						this.hasBypassedQueue = true;
						let body2;
						let checkoutToken;
						let checkoutUrl;
						let specialKey;
						try {
							body2 = JSON.parse(body);
							checkoutToken = body.checkout.token;
							checkoutUrl = body.checkout.web_url.split('?')[0];
							specialKey = body.checkout.web_url.split(`key=`)[1];
							if (specialKey.endsWith('/')) specialKey = specialKey.substring(0, specialKey.length - 1);
						} catch(err) {}
						if (!checkoutToken || !checkoutUrl || !specialKey) {
							let err = new Error();
							err.code = 'QUEUE NO CHECKOUT';
							reject(err);
						}
						this.checkoutToken = checkoutToken;
						this.checkoutKey = specialKey;
						this.checkoutUrl = checkoutUrl;
						resolve();
						break;
					case 202:
						let queueUrl;
						console.log('QUEUE.js 202')
						try {
							queueUrl = response.headers.location;
							if (!queueUrl.startsWith(`http`)) {
								queueUrl = '' + this.taskData.site.baseUrl + queueUrl;
							}
							if (queueUrl) this.queueUrl = queueUrl;
						} catch(err) {

						}
						reject();
						break;
					default: () => {
						let err = new Error();
						err.code = 'POLL';
						reject(err);
					}
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