const cart = require('./cart');
const checkout = require('./checkout');
const settings = require('electron-settings');

const { keywords, utilities, logger } = require('../../other');
const { URLMonitor } = require('../../monitors/supreme');

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
				global.monitors.supreme.url[this.productUrl] = new URLMonitor(this.productUrl, this._proxyList);
			}
			let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
			global.monitors.supreme.url[this.productUrl].monitorDelay = monitorDelay;
			global.monitors.supreme.url[this.productUrl].add(this.id, (styles) => {
				try {
					let specific = false;
					let matchedData;
					let sizeData;
					let styleName;
					let styleId;
					let imageUrl;
					for (let i = 0; i < styles.length; i++) {
						if (keywords.isMatch(styles[i].name.toLowerCase(), keywords.parse(this.products[0].style))) {
							switch (this.products[0].size) {
								case "RANDOM":
								case "SMALLEST":
								case "LARGEST":
									matchedData = styles[i].sizes.filter(size => size.stock_level === 1);
									break;

								default:
									specific = true
									console.log('SIZE:', styles[i].sizes, this.products[0].size)
									matchedData = styles[i].sizes.filter(size => size.name.toLowerCase().includes(this.products[0].size));

							}

							styleName = styles[i].name;
							styleId = styles[i].id
							imageUrl = 'https:' + styles[i].image_url;
							break;
						}

					}

					if (matchedData.length === 0 && !specific) {
						throw new Error('OOS');
					}
					else if (matchedData.length === 0 && specific) {
						throw new Error('SIZE NOT FOUND')
					}
					else {
						switch (this.products[0].size) {
							case 'SMALLEST': sizeData = matchedData[0]
								break;
							case 'LARGEST': sizeData = matchedData[matchedData.length - 1];
								break;
							case 'RANDOM': sizeData = matchedData[Math.floor(Math.random() * parseInt(matchedData.length))];
								break;
							default:
								sizeData = matchedData[0]
								this.productSizeName = sizeData.name;
								this.setSizeName();
								if (!sizeData.stock_level) {
									throw new Error('OOS')
								}

						}
					}

					if (sizeData) {

						this.productSizeName = sizeData.name;
						this.productColour = styleName;
						this.sizeId = sizeData.id;
						this.styleId = styleId;
						this.productImageUrl = imageUrl;

						logger.verbose(`[T:${this.id}] [${this.styleId}] Matched Style: ${this.productColour}.`);
						logger.verbose(`[T:${this.id}] [${this.sizeId}] Matched Size : ${this.productSizeName}.`);
						global.monitors.supreme.url[this.productUrl].remove(this.id);
						this.setSizeName();
						this.isMonitoring = false;
						resolve();
						return;
					}
					else {
						logger.error('Style Not Found.');
						let errorDelay = settings.has('globalErrorDelay') ? settings.get('globalErrorDelay') : 1000;
						return setTimeout(runStage.bind(this), errorDelay);
					}
				}
				catch (error) {
					switch (error.message) {
						case 'OOS':
							this.setStatus('OOS. Retrying.', 'ERROR');
							logger.error(`[T:${this.id}] [${this.productName}] OOS`);
							break;

						case 'SIZE NOT FOUND':
							this.setStatus('Size Not Found', 'ERROR');
							logger.error(`[T:${this.id}] [${this.productName}] Size Not Found`);
							break;

						default:
							this.setStatus('Error. Retrying', 'ERROR');
							console.log(error);

					}
					let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
					return setTimeout(runStage.bind(this), monitorDelay);
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
					this.page.goto(this.mobileUrl + '/' + this.styleId, { waitUntil: 'networkidle2' });


					this.setStatus('Loading Page', 'INFO')
					await this.page.waitForSelector('.cart-button');
					this.setStatus('Carting.', 'WARNING');
					const cartButtonText = await this.page.$eval('.cart-button', button => button.innerHTML);
					if (cartButtonText === 'sold out') {
						let err = new Error();
						err.code = 'Out of Stock.';
						reject(err);
					}

					else {
						await this.page.waitForSelector('select[name="size-options"]');
						await this.page.select('select[name="size-options"]', '' + this.sizeId);

						this.setStatus('Delaying ATC.', 'WARNING');
						await this.page.waitFor(this.taskData.delays.cart || 0);
						this.setStatus('Carting.', 'WARNING');
						await this.page.tap('span.cart-button');
						await this.page.waitForResponse(`${this.baseUrl}/shop/${this.productId}/add.json`)
						this.setStatus('Added to Cart.', 'SUCCESS');
					}
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
				let paymentInfo = this.profile.payment;
				
				await this.page.goto(this.baseUrl + '/mobile#checkout');	
				await this.page.waitFor('#order_billing_name');

				this.setStatus('Filling Checkout Form.', 'WARNING');
				if (this.region === 'EU') {
					await this.page.select('select#credit_card_type', this.profile.payment.type);
				}
				await this.page.tap('input[placeholder="credit card number"]');
				await this.page.evaluate(`$('input[placeholder="credit card number"]').val('${this.profile.payment.cardNumber.replace(/\s/g, '')}')`)
				
				await this.page.select('select#credit_card_month', this.profile.payment.expiryMonth);
				await this.page.select('select#credit_card_year', paymentInfo.expiryYear);
				
				await this.page.tap('input[placeholder="cvv"]');
				await this.page.type('input[placeholder="cvv"]', paymentInfo.cvv, { delay: 1 });
				
				await this.page.tap('#order_terms');

				// if (this.hasCaptcha) {
				// 	this.setStatus('Waiting for Captcha', 'WARNING');
				// 	await this.requestCaptcha();
				// }

				this.setStatus('Delaying Checkout', 'WARNING');
				await utilities.sleep(this.taskData.delays.checkout || 0);

				this.setStatus('Submitting Checkout', 'WARNING');
				this.checkoutTime = Date.now();
				this.checkoutAttempts++;

				await checkout.submitForm.bind(this)();
				await this.page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML = "${this.captchaResponse}"`);
				await this.page.tap('#submit_button');
				this.page.on('response', async response => {
					if (response.url() === `${this.baseUrl}/checkout.json`) {
						let body = JSON.parse(await response.text());
						console.log(body)
						this.checkoutData = body;
						resolve();
					}
				})
			}
			catch (err) {
				c	
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
							console.log(error)
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
	fetchStockData,
	fetchProductData,
	cartProduct,
	checkoutProduct,
	processStatus
}