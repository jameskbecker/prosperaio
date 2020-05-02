const Task = require('../../tasks/base');
//const Monitor = require('./monitor.1');
const logic = require('./logic');
const frontend = require('./frontend');
const keyword = require('../../other/keywords');
const unidecode = require('unidecode');
const { utilities } = require('../../other');
const convertSize = require('../../other/sizes');

class Supreme extends Task {
	constructor(_taskData) {
		super(_taskData);
		this.region = 'EU';
		this.foundProduct = false;
		//this.monitor = new Monitor(this.taskData.site.baseUrl, this.taskData.products[0], this);
		this.browser;
		this.page;
		this.executablePath;
		this.checkoutAttempts = 0;
		this.slug;
		this.restockMode = false;
		this.times = {
			foundProduct: 0,
			fetchedProductData: 0,
			cart: 0,
			checkout: 0,
			processing: 0
		}
		this.headers = {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
			"accept-encoding": "gzip, deflate",
			"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
			"content-type": "application/x-www-form-urlencoded",
			"cache-control": "no-cache",
			"origin": "https://www.supremenewyork.com",
			"referer": "https://www.supremenewyork.com/mobile",
			"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) CriOS/63.0.3239.73 Mobile/15B202 Safari/604.1",
			"x-requested-with": "XMLHttpRequest"
		}
	}

	async run() {
		try {
			await this.init();
			if (this.taskData.setup.mode === 'browser') await frontend.init.bind(this)();
			switch (this.taskData.site.id) {
				case 'supreme-eu':
					this.region = 'EU';
					break;
				case 'supreme-us':
					this.region = 'US';
					break;
				case 'supreme-jp':
					this.region = 'JP';
					break;
			}
		
			await utilities.setTimer.bind(this)();
			this.setStatus('STARTING TASK', 'WARNING');
			
			await logic.findProduct.bind(this)();
			this.setProductTitle();
			await logic.getProductData.bind(this)();
			await logic.cartProduct.bind(this)();

			await logic.checkoutProduct.bind(this)();
			if (this.successful === true) {
				this.setStatus('SUCCESSFULLY CHECKED OUT', 'SUCCESS');
				await this.postToDiscord();
			}

		}
		catch (err) {
			if (err && err.code) {
				switch (err.code) {
					case 'STOP':
						this.stop();
						this.isActive = false;
						break;
					case 'FAILED':
						this.isActive = false;
						break;
					case 'NO TASK MODE':
						this.stop();
						this.isActive = false;
						alert('INVALID TASK MODE');
					default: console.log(err)
				}
			}
			console.log(err)
		}
	}

	checkStockEndpoint(endpoint) {
		return new Promise((resolve, reject) => {
			let startTime = Date.now();
			this.request({
				url: `https://www.${this.site.baseUrl}/${endpoint}`,
				method: 'GET',
				proxy: utilities.formatProxy(this.taskData.additional.proxy),
				time: true,
				json: true,
				headers: {
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
					'accept-encoding': 'gzip, deflate',
					'accept-language': 'en-GB,en; q=0.9,en-US; q=0.8,de; q=0.7',
					'upgrade-insecure-requests': 1,
					'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) CriOS/63.0.3239.73 Mobile/15B202 Safari/604.1'
				}
			}, (error, response, body) => {
				if (!error && response.statusCode === 200) {
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
						'shorts': 'Shorts'
					}
					const allProducts = body.products_and_categories;
					const categoryProducts = allProducts[categories[this.products[0].category]];

					if (categoryProducts) {
						for (let i = 0; i < categoryProducts.length; i++) {
							let productData = categoryProducts[i];
							let productName = productData.name.trim().toLowerCase();
							if (keyword.isMatch(unidecode(productName), keyword.parse(this.products[0].searchInput))) {
								this.productData.productSKU = productData.id;
								this.productData.name = productData.name;
								this.foundProduct = true;
								this.times.foundProduct = Date.now() - startTime; 
								console.log('found product in:', this.times.foundProduct - response.elapsedTime, 'ms')
								resolve();
							}
							else if (i === categoryProducts.length - 1) {
								let err = new Error;
								err.code = 'PRODUCT NOT FOUND';
								reject(err);
							}
						}
					}
					else {
						let err = new Error;
						err.code = 'CATEGORY NOT FOUND'
						reject(err);
					}
				}
				else {
					console.log(error)
					if (error) reject(error);
					else reject(null);

				}
			})
		})


	}

	checkProductEndpoint() {
		return new Promise((resolve, reject) => {
			this.request({
				url: `https://www.supremenewyork.com/shop/${this.productData.productSKU}.json`,
				method: 'GET',
				proxy: utilities.formatProxy(this.taskData.additional.proxy)	,
				json: true,
				headers: this.headers
			}, (error, response, body) => {
				if (!error && response.statusCode === 200) {
					this.setStatus('Searching for Variant', 'WARNING');
					let allStyleData = body.styles;
					let styleData;
					for (let i = 0; i < allStyleData.length; i++) {
						styleData = allStyleData[i];
						let styleName = styleData.name.trim().toLowerCase();
						let variantKeywords = keyword.parse(this.products[0].style);
						if (this.products[0].style.trim() == '' || 
						this.products[0].style.trim().toLowerCase() === 'any' ||
						keyword.isMatch(unidecode(styleName), variantKeywords)) {
							this.setStatus('VARIANT FOUND!', 'WARNING');
							break;
						}
						else if (i === allStyleData.length - 1) {	
							let err = new Error();
							err.code = 'VARIANT NOT FOUND';
							reject(err);
						}
					}
					this.productData.styleId = styleData.id;
					this.productData.styleName = styleData.name;
					this.productData.thumbnail = styleData['mobile_zoomed_url_hi'];
					let sizeData;
					this.setStatus('Searching for Size', 'WARNING');
					switch (this.products[0].size) {
						case 'SMALLEST':
							sizeData = _.findWhere(styleData.sizes, { stock_level: 1 });
							break;
						case 'LARGEST':
							sizeData = styleData.sizes[styleData.sizes.length - 1];
							break;
						case 'RANDOM':
							let instockSizes = _.where(styleData.sizes, { stock_level: 1 });
							sizeData = instockSizes[Math.floor(Math.random() * parseInt(instockSizes.length))];
							break;
						default:
							for (let j = 0; j < styleData.sizes.length; j++) {
								sizeData = styleData.sizes[j];
								if (sizeData.name.includes(convertSize.supreme(this.products[0].size))) {
									break;
								}
								else if (j === styleData.sizes.length - 1) {
									let err = new Error;
									err.code = 'SIZE NOT FOUND';
									reject(err);
								}
							};
					}
					if (sizeData) {
						this.setStatus('Found Size!', 'WARNING');
						this.productData.size = sizeData.name;
						this.productData.sizeId = sizeData.id;
						resolve();
					}
					else {
						let error = new Error();
						error.code = 'OUT OF STOCK';
						reject(error)
					}
				}
				else {
					console.log(error);
					console.log(response.statusCode)
				}
			})
		})
	}
}



module.exports = Supreme;

