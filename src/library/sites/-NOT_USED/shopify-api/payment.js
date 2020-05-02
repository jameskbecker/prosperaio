const builder = require('./builder');

exports.createSession = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: 'https://elb.deposit.shopifycs.com/sessions',
			method: 'POST',
			jar: this.cookieJar,
			followAllRedirects: true,
			json: true,
			headers: {
				'Accept': 'application/json',
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'en-US;q=0.8',
				'Content-Type': 'application/json',
				'Host': 'elb.deposit.shopifycs.com',
				'Connection': 'keep-alive',
				'Origin': 'https://checkout.shopifycs.com',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s	'
			},
			body: builder.creditCard.bind(this)()
		}, (error, response, body) => {
			if (!error) {
				switch (response.statusCode) {
					case 200:
						if (body.hasOwnProperty('id')) {
							this.sessionId = body.id;
							resolve();
						}
						else {
							let err = new Error();
							err.code = '';
							reject(err);
						}
					default:

				}
			}
			else {
				let err = new Error();
				err.code = 'Request Error';
				reject('err');
			}
		})
	})
}

exports.submitOrder = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `${this.baseUrl}/wallets/checkouts/${this.checkoutToken}/payments.json`,
			method: 'POST',
			jar: this.cookieJar,
			headers: {

			},
			json: true,
			body: {
				'payment': {
					'request-details': {
						'ip_address': '',
						'accept-language': '',
						'user-agent': ''
					},
					'amount': '',
					'session_id': '',
					'unique_token': ''
				}
			}

		}, (error, response, body) => {

		})
	})
}