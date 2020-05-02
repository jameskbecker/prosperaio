const request = require('request').defaults({
	gzip: true
});
const _ = require('underscore');
const unidecode = require('unidecode');
const { utilities, keyword, convertSize } = require('../../other');

class SupremeMonitor {
	constructor(options = {}) {
		this.proxy = options.proxy;
		this.searchCategory = options.category;
		this.keywords = keyword.parse(options.searchInput);
		this.style = keyword.parse(options.styleInput);
		this.size = convertSize('supreme', options.size);
		this.baseUrl = options.baseUrl;
		this.isRunning = false;
		this.keywordList = [];
		this.proxyList = [];
		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
	}


	checkStockEndpoint(endpoint) {
		return new Promise((resolve, reject) => {
			request({
				url: `https://${this.baseUrl}/${endpoint}`,
				method: 'GET',
				proxy: utilities.formatProxy(this.proxy),
				json: true,
				headers: {
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
					'accept-encoding': 'gzip, deflate',
					'accept-language': 'en-GB,en; q=0.9,en-US; q=0.8,de; q=0.7',
					'upgrade-insecure-requests': '1',
					'user-agent': this.userAgent
				}
			}, (error, response, body) => {
				if (error) {
					reject(error);
				}
				else if (response.statusCode !== 200) {
					switch (response.statusCode) {
						case 429:
							error = new Error();
							error.code = 'BANNED';
							return reject(error);
						default:
							error = new Error();
							error.code = 'UNEXPECTED';
							return reject(error);
					}
				}
				else {
					const categories = {
						't_shirts': 'T-Shirts',
						'tops_sweaters': 'Tops/Sweaters',
						'bags': 'Bags',
						'hats': 'Hats',
						'pants': 'Pants',
						'sweatshirts': 'Sweatshirts',
						'shirts': 'Shirts',
						'accessories': 'Accessories',
						'skate': 'Skate',
						'jackets': 'Jackets',
						'shorts': 'Shorts',
						'shoes': 'Shoes'
					}
					const allProducts = body.products_and_categories;
					if (allProducts && Object.keys(allProducts).length === 0) {
						error = new Error();
						error.code = 'WEBSTORE CLOSED';
						reject(error);
					}
					const categoryName = categories[this.searchCategory];
					

					if (!allProducts.hasOwnProperty(categoryName)) {
						error = new Error();
						error.code = 'CATEGORY NOT FOUND'
						reject(error);
					}
					else {
						let categoryProducts = allProducts[categoryName];
						for (let i = 0; i < categoryProducts.length; i++) {
							let productData = categoryProducts[i];
							let productName = productData.name.trim().toLowerCase();
							
							if (keyword.isMatch(unidecode(productName), this.keywords)) {
								resolve({
									'productId': productData.id,
									'productName': productData.name
								});
							}
							else if (i === categoryProducts.length - 1) {
								let err = new Error();
								err.code = 'PRODUCT NOT FOUND';
								reject(err);
							}
						}
					}
					
				}
			})
		})


	}

