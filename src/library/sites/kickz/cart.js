const cheerio = require('cheerio');
const buildForm = require('./form-builder');

function fetchCookie() {

}

exports.fetchData = function () {
	let options = {
		url: this.productUrl,
		method: 'GET',
		headers: {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
			"cache-control": "max-age=0",
			"referer": "https://www.kickz.com/de/coming-soon",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "same-origin",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36"
		}
	}
	return this.request(options)
		
// 		(error, response, body) => {
// 			if (error) {
// 				return reject(error);
// 			}
// 			else if (response.statusCode !== 200) {
// 				console.log(response.statusCode)
// 				switch (response.statusCode) {
// 					case 301:
// 						error = new Error();
// 						error.code = 'MOVED PERMANENTLY';
// 						return reject(error);
// 					case 403:
// 						error = new Error();
// 						error.code = 'ACCESS DENIED'
// 						return reject(error)
// 					default:
// 						error = new Error();
// 						error.code = 'UNEXPECTED';
// 						return reject(error);
// 				}

// 			}
// 			else {
// 				let cartToken;
// 				let productData;
// 				let productName
// 				let variantId;
// 				try {
// 					const $ = cheerio.load(body);
// 					let ttokenElement = $('input#ttoken')
// 					if (ttokenElement) {
// 						cartToken = ttokenElement.val();
// 						this.cartToken = cartToken;
// 					}

// 					let productNameElement = $('#prodNameId');
// 					if (productNameElement) {
// 						productName = productNameElement.text();
// 					}

// 					//let productData = $('script[type="kspa-data"][data-prop="product"]').html();
// 					//if (productData == '""' || productData == null) {
					
// 					productData = $(`a[data-size="${this.sizeCode}"]`);
// 					productData.each(function () {
// 						if ($(this).attr('onclick').includes('US-')) {
// 							let sizeData = $(this).attr('onclick').replace(/^\s*/gm, '').replace(/[,']*/gm, '').split('\n');
// 							variantId = sizeData[1];
// 						}
// 					})
// 					if (!variantId) {
// 						error = new Error();
// 						error.code = 'SIZE NOT FOUND';
// 						return reject(error);
// 					}

					
// 					//}
// 					//else {
// 					//let sizeData = JSON.parse(productData).countrySizeMap.US;
// 					//let matchingProduct = sizeData.filter(size => size.first === this.taskData.products[0].size)[0];
// 					//let variantId = matchingProduct.second.productVariantId;
// 					//this.variantId = variantId;
// 					//}

// 				}
// 				catch (err) {
// 					error = new Error();
// 					error.code = 'UNEXPECTED';
// 					return reject(error);
// 				}
// 				if (cartToken) this.cartToken = cartToken;
// 				if (productName) this.productName = productName;
// 				if (variantId) this.variantId = variantId;
// 				console.log(`
// Cart Token: ${cartToken}
// ProductName: ${productName}
// VariantId: ${variantId}`);
// 				return resolve();
// 			}
// 		})
	// })
}

exports.add = function () {
	let options = {
		url: `${this.baseUrl}/${this.region}/cart/ajaxAdd`,
		method: 'POST',
		json: true,
		headers: {
			"accept": "application/json, text/javascript, */*; q=0.01",
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
			"origin": this.baseUrl,
			"referer": this.productUrl,
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-requested-with": "XMLHttpRequest"
		},
		form: buildForm.bind(this)('cart')
	}

	return this.request(options) 
		
	// 	(error, response, body) => {
	// 		if (error) {
	// 			reject(error);
	// 		}
	// 		else if (response.statusCode !== 200) {
	// 			console.log(response.statusCode);
	// 			error = new Error();
	// 			error.code = 'UNEXPECTED';
	// 			return reject(error);
	// 		}
	// 		else {
	// 			console.log(body)
	// 			if (body.hasOwnProperty('isError') && body.isError == true) {
	// 				error = new Error();
	// 				if (body.hasOwnProperty('msg') && body.msg.toLowerCase().includes('stock = 0')) error.code = 'OOS'
	// 				else error.code = 'CART';
	// 				return reject(error);
	// 			}
	// 			else if (body.prod && body.prod.totalCount && body.prod.totalCount.totalCount < 1) {
	// 				let err = new Error();
	// 				err.code = 'CART';
	// 				return reject(err);
	// 			}
	// 			else {
	// 				console.log('Added To Cart')
	// 				return resolve();
	// 			}
	// 		}
	// 	})
	// })
}

exports.get = function () {
	let options = {
		url: `${this.baseUrl}/${this.region}/cart`,
		method: 'GET',
		jar: this.cookieJar,
		headers: {
			"upgrade-insecure-requests": 1,
			"user-agent": this.userAgent,
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"sec-fetch-site": "same-origin",
			"sec-fetch-mode": "navigate",
			"sec-fetch-user": "?1",
			"referer": this.productUrl,
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
		}
	}
	console.log(options)
	return this.request(options);
	// return new Promise((resolve, reject) => {
	// 	this.request({
	// 		url: `${this.baseUrl}/${this.region}/cart`,
	// 		method: 'GET',
	// 		jar: this.cookieJar,
	// 		headers: {
	// 			'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
	// 			'Accept-Encoding': 'gzip, deflate',
	// 			'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
	// 			'Host': this.baseUrl,
	// 			'Connection': 'keep-alive',
	// 			'Referer': this.productUrl,
	// 			'Upgrade-Insecure-Requests': '1',
	// 			'User-Agent': this.userAgent
	// 		}
	// 	}
		
	// 	, (error, response, body) => {
	// 		if (error) {
	// 			reject(error);
	// 		}
	// 		else if (response.statusCode != 200) {

	// 		}
	// 		else {
	// 			console.log('Got Cart')
	// 			resolve();
	// 		}
	// 	})
	// })
}