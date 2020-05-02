const builder = require('../builder');

exports.updateCart(checkoutToken, variantId, qty = 1) = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://${this.baseUrl}/wallets/checkouts/${checkoutToken}.json`,
			method: 'PATCH',
			jar: this.cookieJar,
			headers: {
				'X-Shopify-Storefront-Access-Token': this.apiToken,
				'Host': this.baseUrl,
				'Content-Type': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
			},
			json: true,
			body: builder.apiCart.bind(this)()
		}, (error, response, body) => {
			if (!error) {
				switch(response.statusCode) {
						case 200:
						case 201:
						case 202:
							this.setStatus('CARTED ITEM', 'WARNING');
							//blablabla
						break;
						default:
							this.setStatus('ERROR CARTING ITEM. RETRYING.', 'ERROR');
							setTimeout(exports.addItem.bind(this), this.taskData.errorDelay);
				}
			}
			else {

			}
		})
	})
}