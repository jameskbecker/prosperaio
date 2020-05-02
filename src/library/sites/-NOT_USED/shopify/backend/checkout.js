exports.createCheckout = function() {
	return new Promise((resolve, reject) => {
		let path = ['eflashus', 'eflashsg', 'eflashldn', 'eflashjp', 'kith'].includes(this.site.id) ? '/wallets/checkouts' : '/wallets/checkouts.json';
		this.request({
			url: `https://${this.baseUrl}${path}`,
			method: 'POST',
			jar: this.cookieJar,
			headers: {
				'X-Shopify-Storefront-Access-Token': this.apiToken,
				'Host': this.baseUrl,
				'Content-Type': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
			},
			followRedirect: false,
			json: true,
			body: { }

			}, (error, response, body) => {
			console.log(body)
			if (!error) {
				switch (response.statusCode) {
					case 200:
					case 201:
					case 202:
						this.setStatus('SUCCEFULLY CREATED CHECKOUT', 'WARNING');
						this.checkoutUrl = body['web_url'];
					case 303:
					console.log('Polled Checkout Queue.');
					break;
					case 422:
					console.log('Variant not FOund')
					default:
					console.log('ERROR POLLING CHECKOUT.');
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