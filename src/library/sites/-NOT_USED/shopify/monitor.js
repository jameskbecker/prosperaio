const request = require('request')
const cheerio = require('cheerio')
const { parseString } = require('xml2js');
const keywordTool = require('../keywords')
const proxyTool = {
	format: function () { return '' }
}
class ShopifyMonitor {
	constructor(_baseurl, _options = {}) {
		this.baseUrl = _baseurl;
		this.options = _options;
		this.productKeywords = 'ANY';
		this.variantKeywords = 'ANY';
		this.request = request.defaults({
			gzip: true,
			timeout: 5000
		});
		this.init();
	}

	init() {
		if (this.options.hasOwnProperty('productKeywords')) {
			this.productKeywords = keywordTool.parse(this.options.productKeywords);
		}
		if (this.options.hasOwnProperty('variantKeywords')) {
			this.variantKeywords = keywordTool.parse(this.options.variantKeywords);
		}
	}

	getProductUrlSitemap() {
		return new Promise((resolve, reject) => {
			this.request({
				url: `https://${this.baseUrl}/sitemap_products_1.xml?from=1&to=999999999999999`,
				method: 'GET',
				proxy: proxyTool.format(),
				headers: {
					'Accept': '*/*',
					'Accept-Encoding': 'gzip, deflate',
					'Connection': 'keep-alive',
					'Host': this.baseUrl,
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
				}

			}, (error, response, body) => {
				if (!error) {
					switch (response.statusCode) {
						case 200:
							parseString(body, (err, result) => {
								if (!err) {
									for (let i = 0; i < result.urlset.url.length; i++) {
										let node = result.urlset.url[i];
										if (node.hasOwnProperty('image:image')) {
											let productName = node['image:image'][0]['image:title'][0].trim().toLowerCase();
											if (keywordTool.hasMatchedKeywords(productName, this.productKeywords)) {
												let productUrl = node.loc[0];
												return resolve(productUrl);
											}
										}
									}
								}
								else reject(err);
							})
							break;
						default: console.log(response.statusCode)
					}
				}
				else reject(error);
			})
		})
	}

	getProductUrlDSM() {
		return new Promise((resolve, reject) => {
			this.request({
				url: `https://${this.baseUrl}`,
				method: 'GET',
				headers: {
					'Accept': '*/*',
					'Accept-Encoding': 'gzip, deflate',
					'Connection': 'keep-alive',
					'Host': this.baseUrl,
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
				}
			}, (error, response, body) => {
				if (!error) {
					const $ = cheerio.load(body);
					const allProductPaths = $('.grid-view-item__link');
					if (!allProductPaths) {
						return resolve(allProductPaths)
					}
					else {
						for (let i = 0; i < allProductPaths.length; i++) {
							let productPath = allProductPaths[i].attribs.href.toLowerCase()
							if (keywordTool.hasMatchedKeywords(path, this.productKeywords)) {
								return resolve(`https://${this.baseUrl}${productPath}`);
							}
						}
						reject(null)
					}
				}
				else {
					reject(error)
				}
			})
		})
	}

	getProductUrlFrontend(keywords) {
		return new Promise((resolve, reject) => {
			this.request({

			}, (error, response, body) => {

			})
		})
	}

	getProductDataJSON(productUrl) {
		return new Promise((resolve, reject) => {
			request({
				url: `${productUrl}.json`,
				method: 'GET',
				proxy: proxyTool.format(),
				json: true,
				headers: {
					'Accept': '*/*',
					'Accept-Encoding': 'gzip, deflate',
					'Connection': 'keep-alive',
					'Host': this.baseUrl,
					'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
				}
			}, (error, response, body) => {
				if (!error) {
					switch (response.statusCode) {
						case 200:
							let productData = {
								id: body.product.id,
								name: body.product.title,
								image: body.product.image.src.replace(/\\/g, '')
							};
							let variantData = body.product.variants;
							for (let i = 0; i < variantData.length; i++) {
								if (keywordTool.hasMatchedKeywords(variantData['option1']), this.variantKeywords) {
									productData.sku = variantData[i].sku;
									productData.sizeName = variantData[i].title;
									productData.price = variantData[i].price;
									return resolve(productData);
								}
							}
							break;
						default: console.log(response.statusCode)
					}
				}
				else reject(error);
			})
		})
	}

	getProductDataOAuth(productUrl) {
		return new Promise((resolve, reject) => {
			this.request({

			}, (error, response, body) => {

			})
		})
	}

}

let monitor = new ShopifyMonitor('eflash.doverstreetmarket.com', {
	productKeywords: '+jordan',
	variantKeywords: '+S'
});


try {
	monitor.getProductUrlDSM().then(url => {
		console.log('url:', url)
	})
}
catch (err) {
	console.log(err)
}