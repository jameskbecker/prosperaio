exports.getPoll = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `https://www.supremenewyork.com/checkout/${this.slug}/status.json`,
			method: 'GET',
			jar: this.cookieJar,
			json: true,
			headers: {
				"accept": "application/json",
				"accept-encoding": "gzip, deflate",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
				"referer": "https://www.supremenewyork.com/mobile",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"user-agent": this.userAgent,
				"x-requested-with": "XMLHttpRequest"
			}
		}, (error, response, body) => {
			if (error) reject(error);
			else if (response.statusCode === 200) {
				let err = new Error();
				switch (body.status) {
					case 'paid':
						this.orderNumber = body.id;
						return resolve();
					case 'cardinal_queued':
						err.code = 'QUEUED';
						return reject(err);
					case 'queued':
						err.code = 'QUEUED';
						return reject(err);
					case 'failed':
						this.orderNumber = body.id;
						err.code = 'DECLINED';
						return reject(err);
					case 'outOfStock':
						err.code = 'OOS';
						return reject(err);
					case 'dup':
						err.code = 'DUPLICATE';
						return reject(err);
					case 'canada':
						err.code = 'CANADA'
						return reject(err);
					case 'blocked_country':
						err.code = 'BLOCKED COUNTRY'
						return reject(err);
					default:
						this.orderNumber = body.id ? body.id : 'N/A';
						err.code = 'EMAIL';
						reject(err);
				}
			}
			else {
				let err = new Error();	
				switch (response.statusCode) {
					case 429:
						err.code = 'BANNED';
						return reject(err);
					default: 
				}
			}
		})
	})
}