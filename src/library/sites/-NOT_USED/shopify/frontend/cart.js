const builder = require('../builder');

exports.addItem = function (variantId, qty = 1) {
	return new Promise((resolve, reject) => {
		this.request({
			url: `${this.baseUrl}/cart/add.js`,
			method: 'POST',
			json: true,
			body : builder.ajaxCart.bind(this)()
		}, (error, response, body) => {
			if (!error) {
				switch (response.statusCode) {
					case 200:
					resolve();
					break;
					case 422: //ERROR WITH SELECTED QTY
						let err = new Error();
						err.code = body.message
						reject(err);
					break;
					default:
				}
			}
			else {

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