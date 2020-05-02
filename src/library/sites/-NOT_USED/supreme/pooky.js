const request = require('request');
const { utilities, cookies } = require('../../other');
exports.setPooky1 = function () {
	return new Promise((resolve, reject) => {
		request({
			url: 'http://pooky-bored-dev.appspot.com/' + this.region.toLowerCase(),
			proxy: utilities.formatProxy(this.taskData.additional.proxyOptions.proxy),
			followAllRedirects: true,
			json: true,
			headers: {
				'Accept': 'application/json',
				'x-api-key': 'c30ae9d4-1a84-40ce-a178-94a643ad0326',
				'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B150'
			}
		}, (error, response, body) => {
			if (!error) {
				if (response.statusCode === 400) {
					this.setStatus('Error Handling Pooky. Attempt #2', 'WARNING');
					reject('API2');
				}
				try {
					for (let i = 0; i < Object.keys(body).length; i++) {
						if (Object.keys(body).includes('pooky')) {
							cookies.set.bind(this)('http://www.supremenewyork.com', Object.keys(body)[i], body[Object.keys(body)[i]]);
						}
					}
				} catch (err) {
				}
				this.setStatus('Handled Pooky.', 'WARNING');
				console.log(this.cookieJar)
				resolve();
			}
			else {
				console.log(error)
			}
		})
	});
};

exports.setPooky2 = function () {
	return new Promise((resolve, reject) => {
		request({
			url: 'https://pooky.destroyerbots.com/api/v3/generate',
			followAllRedirects: true,
			timeout: 15000,
			json: true,
			headers: {
				'Accept': 'application/json',
				'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B150'
			},
			qs: {
				'locale': this.region.toLowerCase(),
				'clientId': 'e16f838e-73d3-4d21-b6ca-ede9a6833008',
				'mode': 'mobile'
			}
		}, (error, response, body) => {
			if (!error) {
				if (response.statusCode === 400) {
					this.setStatus('Error Handling Pooky. Continuing.', 'WARNING');
					resolve();
				}
				try {
					for (let i = 0; i < Object.keys(body).length; i++) {
						if (Object.keys(body).includes('pooky')) {
							cookies.set.bind(this)('http://www.supremenewyork.com', Object.keys(body)[i], body[Object.keys(body)[i]]);
						}
					}
				} catch (err) {
				}
				this.setStatus('Handled Pooky.', 'WARNING');
				console.log(this.cookieJar)
				resolve();
			}
			else {
				console.log(error)
			}
		})
	})
}

