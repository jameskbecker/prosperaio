const cheerio = require('cheerio');

exports.getToken = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: this.baseUrl,
			method: 'GET',
			headers: {
				'connection': 'keep-alive',
				'useragent': ''
			}
		}, (error, response, body) => {
			if (!error) {
				switch(response.statusCode) {
					case 200:
						const $ = cheerio.load(body);
						let token;
						token = $('meta[name="shopify-checkout-api-token"]').attr('content');
						if (!token) {
							let features = $('#shopify-features').html();
							if (features) {
								token = JSON.parse(features).accessToken;
							}
							else {
								
							}
						}
						if (token) {
							this.apiToken = token;
							resolve();
						}
						else {
							this.setStatus('UNABLE TO FETCH ACCESS TOKEN.', 'WARNING');
						}
						break;
					case 429:
						this.setStatus('BANNED. RETRYING.', 'ERROR');
						break;
					default:
				}
			}
			else {

			}
		})
	})
}	