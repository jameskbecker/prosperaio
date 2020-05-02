const cart = require('./cart');
const checkout = require('./checkout');
const pollStatus = require('./poll');
const settings = require('electron-settings');
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth")
const { cookies, keywords, convertSize, logger } = require('../../other');
const { URLMonitor } = require('../../monitors/supreme');
exports.init = function() {
	return new Promise(async (resolve) => {
		puppeteer.use(pluginStealth())
		this.executablePath = settings.get('browser-path');
		let windowSize = '500,800';
		this.browser = await puppeteer.launch({
			headless: true,
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
			"domain": this.baseUrl.split('://')[1],
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
		async function runStage() {
			let searchInput = this.products[0].searchInput;
			let category = this.products[0].category;
			let maxPrice = this.taskData.additional.maxPrice;

			if (!searchInput.includes('+') && !searchInput.includes('-')) {
				this.setStatus('Invalid Search Input.', 'ERROR');
				reject(new Error('INVALID INPUT'));
				return;
			}

			logger.warn(`[T:${this.id}] Adding Keywords to Monitor.`);
			this.setStatus('Fetching Stock Data.', 'WARNING');
			this.isMonitoring = true;

			global.monitors.supreme.kw.add(this.id, searchInput, category, (name, id, price) => {
				this.isMonitoring = false;
				if (maxPrice > 0 && (price / 100) > maxPrice) {
					this.setStatus('Price Exceeds Limit.', 'ERROR');
					reject(new Error('PRICE LIMIT'));
					return;
				}
				this.startTS = Date.now();
				this.productId = id;
				this.productName = name;
				this.mobileUrl = this.baseUrl + '/mobile#products/' + this.productId;
				this.productUrl = this.baseUrl + '/shop/' + this.productId;

				this.setProductName();
				resolve();
				return;
			})
		}
		runStage.bind(this)();
	})
}

exports.getProductData = function () {
	return new Promise((resolve, reject) => {
		this.setStatus('Fetching Product Data.', 'WARNING');
		const runStage = async function () {
			if (!global.monitors.supreme.url.hasOwnProperty(this.productUrl)) {
				global.monitors.supreme.url[this.productUrl] = new URLMonitor(this.productUrl);
			}
			let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
			global.monitors.supreme.url[this.productUrl].monitorDelay = monitorDelay;
			global.monitors.supreme.url[this.productUrl].add(this.id, (styles) => {
				let instockSizes = []
				let sizeData;
				let styleName;
				let styleId;
				let imageUrl;
				for (let i = 0; i < styles.length; i++) {
					if (keywords.isMatch(styles[i].name.toLowerCase(), keywords.parse(this.products[0].style))) {
						instockSizes = styles[i].sizes.filter(size => size.stock_level === 1);
						styleName = styles[i].name;
						styleId = styles[i].id
						imageUrl = 'https:' + styles[i].image_url;
						break;
					}

				}

				if (!instockSizes.length > 0) {
					this.setStatus('Monitoring for Restocks.', 'INFO');
					logger.error(`[T:${this.id}] [${this.productName}] OOS`)
					let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
					return setTimeout(runStage.bind(this), monitorDelay);
				}
				else {
					switch (this.products[0].size) {
						case 'SMALLEST': sizeData = instockSizes[0]
							break;
						case 'LARGEST': sizeData = instockSizes[instockSizes.length - 1];
							break;
						case 'RANDOM': sizeData = instockSizes[Math.floor(Math.random() * parseInt(instockSizes.length))];
							break;
						default:
							for (let j = 0; j < instockSizes.length; j++) {
								sizeData = instockSizes[j];
								if (sizeData.name.includes(convertSize('supreme', this.products[0].size))) break;
							}

					}
				}

				if (sizeData) {
					this.isMonitoring = false;
					this.productSizeName = sizeData.name;
					this.productColour = styleName;
					this.sizeId = sizeData.id;
					this.styleId = styleId;
					this.productImageUrl = imageUrl;

					logger.verbose(`[T:${this.id}] [${this.styleId}] Matched Style: ${this.productColour}.`);
					logger.verbose(`[T:${this.id}] [${this.sizeId}] Matched Size : ${this.productSizeName}.`);
					global.monitors.supreme.url[this.productUrl].remove(this.id);
					this.setSizeName();
					resolve();
					return;
				}
				else {
					logger.error('Style Not Found.');
					let errorDelay = settings.has('globalErrorDelay') ? settings.get('globalErrorDelay') : 1000;
					return setTimeout(runStage.bind(this), errorDelay);
				}
			})
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
					this.setStatus('Delaying Checkout', 'WARNING');
					await utilities.sleep(this.taskData.delays.checkout);
					this.setStatus('Submitting Checkout', 'WARNING');
					
					this.checkoutAttempts++;
					this.checkoutTime = Date.now();
					
					await checkout.submitForm.bind(this)();	
					console.log(this.checkoutData);
					this.setStatus('PROCESSING', 'WARNING');

					//callback.bind(this)();
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

exports.processStatus = function () {
	return new Promise((resolve, reject) => {
		async function runStage(isCheckoutResponse = false) {
			try {
				if (!isCheckoutResponse) await checkout.getStatus.bind(this)();
				let error;
				switch (this.checkoutData.status) {
					case 'queued':
						this.setStatus('Queued.', 'WARNING');
						logger.warn(this.slug ? `Queued - ${this.slug}` : 'Queued.');
						if (this.checkoutData.hasOwnProperty('slug')) this.slug = this.checkoutData.slug;
						return setTimeout(runStage.bind(this), 1000);

					case 'cardinal_queued':
						this.setStatus('Queued for Cardinal.', 'WARNING');
						return setTimeout(runStage.bind(this), 1000);

					case 'cca':
						this.setStatus('Waiting for Authentication.', 'WARNING');
						return setTimeout(runStage.bind(this), 1000);

					case 'failed':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						if (!this.checkoutData.errors) {
							this.setStatus('Payment Failed.', 'ERROR');
							logger.error('Payment Failed.');
							return this.checkoutAttempts < this.taskData.setup.checkoutAttempts ? setTimeout(exports.checkoutProduct.bind(this), 1000) : new Error();
						}
						else return this.setStatus('Billing Error.', 'ERROR');

					case 'paid':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						this.setStatus('Check Email.', 'SUCCESS');
						this.postSuccess();
						this.postCustomWebhook();
						resolve();
						return;

					case 'dup':
						this.setStatus('Duplicate Order.', 'ERROR');
						error = new Error();
						error.code = 'FAILED';
						reject(error);
						return;

					case 'canada':
						this.setStatus('Not Available in Canada.', 'ERROR');
						error = new Error();
						error.code = 'FAILED';
						reject(error);
						return;

					case 'blocked_country':
						this.setStatus('N/A in Selected Country.', 'ERROR');
						error = new Error();
						error.code = 'FAILED';
						reject(error);
						return;

					case 'blacklisted':
						this.setStatus('Blacklisted.', 'ERROR');
						error = new Error();
						error.code = 'FAILED';
						reject(error);
						return;

					case 'outOfStock':
						this.setStatus('Out of Stock.', 'ERROR');
						if (this.taskData.additional.monitorRestocks) {
							this.restockMode = true;
							error = new Error();
							error.code = 'RESTOCKS'
						}
						else {
							error = new Error();
							error.code = 'FAILED'
						}
						reject(error);
						return;

					case 'paypal':
						this.setStatus('Checkout Status: Paypal.', 'INFO')
						return;

					default:
						this.setStatus('Unexpected Error', 'ERROR');
						error = new Error();
						error.code = 'UNEXPECTED';
						reject(error);
				}
			}
			catch (err) {
				console.log(err)
			}
		}
		runStage.bind(this)(true);
	})
}