const request = require('request');
// const chalk = require('chalk');

// function log(id, a = '', b = '', c = '', type) {
// 	if (type === 'ERROR') c = chalk.red(c)
// 	else if (type === 'SUCCESS') c = chalk.green(c)
// 	else if (type === 'WARNING') c = chalk.yellow(c)
// 	else if (type === 'OTHER') c = chalk.magenta(c)
// 	console.log(`${chalk.cyan(`[${id}]`)} ${chalk.magenta(`[${a}]`)} ${chalk.yellow(`[${b}]`)} ${chalk.bold(c)}`);
// }

class SupremeMonitor {
	constructor(_options = {}) {
		this.baseUrl = 'www.supremenewyork.com';
		this.inputData = {};
		this.isRunning = false;
		this.proxy = _options.proxy ? _options.proxy : ''
		this.timeout = _options.timeout ? _options.timeout : 30000
		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
	}

	async run() {
		if (!this.isRunning) {
			try {
				this.isRunning = true;
				await this.fetchStockData('mobile_stock');
				this.fetchProductData();
			}
			catch(err) {

			}
		}
	}

	add(name, category, callback) {
		let input;
		if (this.inputData.hasOwnProperty(`${name}_${category}`)) {
			input = this.inputData[`${name}_${category}`];
		}
		else {
			input = {
				'NAME_POS': [],
				'NAME_NEG': [],
				'CATEGORY': category,
				'CALLBACKS': [],
				'NAME': null,
				'PID': null,
			};
		}

		const nameKWs = name.split(',');
		for (let i = 0; i < nameKWs.length; i++) {
			if (nameKWs[i].includes('+')) input['NAME_POS'].push(nameKWs[i].trim().toLowerCase().substr(1));
			if (nameKWs[i].includes('-')) input['NAME_NEG'].push(nameKWs[i].trim().toLowerCase().substr(1));
		}

		input['CALLBACKS'].push(callback);
		this.inputData[`${name}_${category}`] = input;
	}

	remove(keywordSet) {
		for (let i = 0; i < this.inputData.length; i++) {
			if (this.inputData[i] === keywordSet) {
				this.inputData.splice(i, 1);
				return;
			}
		}
	}

	_hasMatchingsKeywords(data, positive, negative) {
		for (let i = 0; i < positive.length; i++) {
			if (!data.toLowerCase().includes(positive[i].toLowerCase())) return false;
		}
		for (let i = 0; i < negative.length; i++) {
			if (data.toLowerCase().includes(negative[i].toLowerCase())) return false;
		}
		return true;
	}


	fetchStockData(endpoint) {
		return new Promise((resolve, reject) => {
			request({
				url: `https://${this.baseUrl}/${endpoint}.json`,
				method: 'GET',
				json: true,
				gzip: true,
				time: true,
				timeout: this.timeout,
				headers: {
					'accept': 'application/json',
					'accept-encoding': 'br, gzip, deflate',
					'accept-language': 'en-us',
					'user-agent': this.userAgent,
					'x-requested-with': 'XMLHttpRequest'
				}
			}, (error, response, body) => {
				if (error) {
					console.log(error);
				}
				else if (response.statusCode !== 200) {
					console.log(response.statusCode)
				}
				else {
					console.log('Polled Stock')
					const categoriesFORMAT = {
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
					let categories = body.products_and_categories;
					Object.keys(this.inputData).forEach(propName => {
						let data = this.inputData[propName];
						let formattedCat = categoriesFORMAT[data['CATEGORY']]
						if (!categories.hasOwnProperty(formattedCat)) {
							console.error('CATEGORY:', data['CATEGORY'], 'NOT FOUND.');
						}
						else {
							let products = categories[formattedCat];
							let productName;
							let productId;
							for (let j = 0; j < products.length; j++) {
								productName = products[j].name;
								productId = products[j].id
								if (this._hasMatchingsKeywords(productName, data['NAME_POS'], data['NAME_NEG'])) {
									this.inputData[propName]['NAME'] = productName;
									this.inputData[propName]['PID'] = productId;
								}
							}
							if (!productName || !productId) {
								log(propName, 'PRODUCT NOT FOUND', '', 'ERROR')
							}
							else {
								resolve();
							}
						}
					})


				}
			})
		})
	}

	fetchProductData() {
		Object.keys(this.inputData).forEach(propName => {
			let data = this.inputData[propName]
			request({
				url: `https://${this.baseUrl}/shop/*/${data['PID']}.json`,
				method: 'GET',
				json: true,
				gzip: true,
				time: true,
				timeout: this.timeout,
				headers: {
					'accept': 'application/json',
					'accept-encoding': 'br, gzip, deflate',
					'accept-language': 'en-us',
					'user-agent': this.userAgent,
					'x-requested-with': 'XMLHttpRequest'
				}
			}, (error, response, body) => {
				if (error) { }
				else if (response.statusCode !== 200) { }
				else {
					//log(data['NAME'], 'FETCHED PRODUCT DATA', `${response.elapsedTime}ms`, 'OTHER')
					if (!body.hasOwnProperty('styles')) {

					}
					else {
						let styles = body.styles;
						// for (let i = 0; i < styles.length; i++) {
						// 	let styleName = styles[i].name;
						// 	let styleId = styles[i].id;
						// 	let imageUrl = styles[i].image_url;
						// 	let sizes = styles[i].sizes;
						// 	for (let j = 0; j < sizes.length; j++) {
						// 		let sizeName = sizes[j].name;
						// 		let sizeId = sizes[j].id;
						// 		let isAvailable = Boolean(sizes[j].stock_level);
						// 		if (!isAvailable) log(data['NAME'], styleName, sizeName, 'OUT OF STOCK', 'ERROR');
						// 		else log(data['NAME'], styleName, sizeName, 'INSTOCK', 'SUCCESS');
						// 	}
						// }
					 	this.returnData(data, styles)
						
					}
				}
			})
		})
	}

	returnData(parentData, styleData) {
		for (let i = 0; i < parentData['CALLBACKS'].length; i++) {
			parentData['CALLBACKS'][i](parentData['NAME'], parentData['PID'], styleData)
		}
	}
}

module.exports = SupremeMonitor