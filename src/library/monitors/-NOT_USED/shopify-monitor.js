const request = require('request')
const cheerio = require('cheerio')
const { parseString } = require('xml2js');
const { utilities, keyword, convertSize } = require('../../other');
const proxyTool = {
	format: function () { return '' }
}
class ShopifyMonitor {
	constructor(_options = {}) {
		this.baseUrl = _options.baseUrl;
		this.site = _options.site;
		this.keywords = keyword.parse(_options.searchInput);
		this.size = convertSize('shopify', _options.size);
		this.request = request.defaults({
			gzip: true,
			timeout: 5000
		});
		this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
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
					'User-Agent': this.userAgent
				}

			}, (error, response, body) => {
				if (error) {
					reject(error);
				}
				else if (response.statusCode !== 200) {
					switch (response.statusCode) {
						default: console.log(response.statusCode);
					}
				}
				else {
					parseString(body, (err, result) => {
						if (err) {
							reject(err);
						}
						else {
							let nodes = result.urlset.url
							for (let i = 0; i < nodes.length; i++) {
								let node = result.urlset.url[i];
								if (node.hasOwnProperty('image:image')) {
									let productName = node['image:image'][0]['image:title'][0].trim().toLowerCase();
									if (keyword.isMatch(productName, this.keywords)) {
										let productUrl = node.loc[0];
										return resolve(productUrl);
									}
								}
								else if (i === result.urlset.url.length - 1) {
									let err = new Error();
									err.code = 'PRODUCT NOT FOUND';
									return reject(err);
								}
							}
							let err = new Error();
							err.code = 'PRODUCT NOT FOUND';
							return reject(err);
						}
					})
				}
				if (!error) {
					switch (response.statusCode) {
						case 200:

							break;
						default: console.log(response.statusCode)
					}
				}
				else reject(error);
			})
		})
	}

	getProductUrlJson() {
		return new Promise((resolve, reject) => {
			this.request({
				url: `https://${this.baseUrl}/products.json`,
				method: 'GET',
				headers: {
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
					'accept-encoding': 'gzip, deflate',
					'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
					'cache-control': 'max-age=0',
					'if-none-match': 'cacheable:9cab58be875c4d9157cdaef788e87d45',
					'sec-fetch-mode': 'navigate',
					'sec-fetch-site': 'none',
					'sec-fetch-user': '?1',
					'upgrade-insecure-requests': '1',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
				},
				qs: {
					'limit': 50,
					'page': '-902192938292'
				}
			}, (error, response, body) => {
				if(error) {
					reject(error);
				}
				else if (response.statusCode !== 200) {

				}
				else {
/*				 
					 	access-control-allow-origin: *
						cf-ray: 509a87e2a9619bf1-AMS
						content-encoding: gzip
						content-language: en
						content-security-policy: block-all-mixed-content; frame-ancestors *; upgrade-insecure-requests; report-uri /csp-report?source%5Baction%5D=list_products&source%5Bapp%5D=Shopify&source%5Bcontroller%5D=storefront_section%2Fshop&source%5Bsection%5D=storefront&source%5Buuid%5D=00974a22-ee6c-4d83-a1d1-3b25b8493a29
						content-type: application/json; charset=utf-8
						date: Wed, 21 Aug 2019 06:25:37 GMT
						etag: cacheable:5161ca4cb7dace8db35aa907e2ad5467
						expect-ct: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
						nel: {"report_to":"network-errors","max_age":2592000,"failure_fraction":0.01,"success_fraction":0.0001}
						report-to: {"group":"network-errors","max_age":2592000,"endpoints":[{"url":"https://monorail-edge.shopifycloud.com/v1/reports/nel/20190325/shopify"}]}
						server: cloudflare
						status: 200
						strict-transport-security: max-age=7889238
						x-alternate-cache-key: cacheable:f3e6baf042303d4562c5518b79150410
						x-assetversion: 62368
						x-cache: hit, server
						x-content-type-options: nosniff
						x-dc: gcp-us-central1,gcp-us-central1
						x-download-options: noopen
						x-edge-cache: MISS
						x-permitted-cross-domain-policies: none
						x-request-id: 00974a22-ee6c-4d83-a1d1-3b25b8493a29
						x-shardid: 127
						x-shopid: 942252
						x-shopify-stage: production
						x-sorting-hat-podid: 127
						x-sorting-hat-shopid: 942252
						x-xss-protection: 1; mode=block; report=/xss-report?source%5Baction%5D=list_products&source%5Bapp%5D=Shopify&source%5Bcontroller%5D=storefront_section%2Fshop&source%5Bsection%5D=storefront&source%5Buuid%5D=00974a22-ee6c-4d83-a1d1-3b25b8493a29
						 
*/
				}
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
					'User-Agent': this.userAgent
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
							if (keyword.isMatch(productPath, this.keywords)) {
								return resolve(`https://${this.baseUrl}${productPath}`);
							}
						}
						let err = new Error('Product Not Found');
						err.code = 'NTFND';
						reject(err)
					}
				}
				else {
					reject(error)
				}
			})
		})
	}

	getProductDataFrontend(productUrl) {
		return new Promise((resolve, reject) => {
			this.request({
				url: productUrl,
				method: 'GET',
				proxy: proxyTool.format(),
				headers: {
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
					'Accept-Encoding': 'gzip, deflate',
					"accept-language": "en-GB,en",
					'Connection': 'keep-alive',
					'Host': this.baseUrl,
					'User-Agent': this.userAgent
				}
			}, async (error, response, body) => {
				if (error) {
					reject(error);
				}
				else if (response.statusCode !== 200) {
					switch (response.statusCode) {
						default: console.log(response.statusCode)
					}
				}
				else {
					const $ = cheerio.load(body);
					let productJson;
					switch (this.site) {
						case 'dsml-flash':
							productJson = JSON.parse($('#ProductJson-product-template').html());
							break;
						case 'yeezysupply':
							productJson = JSON.parse($('.js-product-json').html());
							break;
						default: console.log(this.site)
					}
					
					
					let productData = {
						"id": productJson.id,
						"name": productJson.title
					};

					productData.image = 'https:' + productJson.featured_image || '';

					let variantData = productJson.variants;
					for (let i = 0; i < variantData.length; i++) {
						let sizeName = variantData[i].title.trim();
						if (sizeName.toLowerCase().includes(this.size)) {
							if (variantData[i].hasOwnProperty('available') && variantData[i].available === false) {
								let err = new Error();
								err.code = 'OOS';
								return reject(err);
							}
							else {
								if (this.site === 'dsml-eflash') {
									let scriptTags;
									let scriptUrl;
									let property;
									scriptTags = body.match(/src=\"([A-Za-z0-9\/\.\?])+/g);
									for (let i = 0; i < scriptTags.length; i++) {
										if (scriptTags[i].indexOf('custom.js') !== -1) {
											scriptUrl = 'https:' + scriptTags[i].split('src="')[1];
											break;
										}
									}
									property = await this.getDsmHash(scriptUrl);
									if (property) productData.properties = [property];
								}
								if (this.site === 'yeezysupply') productData.barcode = variantData[i].barcode;
								productData.variantId = variantData[i].id;
								productData.sku = variantData[i].sku;
								productData.sizeName = variantData[i].title;
								productData.price = variantData[i].price;
								return resolve(productData);
							}
						}
					}
					let err = new Error();
					err.code = 'SIZE NOT FOUND';
					reject(err);
					break;
				}
			}
			)
		})
	}

	getProductDataJSON(productUrl) {
		return new Promise((resolve, reject) => {
			let options = {
				url: `${productUrl}.json`,
				method: 'GET',
				proxy: proxyTool.format(),
				headers: {
					'Accept': 'application/json',
					'Accept-Encoding': 'gzip, deflate',
					"accept-language": "en-GB,en",
					'Connection': 'keep-alive',
					'Host': this.baseUrl,
					'User-Agent': this.userAgent
				}
			}



			this.request(options, (error, response, body) => {
				if (!error) {
					switch (response.statusCode) {
						case 200:
							body = JSON.parse(body)
							let productData = {
								id: body.id || body.product.id,
								name: body.title || body.product.title,
								image: body.featured_image || ''
							};
							let variantData = body.product.variants;

							for (let i = 0; i < variantData.length; i++) {
								if (variantData[i].title.trim().toLowerCase().includes(this.size)) {
									productData.variantId = variantData[i].id;
									productData.sku = variantData[i].sku;
									productData.sizeName = variantData[i].title;
									productData.price = variantData[i].price;
									return resolve(productData);
								}
							}
							let err = new Error();
							err.code = 'SIZE NOT FOUND';
							reject(err);
							break;
						default: console.log(response.statusCode)
					}
				}
				else reject(error);
			})
		})
	}

	getDsmHash(scriptUrl) {
		return new Promise((resolve, reject) => {
			this.request({
				'url': scriptUrl,
				'proxy': '',
				'headers': {
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
					'Accept-Encoding': 'gzip, deflate, br',
					'Accept-Language': 'en-GB, en-US; q=0.9, en; q=0.8',
					'Connection': 'keep-alive',
					'Upgrade-Insecure-Requests': '1',
					'User-Agent': this.userAgent
				}
			}, (error, response, body) => {
				if (error) {
					reject(error);
				}
				else if (response.statusCode !== 200) {
					switch (response.statusCode) {
						default: console.log(response.statusCode);
					}
				}
				else {
					let property;
					try {
						let propElement = /product-form'\).append\(([^])+\/\>/.exec(body)[0];
						let propData = /value="([^])+\/\>/.exec(propElement)[0]['split']('\x22');
						let propKey = /properties\[([^\]]+)/.exec(propData[3])[0]['split']('properties[')[1];
						let propValue = propData[1]
						if (propKey && propValue) {
							property = {}
							property[propKey] = propValue;
						}
						resolve(property);
					}
					catch (err) {
						console.log(err)
					}
				}

			})
		})
	}
}

module.exports = ShopifyMonitor;