//NOTE: CHANGE COUNTRY TO IN LINK

exports.addItem = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `${this.taskData.siteData.baseUrl}/en/DE/orders/populate.json`,
			method: 'POST',
			headers: {
				'accept': 'application/json, text/javascript, */*; q=0.01',
				'accept-encoding': 'gzip',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'content-type': 'application/json; charset=UTF-8',
				'origin': `${this.taskData.siteData.baseUrl}`,
				'referer': `${this.searchInput}`,
				'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
				'x-newrelic-id': 'UwAFU1RXGwYGXFZRAQE=',
				'x-requested-with': 'XMLHttpRequest'
			},
			jar: true,
			json: true,
			body: {
				'quantity': '',
				'variant_id': ''
			}
		}, (error, response, body) => {
			if(!error && response.body === 200) {
				const cartData = JSON.parse(response.body).line_item;
				this.orderId = cartData.order_id;
				resolve();
			}
			
		})
	})
}
