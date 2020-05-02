exports.getPoll = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://www.${this.baseUrl}/checkout/${this.slug}/status.json`,
			method: 'GET',
			jar: this.cookieJar,
			json: true,
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"accept-encoding": "gzip, deflate",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
				"if-none-match": 'W/"f0a1c1a0cfb52787bdf8195cd46d1ef9',
				"upgrade-insecure-requests": 1,
				"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) CriOS/63.0.3239.73 Mobile/15B202 Safari/604.1"
			}
		}, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				let err;
				console.log(body)
				switch (body.status) {	
					case 'queued':
						err = new Error;
						err.code = 'QUEUED';
						reject(err);
						break;

					case 'outOfStock':
						err = new Error();
						err.code = 'OOS';
						reject(err);
						break;
					case 'failed':
						if (body.errors) {
							let err;
							if (body.errors['credit_card'].number[0] === 'is not a valid credit card number') {
								err = new Error;
								err.code = 'INVALID PAYMENT';
								reject(err);
							}
							
						}
						if (body.mpa) {
							if (body.mpa[0]['Sold Out?'] === false && body.mpa[0]['Success?'] === false) {
								err = new Error;
								err.code = 'CARD DECLINE';
								reject(err);
							}

							if (body.mpa[0]['Sold Out?'] === true && body.mpa[0]['Success?'] === false) {
								err = new Error();
								err.code = 'OOS';
								reject(err);
							}
							break;
							
						}
						err = new Error;
							err.code = 'PAYMENT ERROR';
							reject(err);
							break;
					default:
						console.log(body.status)
						resolve();
				}
			}
			else {

			}
		})
	})
}