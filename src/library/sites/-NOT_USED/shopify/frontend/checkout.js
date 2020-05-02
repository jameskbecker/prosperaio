exports.createCheckout() = function() {
	return new Promise() = function() {
		this.request({
			url: `${this.baseUrl}/cart/checkout.js`,
			method: 'GET',
			followRedirects: false,
			headers: {

			}
		}, (error, response, body) => {
			if (!error && response) {
				switch (response.statuscode) {
					case 303:
						this.checkoutUrl = response.headers.location;
						resolve();
					break;
				}
			}
			else {

			}
		})
	}
}

exports.sendBilling = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: '	',
			method: p
		}, (error, response, body) => {
			
		})
	})
}

exports.sendShipping() = function() {
	return new Promise((resolve, reject) => {
		this.request({

		}, (error, response, body) => {
			
		})
	})
}

exports.sendPayment() = function() {
	return new Promise((resolve, reject) => {
		this.request({

		}, (error, response, body) => {
			
		})
	})
}
