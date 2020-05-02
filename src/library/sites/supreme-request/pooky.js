const request = require('request');
const { utilities, cookies, logger } = require('../../other');
exports.setPooky1 = function () {
	let options = {
		url: 'http://pooky-bored-dev.appspot.com/' +  this.region,
		proxy: null,
		followAllRedirects: true,
		json: true,
		headers: {
			'Accept': 'application/json',
			'x-api-key': '57bb6a34-734e-4c60-a39c-5e06d30d3799',
			'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B150'
		}
	}
	return this.request(options); 
};

exports.setPooky2 = function () {
	let options = {
		url: 'https://pooky.destroyerbots.com/api/v3/generate',
		followAllRedirects: true,
		timeout: 15000,
		json: true,
		headers: {
			'Accept': 'application/json',
			'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_1 like Mac OS X) AppleWebKit/604.3.5 (KHTML, like Gecko) Mobile/15B150'
		},
		qs: {
			'locale': this.region,
			'clientId': 'e16f848e-63d3-4d21-b6ca-ede9a6833008',
			'mode': 'mobile'
		}
	}
	return this.request(options);
}