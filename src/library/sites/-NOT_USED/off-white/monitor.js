const _ = require('underscore');
const cheerio = require('cheerio');
const taskStatus = require('../../tasks/task-status');

exports.getCookies = function () {
	return new Promise((resolve, reject) => {
		const j = this.request.jar()
		this.request({
			url: 'https://www.off---white.com/en/DE',
			method: 'GET',
			jar: j,
			followRedirect: true,
			followAllRedirects: true,
			headers: {
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
				'accept-encoding': 'gzip',
				'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
				'upgrade-insecure-requests': 1,
				'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3711.0 Safari/537.36'
			}
		}, (error, response, body) => {
			this.keyUrl = response.request.uri;
			this.cookies = j;
			resolve();
		})
	})
}

exports.useCookies = function () {
	console.log(this.request({
		url: this.keyUrl,
		jar: this.cookies,
		followAllRedirects: true,
		followRedirect: true,
		headers: {


			"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
			"Accept-Encoding": "gzip",
			"Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
			"Connection": "keep-alive",
			"Host": "ohio8.vchecks.me",
			"Upgrade-Insecure-Requests": 1,
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3711.0 Safari/537.36"

		}
	}, (err, resp, body) => {

	}))	
}

exports.checkEndpoint = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: `${this.taskData.searchInput}.json`,
			qs: this.keys,
			headers: {
				//"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
				"accept-encoding": "gzip",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
				"upgrade-insecure-requests": "1",
				"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
			},
			jar: true
			
			
		}, (error, response, body) => {
			if (!error && response) {
				let availableSizes = JSON.parse(response.body)["available_sizes"];
				const matchedSize = _.findWhere(availableSizes, {name: this.taskData.size});

				if (!matchedSize) {
					let error = new Error();
					error.type = 'Out of Stock'
					reject(error);
				}
				else {
					this.variantId = matchedSize.id;
					resolve();
				}
			}
			else {
				if (response && response.statusCode === 307) {
					let error = new Error();
					error.type = 'Invalid URL';
					reject(error);
				}
				if (!response) {
					let error = new Error();
					error.type = 'No Response';
					reject(error);
				}
			}
		})
	})
}

exports.checkDOM = function() {
	return new Promise((resolve, reject) => {	
		this.request({
			url: `${this.taskData.searchInput}`,
			headers: {
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
				'accept-encoding': 'gzip',
				'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
				'upgrade-insecure-requests': '1',
				'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36'
			}
		}, (error, response, body) => {
			if(!error && response.statusCode === 200) {
				const $$ = cheerio.load(body);
				let availableVariants = [];
				let variantElements = $$('input[name="variant_id"]');
				
				variantElements.each(function() {
					let variantId = $$(this).val();
					let variantName = $$(this).next('label').html();
					availableVariants.push({
						name: variantName,
						id: variantId
					})
				})
				const matchingVariant = _.findWhere(availableVariants, {name: this.taskData.size});
				if (!matchingVariant) {
					const error = new Error();
					error.type = 'Variant Not Found';
					reject(error);
				}
				else {
					this.variantId = matchingVariant.id;
					console.log(this.variantId)
					resolve();
				}
			}
			else {
				console.log(error)
				reject()
			}
		})
	})
}
