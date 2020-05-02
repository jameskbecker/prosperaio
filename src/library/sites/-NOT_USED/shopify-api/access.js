const cheerio = require('cheerio');

exports.fetch = function () {
	return new Promise((resolve, reject) => {
		console.log(`https://${this.taskData.site.baseUrl}`)
		this.request({
			url: `https://${this.taskData.site.baseUrl}`,
			method: 'GET',
			followAllRedirects: false,
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"accept-encoding": "gzip, deflate",
				"accept-language": "en-GB,en",
				"upgrade-insecure-requests": "1",
				"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.80 Safari/537.36"
			}
		}, (error, response, body) => {
			if (error) {
				let err = new Error();
				err.code = 'CONNECTION';
				reject(err);
			}
			else {
				let err;
				console.log(response.request);
				console.log(response.statusCode)
				switch (response.statusCode) {
					case 200:
						if (body.indexOf('password') !== -1) {
							err = new Error();
							err.code = 'PASSWORD';
							reject(err);
						}
						else {
							const $ = cheerio.load(body);
							let token;
							token = $('meta[name="shopify-checkout-api-token"]').attr('content');
							if (token) {
								this.apiToken = token;
								resolve();
							}
							else {
								let features = $('#shopify-features').html();
								if (features) {
									token = JSON.parse(features).accessToken;
									this.apiToken = token;
									resolve();
								}
								else {
									err = new Error();
									err.code = 'UNABLE TO FETCH';
									reject(err);
								}
							}
						}
						
						break;
					case 403:
						err = new Error();
						err.code = 'ACCESS DENIED';
						reject(err);
						break;	
					case 429:
						new Error();
						err.code = 'BANNED';
						reject(err);
						break;
					default:
						
							new Error();
							err.code = 'UNEXPECTED';
							reject(err);
				}
			}
		})
	})
}	