	fetchProductData(productSKU) {
		return new Promise((resolve, reject) => {

			request({
				url: `https://${this.baseUrl}/shop/${productSKU}.json`,
				method: 'GET',
				proxy: utilities.formatProxy(this.proxy),
				json: true,
				headers: {
					'accept': 'application/json',
					'accept-encoding': 'br, gzip, deflate',
					'accept-language': 'en-us',
					'referer': `https://${this.baseUrl}/mobile`,
					'user-agent':	this.userAgent,
					'x-requested-with':	'XMLHttpRequest',
					
				}
			}, (error, response, body) => {
				if (error) {
					reject(error);
				}
				else if (response.statusCode !== 200) {
					switch (response.statusCode) {
						case 429:
							error = new Error();
							error.code = 'BANNED';
							return reject(error);
						default:
							error = new Error();
							error.code = 'UNEXPECTED';
							return reject(error);
					}
				}
				else {
					let allStyleData = body.styles;
					let styleData;
					for (let i = 0; i < allStyleData.length; i++) {
						styleData = allStyleData[i];
						let styleName = styleData.name.trim().toLowerCase();
						let variantKeywords = this.style;
						if (this.style == '' || keyword.isMatch(unidecode(styleName), variantKeywords)) break;
						else if (i === allStyleData.length - 1) {
							error = new Error();
							error.code = 'VARIANT NOT FOUND';
							return reject(error);
						}
					}
					let sizeData;
					let instockSizes = styleData.sizes.filter(sizeObj => { return sizeObj.stock_level === 1 });
					if (instockSizes.length < 1) {
						error = new Error();
						error.code = 'OUT OF STOCK';
						return reject(error);
					}
					else {
						switch (this.size) {
							case 'SMALLEST':
								sizeData = instockSizes[0];
								break;
							case 'LARGEST':
								sizeData = instockSizes[instockSizes.length - 1];
								break;
							case 'RANDOM':
								sizeData = instockSizes[Math.floor(Math.random() * parseInt(instockSizes.length))];
								break;
							default:
								for (let j = 0; j < instockSizes.length; j++) {
									sizeData = styleData.sizes[j];
									if (sizeData.name.includes(this.size)) {
										break;
									}
									else if (j === styleData.sizes.length - 1) {
										error = new Error;
										error.code = 'SIZE NOT FOUND';
										return reject(err);
									}
								};
						}
						if (!styleData || !sizeData) {
								console.log('SD', styleData)
								console.log('SiD', sizeData)
						}
						else {
							resolve({
								'styleName': styleData.name,
								'styleId': styleData.id,
								'sizeName': sizeData.name,
								'sizeId': sizeData.id,
								'imageUrl': `https:${styleData.mobile_zoomed_url_hi}`
							});
						}
					}
				}
			})
		})
	}



 
	// start() {

	// }
	// addKeywords(keywordInput = '', category = 'new') {
	// 	let keywords = keywordInput.split(',');
	// 	let keywordSet = {
	// 		positive: [],
	// 		negative: [],
	// 		category: category
	// 	};

	// 	for (let i = 0; i < keywords.length; i++) {
	// 		if (keywords[i].includes('+')) keywordSet.positive.push(keywords[i]);
	// 		else if (keywords[i].includes('-')) keywordSet.negative.push(keywords[i]);
	// 	}

	// 	this.keywordList.push(keywordSet);
	// }

	// removeKeywords() {

	// }

	// hasMatchedKeywords(productName, searchInput) {
	// 	if (!productName || !searchInput) {
	// 		return false;
	// 	}
	// 	for (let i = 0; i < searchInput.positive.length; i++) {
	// 		if (!productName.includes(searchInput.positive[i])) {
	// 			return false;
	// 		}
	// 	}
	// 	for (let i = 0; i < searchInput.negative.length; i++) {
	// 		if (productName.includes(searchInput.negative[i])) {
	// 			return false;
	// 		}
	// 	}
	// 	return true;
	// }





	// rotateProxyList() {
	// 	if (this.proxyList.length === 0) {
	// 		return '';
	// 	}
	// 	else {
	// 		this.proxyList.push(this.proxyList.shift());
	// 		return this.proxyList[0];
	// 	}
	// }





	// fetchProductId() {
	// 	return new Promise((resolve, reject) => {
	// 		request({
	// 			url: `https://${this.baseUrl}/mobile/products.json`,
	// 			method: 'GET',
	// 			proxy: utilities.formatProxy(this.rotateProxyList()),
	// 			json: true,
	// 			headers: {
	// 				'accept': 'application/json',
	// 				'accept-encoding': 'gzip, deflate',
	// 				'accept-language': 'en-GB,en; q=0.9,en-US; q=0.8,de; q=0.7',
	// 				'upgrade-insecure-requests': '1',
	// 				'user-agent': this.userAgent
	// 			}
	// 		}, (error, response, body) => {
	// 			if (error) {

	// 			}
	// 			else if (response.statusCode === 200) {
	// 				for (let i = 0; i < this.keywordList.length; i++) {
	// 					let keywords = this.keywordList[i];
	// 					const products = body.products_and_categories;
	// 					const categoryProducts = products[keywords.category];

	// 					if (!categoryProducts) {
	// 						let err = new Error();
	// 						err.code = 'CATEGORY NOT FOUND'
	// 						return reject(err);
	// 					}
	// 					else {
	// 						for (let j = 0; j < categoryProducts.length; j++) {
	// 							let data = categoryProducts[j];
	// 							let productName = data.name.trim().toLowerCase();

	// 							if (this.hasMatchedKeywords(productName, keywords)) {

	// 							}
	// 							else if (i === categoryProducts.length - 1) {

	// 							}
	// 						}
	// 					}
	// 				}

