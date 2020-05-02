const cart = require('./cart');
const checkout = require('./checkout');
const pollStatus = require('./poll');
const { utilities, cookies, keywords, convertSize } = require('../../other');
const settings = require('electron-settings');
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth")

exports.init = function() {
	return new Promise(async (resolve) => {
		puppeteer.use(pluginStealth())
		this.executablePath = settings.get('browser-path');
		let windowSize = '500,800';
		this.browser = await puppeteer.launch({
			headless: false,//this.taskData.additional.headlessMode,
			executablePath: this.executablePath,

			args: [
				`--window-size=${windowSize}`,
				'--disable-infobars'
				// '--no-sandbox', 
				// '--disable-setuid-sandbox'
			]
		});
		this.page = (await this.browser.pages())[0];
		this.page.emulate({
			viewport: {
				width: parseInt(windowSize.split(',')[0]),
				height: parseInt(windowSize.split(',')[1]),
				isMobile: true,
				hasTouch: true,
				isLandscape: false
			},
			userAgent: this.userAgent
		})
		
		function buildJSAddress() {
			let rememberedFields = [
				this.profile.billing.first + ' ' + this.profile.billing.last, //#order_billing_name
				this.profile.billing.email, //#order_email
				this.profile.billing.telephone, //#order_tel
				this.profile.billing.address1, //#order_billing_address
				this.profile.billing.address2, //#order_billing_address_2
				this.profile.billing.city, //#order_billing_city
				undefined, //#order_billing_state
				this.profile.billing.zip, //#order_billing_zip
				this.profile.billing.country.toUpperCase(), //#order_billing_country
			]
			if (this.region = 'EU') rememberedFields.push('');
			return rememberedFields.join('|')
		}
		
		await this.page.setCookie({
			"domain": "www.supremenewyork.com",
			"httpOnly": false,
			"name": 'js-address',
			"path": "/",
			"secure": false,
			"value": encodeURIComponent(buildJSAddress.bind(this)())
		})


		this.page.on('close', () => {
			if (this.shouldStop === false) {
				this.setStatus('ERROR: BROWSER CLOSED.', 'ERROR');
			}
		});
		this.browser.on('disconnected', () => {
			if (this.shouldStop === false) {
				this.setStatus('ERROR: BROWSER DISCONNECTED.', 'ERROR');
			}
		})

		resolve();
	})
}
exports.findProduct = function () {
	return new Promise((resolve, reject) => {
		const runStage = async function () {
			try {  
				this.startTS = Date.now();
				let searchInput = this.taskData.products[0].searchInput;
				if (searchInput.includes('+') || searchInput.includes('-')) {
					this.setStatus('Fetching Product Url.', 'WARNING');
					global.monitors.supreme.kw.add(this.id, searchInput, this.products[0].category, (name, id) => {
						if (this.taskData.additional.maxPrice != 0 && (price / 100) > this.taskData.additional.maxPrice) {
							this.setStatus('Price Exceeds Limit.', 'ERROR');
							return;
						}
						this.productData.productName = name;
						this.setProductName(name);
						this.productUrl = `https://${this.baseUrl}/shop/${id}`;
						this.mobileUrl = `https://${this.baseUrl}/mobile#products/${id}`;
						this.productId = id;
						this.startTS = Date.now();	
						resolve();
					})
				}
				else {
					this.setStatus('Invalid Search Input.', 'ERROR');
					reject(null);
				}
			}
			catch (err) {
				switch (err.code) {
					case 'PRODUCT NOT FOUND':
						this.setStatus('Product Not Found.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

					case 'CATEGORY NOT FOUND':
						this.setStatus('Category Not Found.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

					case 'WEBSTORE CLOSED':
						this.setStatus('Store Closed.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

					case 'ETIMEDOUT':
						this.setStatus('Timed Out.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.error);

					case 'STOP':
						return this.stop();

					default:
						console.log(err)
						return setTimeout(runStage.bind(this), this.taskData.delays.error);
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.getProductData = function () {
	return new Promise((resolve, reject) => {
		this.setStatus('Fetching Product Data.', 'WARNING');
		const runStage = async function () {
			global.monitors.supreme.url.add(this.productUrl, (styles) => {
				try {
					console.log(styles)
					styles.forEach(style => {
						if (keywords.isMatch(style.name.toLowerCase(), keywords.parse(this.products[0].style))) {
							let instockSizes = style.sizes.filter(size => size.stock_level === 1);
							let sizeData;
							let styleId = style.id
							console.log('MATCHED:', style.name)
							if (!instockSizes.length > 0) {
								let error = new Error();
								error.code = 'OUT OF STOCK';
								throw ('OUT OF STOCK');
							}
							switch (convertSize('supreme', this.products[0].size)) {
								case 'SMALLEST':
									sizeData = instockSizes[0]
									break;
								default:
									for (let i = 0; i < instockSizes.length; i++) {
										sizeData = instockSizes[i]
										if (sizeData.name.includes(convertSize('supreme', this.products[0].size))) {
											break;
										}
									}

							}
							if (sizeData) {
								let sizeName = sizeData.name;
								let sizeId = sizeData.id;
								this.setSizeName(sizeName)
								this.sizeId = sizeId;
								this.styleId = styleId;
								resolve();
							}
						}
						else console.log('NO MATCH:', style.name.toLowerCase(), keywords.parse(this.products[0].style))
					})
				}
				catch (err) {
					if (err.code) {
						switch (err.code) {
							case 'ETIMEDOUT':
								this.setStatus('Timed Out.', 'ERROR');
								return setTimeout(runStage.bind(this), this.taskData.delays.error);

							case 'OUT OF STOCK':
								this.setStatus('Out of Stock1.', 'ERROR');
								return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

							case 'SIZE NOT FOUND':
								this.setStatus('Size Not Found.', 'ERROR');
								return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

							case 'STYLE NOT FOUND':
								this.setStatus('Variant Not Found.', 'ERROR');
								return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

							case 'VARIANT NOT FOUND':
								this.setStatus('Variant Not Found.', 'ERROR');
								return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

							case 'STOP':
								return this.stop();

							default: console.log(err)
						}
					}
					else {
						switch (err) {
							case 'OUT OF STOCK':
								this.setStatus('Monitoring for Restocks.', 'INFO');
								return setTimeout(runStage.bind(this), 1000)
							default: console.log(err)
						}
					}
				}
			})
			// let productDetails = await this.Monitor.fetchProductData(this.productData.productId);
			// Object.assign(this.productData, productDetails);
			// this.setSizeName(this.productData.sizeName);
			// resolve();

		}
		runStage.bind(this)();

	})
}
// exports.findProduct = function () {
// 	return new Promise((resolve, reject) => {
// 		const runStage = async function () {
// 			try {
// 				this.startTS = Date.now();
// 				let searchInput = this.taskData.products[0].searchInput;
// 				if (searchInput.includes('+') || searchInput.includes('-')) {
// 					this.setStatus('Searching for Product.', 'WARNING');
// 					let productOverview = await this.Monitor.checkStockEndpoint('mobile/products.json');
// 					Object.assign(this.productData, productOverview);
// 					this.setProductName(this.productData.productName);
// 					resolve();
// 				}
// 				else if (searchInput.includes('supremenewyork.com')) {
// 					let desktopUrlExp = /https:\/\/www\.supremenewyork\.com\/shop\/\w{1,}\/(\w{1,})\/?(\w{1,})?/
// 					let mobileUrlExp = /https:\/\/www\.supremenewyork\.com\/mobile#products\/(\w{1,})\/?(\w{1,})?/;

// 					if (desktopUrlExp.test(this.products[0].searchInput) === true) {
// 						this.productData.productId = this.products[0].searchInput.match(desktopUrlExp)[1];
// 						resolve();
// 					}
// 					else {
// 						if (mobileUrlExp.test(this.products[0].searchInput) === true) {
// 							this.productData.productId = this.products[0].searchInput.match(mobileUrlExp)[1];
// 							this.setProductName(this.productData.productName);
// 						}
// 						else {
// 							this.setStatus('INVALID URL', 'ERROR');
// 							reject();
// 						}
// 					}
// 				}
// 				else {
// 					this.setStatus('Invalid Search Input.', 'ERROR');
// 					reject(null);
// 				}
// 			}
// 			catch (err) {
// 				switch (err.code) {
// 					case 'PRODUCT NOT FOUND':
// 						this.setStatus('Product Not Found.', 'ERROR');
// 						return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

// 					case 'CATEGORY NOT FOUND':
// 						this.setStatus('Category Not Found.', 'ERROR');
// 						return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

// 					case 'WEBSTORE CLOSED':
// 						this.setStatus('Store Closed.', 'ERROR');
// 						return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

// 					case 'ETIMEDOUT':
// 						this.setStatus('Timed Out.', 'ERROR');
// 						return setTimeout(runStage.bind(this), this.taskData.delays.error);

// 					case 'STOP':
// 						return this.stop();

// 					default:
// 						console.log(err)
// 						return setTimeout(runStage.bind(this), this.taskData.delays.error);
// 				}
// 			}
// 		}
// 		runStage.bind(this)();
// 	})
// }

// exports.getProductData = function () {
// 	return new Promise((resolve, reject) => {
// 		const runStage = async function () {
// 			try {
// 				this.setStatus('Fetching Product Data.', 'WARNING')
// 				let productDetails = await this.Monitor.fetchProductData(this.productData.productId);
// 				Object.assign(this.productData, productDetails);
// 				this.setSizeName(this.productData.sizeName);
// 				resolve();
// 			}
// 			catch (err) {
// 				switch (err.code) {
// 					case 'OUT OF STOCK':
// 						this.setStatus('Out of Stock.', 'ERROR');
// 						setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
// 						break;
// 					case 'SIZE NOT FOUND':
// 						this.setStatus('Size Not Found.', 'ERROR');
// 						setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
// 						break;
// 					case 'STYLE NOT FOUND':
// 						this.setStatus('Variant Not Found.', 'ERROR');
// 						setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
// 						break;
// 					case 'VARIANT NOT FOUND':
// 						this.setStatus('Variant Not Found.', 'ERROR');
// 						setTimeout(runStage.bind(this), this.taskData.delays.monitor);
// 						break;
// 					case 'STOP':
// 						return this.stop();
// 				}
// 			}
// 		}
// 		runStage.bind(this)();

// 	})
// }

exports.cartProduct = async function () {
	return new Promise(async (resolve, reject) => {
		const runStage = async function () {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					this.startTime = Date.now();
					await cart.add.bind(this)();
					resolve();
				}
				catch (err) {
					switch (err.code) {
						case 'OOS':
							this.setStatus('OOS', 'ERROR');
							if (this.taskData.setup.restockMode === 'cart') {
								setTimeout(runStage.bind(this), this.taskData.delays.monitor);
							}
							else {
								setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
							}
							break;
						default: console.log(err)
					}
				}
			}

		}
		runStage.bind(this)();
	})
}

exports.checkoutProduct = function () {
	return new Promise((resolve, reject) => {
		async function runStage(callback) {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					//			cookies.set.bind(this)('http://www.supremenewyork.com', 'lastVisitedFragment', 'checkout');
					await checkout.fillForm.bind(this)();
					

					if (this.hasCaptcha === true) {
						this.setStatus('Waiting for Captcha.', 'WARNING');
						await this.requestCaptcha();
					}
					this.setStatus('DELAYING PAYMENT', 'WARNING');
					await new Promise(resolve => { setTimeout(resolve, this.taskData.delays.checkout) });
					this.setStatus('SUBMITTING PAYMENT', 'WARNING');
					
					this.checkoutAttempts++;
					this.checkoutTime = Date.now();
					
					await checkout.submitForm.bind(this)();	
					console.log('CHECKOUT TIME:', this.checkoutTime)
					this.setStatus('PROCESSING', 'WARNING');

					callback.bind(this)();
					this.successful = true;
					resolve();
				}
				catch (err) {
					console.log('caught error')
					switch (err.code) {
						case 'QUEUED':
							setTimeout(callback.bind(this), this.taskData.delays.error);
							break;
						case 'OOS':
							this.setStatus('Out of Stock.', 'ERROR');
							this.restockMode = true;
							this.taskData.delays.cart = 0;
							this.taskData.delays.checkout = 0;
							if (taskData.setup.restockMode === 'cart') {
								setTimeout(exports.addCart.bind(this), this.taskData.delays.error);
							}
							else {
								setTimeout(exports.getProductData)
							}
							break;
						case 'CARD DECLINE':
							this.setStatus('Payment Error.')
							reject('FAILED');
							break;
						case 'PAYMENT ERROR':
							this.setStatus(`Payment Error.`, 'ERROR');
							eject(null);

						case 'INVALID PAYMENT':
							this.setStatus('Billing Error', 'ERROR');
							this.isActive = false;
							reject(null);
							break;
						case 'TERMS UNACCEPTED':
							this.setStatus('TOS Error.', 'ERROR');
							this.isActive = false;
							reject(null);
							break;
						case 'INVALID BILLING':
							this.setStatus('Billing Error', 'ERROR');
							this.isActive = false;
							reject(null);
							break;

						case 'PAID':
						default:
							console.log(err)
							resolve();
					}
				}

			}
		}

		async function checkStatus() {
			try {
				console.log(this.slug);
				this.setStatus('PROCESSING', 'WARNING');
				await pollStatus.getPoll.bind(this);
			}
			catch (err) {
				switch (err.code) {
					case 'QUEUED':
						setTimeout(checkStatus.bind(this), this.taskData.delays.error);
						break;
					case 'OOS':
						this.setStatus('OUT OF STOCK', 'ERROR');
						this.restockMode = true;
						this.taskData.delays.cart = 0;
						this.taskData.delays.checkout = 0;
						if (taskData.setup.restockMode === 'cart') {
							setTimeout(exports.addCart.bind(this), this.taskData.delays.error);
						}
						else {
							setTimeout(exports.getProductData)
						}
						break;
					case 'CARD DECLINE':
						this.setStatus(`CARD DECLINED [${this.checkoutAttempts}]`, 'ERROR');
						if (this.checkoutAttempts < this.taskData.setup.checkoutAttempts) {
							setTimeout(runStage.bind(this, checkStatus), this.taskData.delays.error);
						}
						else {
							resolve();
						}
						break;
					case 'PAYMENT ERROR':
						this.setStatus(`PAYMENT ERROR [${this.checkoutAttempts}]`, 'ERROR');
						if (this.checkoutAttempts < this.taskData.checkoutAttempts + 0) {

							setTimeout(runStage.bind(this, checkStatus), this.taskData.delays.error);
						}
						else reject(null);
						break;
					default:
						console.log(err);
						reject();
				}
			}
		}

		runStage.bind(this, checkStatus)();
	})
}
