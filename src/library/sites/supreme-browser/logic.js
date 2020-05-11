const cart = require('./cart');
const checkout = require('./checkout');
const settings = require('electron-settings');
const puppeteer = require('puppeteer-extra');

const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth())
const { cookies, keywords, utilities, convertSize, logger } = require('../../other');
const { URLMonitor } = require('../../monitors/supreme');


function setupBrowser() {
	return new Promise(async (resolve) => {
		this.browser = await puppeteer.launch({
			headless: false,
			executablePath: this.executablePath,

			args: [
				`--window-size=500,800`,
				'--disable-infobars'
			]
		});
		this.page = (await this.browser.pages())[0];
		this.page.emulate({
			viewport: {
				width: 500,
				height: 800,
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
				this.profile.billing.state, //#order_billing_state
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
				this.setStatus('Error: Browser Closed.', 'ERROR');
			}
		});
		this.browser.on('disconnected', () => {
			if (this.shouldStop === false) {
				this.setStatus('Error: Browser Disconnected.', 'ERROR');
			}
		})

		resolve();
	})
}

function fetchStockData() {
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

function fetchProductData() {
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

function cartProduct() {
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

function checkoutProduct() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				return reject(stopErr);
			}

			try {
				await checkout.fillForm.bind(this)();

				if (this.hasCaptcha) {
					this.setStatus('Waiting for Captcha', 'WARNING');
					await this.requestCaptcha();
				}

				this.setStatus('Delaying Checkout', 'WARNING');
				await utilities.sleep(this.taskData.delays.checkout || 0);

				this.setStatus('Submitting Checkout', 'WARNING');
				this.checkoutTime = Date.now();
				this.checkoutAttempts++;

				await checkout.submitForm.bind(this)();
				resolve();
			}
			catch (err) {
				console.log('caught error')
				switch (err.code) {

					case 'OOS':
						this.setStatus('Out of Stock.', 'ERROR');
						this.restockMode = true;
						this.taskData.delays.cart = 0;
						this.taskData.delays.checkout = 0;
						if (taskData.setup.restockMode === 'cart') {
							return setTimeout(exports.addCart.bind(this), this.taskData.delays.error);
						}
						else {
							return setTimeout(exports.getProductData)
						}
						break;


				}
			}
		}


		runStage.bind(this)();
	})
}

function processStatus() {
	return new Promise((resolve, reject) => {
		async function runStage(isCheckoutResponse = false) {
			try {
				if (!isCheckoutResponse) {
					checkout.pollStatus.bind(this)()
						.then(response => {
							this.checkoutData = response.body;
						})
						.catch(error => {
							return setTimeout(runStage.bind(this), 1000);
						})
				}
				let error;
				switch (this.checkoutData.status) {
					case 'paid':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						this.setStatus('Success', 'SUCCESS');
						if (this.productColour) {
							let field = {
								name: "Colour:",
								value: this.productColour,
								inline: true
							}
							privateFields.push(field);
							publicFields.push(field);
						}

						let field = {
							name: "Status:",
							value: "Paid",
							inline: true
						}
						privateFields.push(field)

						this.postPublicWebhook(publicFields);
						this.postPrivateWebhook(privateFields);
						this.addToAnalystics();
						resolve();
						return;

					case 'queued':
						this.setStatus('Processing.', 'WARNING');
						logger.warn(this.slug ? `Queued - ${this.slug}` : 'Queued.');
						if (this.checkoutData.hasOwnProperty('slug')) this.slug = this.checkoutData.slug;
						return setTimeout(runStage.bind(this), 1000);


					case 'failed':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						if (!this.checkoutData.errors) {
							this.setStatus('Payment Failed.', 'ERROR');
							logger.error('Payment Failed.');
							return this.checkoutAttempts < this.taskData.setup.checkoutAttempts ? setTimeout(exports.checkoutProduct.bind(this), 1000) : new Error();
						}
						else return this.setStatus('Billing Error.', 'ERROR');

					case 'cardinal_queued':
						this.setStatus('Queued for Cardinal.', 'WARNING');
						return setTimeout(runStage.bind(this), 1000);

					case 'cca':
						this.setStatus('Waiting for Authentication.', 'WARNING');
						return setTimeout(runStage.bind(this), 1000);





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
				return (setTimeout(runStage.bind(this), 1000))
			}
		}
		runStage.bind(this)(true);
	})
}

module.exports = {
	setupBrowser,
	fetchStockData,
	fetchProductData,
	cartProduct,
	checkoutProduct,
	processStatus
}