	// 			}
	// 			else {

	// 			}
	// 		})
	// 	})
	// }

	// fetchProductData(productId) {
	// 	return new Promise((resolve, reject) => {
	// 		request({
	// 			url: `https://www.supremenewyork.com/shop/${productId}.json`,
	// 			method: 'GET',
	// 			proxy: utilities.formatProxy(this.rotateProxy()),
	// 			json: true,
	// 			headers: {
	// 				"accept": "application/json",
	// 				"accept-encoding": "gzip, deflate",
	// 				"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
	// 				"content-type": "application/x-www-form-urlencoded",
	// 				"origin": "https://www.supremenewyork.com",
	// 				"referer": "https://www.supremenewyork.com/mobile",
	// 				"user-agent": this.userAgent,
	// 				"x-requested-with": "XMLHttpRequest"
	// 			}
	// 		}, (error, response, body) => {
	// 			if (error) {

	// 			}
	// 			else if (response.statusCode === 200) {

	// 			}
	// 			else {
	// 				const styles = body.styles;
	// 				let style;
	// 				for (let i = 0; i < styles.length; i++) {
	// 					style = styles[i];
	// 					let styleName = style.name;
	// 					if (this.style === '' || this.hasMatchedKeywords(styleName, this.keywordList)) console.log()
	// 				}
	// 			}


	// 			if (!error && response.statusCode === 200) {
	// 				let allStyleData = body.styles;
	// 				let styleData;
	// 				for (let i = 0; i < allStyleData.length; i++) {
	// 					styleData = allStyleData[i];
	// 					let styleName = styleData.name.trim().toLowerCase();
	// 					let variantKeywords = this.style;
	// 					if (this.style == '' || keyword.isMatch(unidecode(styleName), variantKeywords)) break;
	// 					else if (i === allStyleData.length - 1) {
	// 						let err = new Error();
	// 						err.code = 'VARIANT NOT FOUND';
	// 						reject(err);
	// 					}
	// 				}
	// 				let sizeData;
	// 				let instockSizes = styleData.sizes.filter(sizeObj => { return sizeObj.stock_level === 1 });
	// 				if (instockSizes.length > 1) {
	// 					switch (this.size) {
	// 						case 'SMALLEST':
	// 							//sizeData = _.findWhere(styleData.sizes, { stock_level: 1 });
	// 							sizeData = instockSizes[0];
	// 							break;
	// 						case 'LARGEST':
	// 							//	sizeData = _.findWhere(styleData.sizes, { stock_level: 1 });
	// 							sizeData = instockSizes[instockSizes.length - 1];
	// 							break;
	// 						case 'RANDOM':
	// 							//let instockSizes = _.where(styleData.sizes, { stock_level: 1 });
	// 							sizeData = instockSizes[Math.floor(Math.random() * parseInt(instockSizes.length))];
	// 							break;
	// 						default:
	// 							for (let j = 0; j < instockSizes.length; j++) {
	// 								sizeData = styleData.sizes[j];
	// 								if (sizeData.name.includes(this.size)) {
	// 									break;
	// 								}
	// 								else if (j === styleData.sizes.length - 1) {
	// 									let err = new Error;
	// 									err.code = 'SIZE NOT FOUND';
	// 									reject(err);
	// 								}
	// 							};
	// 					}
	// 					if (sizeData) {
	// 						resolve({
	// 							'styleName': styleData.name,
	// 							'styleId': styleData.id,
	// 							'sizeName': sizeData.name,
	// 							'sizeId': sizeData.id,
	// 							'imageUrl': `https:${styleData.mobile_zoomed_url_hi}`
	// 						});
	// 					}
	// 				}
	// 				else {
	// 					let error = new Error();
	// 					error.code = 'OUT OF STOCK';
	// 					reject(error)
	// 				}
	// 			}
	// 			else {
	// 				console.log(error);
	// 				console.log(response.statusCode)
	// 			}
	// 		})
	// 	})
	// }



	
}
// let Monitor = new SupremeMonitor({
// 	baseUrl: 'www.supremenewyork.com',
// 	proxy: '',
// 	category: 'accessories',
// 	searchInput: '+tagless',
// 	styleInput: '',
// 	size: 'M'
// });

// (async function() {
// 	let productData = await Monitor.checkStockEndpoint('mobile/products.json');
// 	await Monitor.fetchProductData(productData.productId);
// })()
module.exports = SupremeMonitor;