const request = require('request');
const builder = require('./builder');
let jar = request.jar()
let options = {
	baseUrl: 'https://www.off---white.com',
	cookieJar: jar,
	userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
}
				initCookie   .bind(options)()
	.then(createSession.bind(options)())
	.then(function() {

		add.bind(options)()
	});

function initCookie() {
	return new Promise((resolve, reject) => {
		request({
			url: this.baseUrl,
			method: 'GET',
			jar: this.cookieJar,
			headers: {
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"Connection": "Keep-Alive",
				"Host": this.baseUrl.replace('https://', ''),
				"User-Agent": this.userAgent

			}
		}, (error, response, body) => {
			if (error) {
				reject(error);
			}
			else {
			
				resolve();
			}
		})
	})
}

function createSession() {
	return new Promise((resolve, reject) => {
	request({
			url: this.baseUrl + '/en-gb/api/users/me',
			method: 'GET',
			jar: this.cookieJar,
			json: true,
			headers: {
				"accept":	"application/json, text/plain, */*",
				"referer":	this.baseUrl,
				"user-agent": this.userAgent,
			}
		}, (error, response, body) => {
			if (error) {
				reject(error);
			}
			else if (response.statusCode !== 200) {
				error = new Error();
				switch (response.statusCode) {
					default:
						error.code = 'UNEXPECTED';
				}
				reject(error);
			}
			else {
				this.bagId = body.bagId;

				//console.log(JSON.stringify(response.headers))

				resolve();
			}
		})
	})
}

function add() {
	return new Promise((resolve, reject) => {
		
		request({
			url: this.baseUrl + '/en-gb/api/bags/' + this.bagId + '/items',
			method: 'POST',
			jar: this.cookieJar,
			json: true,
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json;charset=UTF-8",
				"Referer": this.baseUrl,
				"origin": this.baseUrl,
				"User-Agent": this.userAgent,
				"x-newrelic-id": "VQUCV1ZUGwIFVlBRDgcA"
			},
			body: JSON.stringify(builder('cart'))
		}, (error, response, body) => {
			console.log(body)
		})
	})
}