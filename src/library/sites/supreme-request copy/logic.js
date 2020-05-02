const cart = require('./cart');
const checkout = require('./checkout');
const cardinal = require('./cardinal');
const pooky = require('./pooky');
const { cookies, keywords, convertSize, logger } = require('../../other');
const uuidv4 = require('uuid/v4');
const settings = require('electron-settings');
const ipcWorker = require('electron').ipcRenderer;
function findProduct() {
	return new Promise((resolve, reject) => {
		async function runStage () {
			try {
				let searchInput = this.taskData.products[0].searchInput;
				if (searchInput.includes(this.baseUrl)) {
					this.startTS = Date.now();
					let desktopUrlExp = /https:\/\/www\.supremenewyork\.com\/shop\/\w{1,}\/(\w{1,})\/?(\w{1,})?/
					let mobileUrlExp = /https:\/\/www\.supremenewyork\.com\/mobile#products\/(\w{1,})\/?(\w{1,})?/;
					this.productUrl = this.products[0].searchInput;
					this.setProductName(searchInput.split('/')[5])
					resolve();
				}
				else if (searchInput.includes('+') || searchInput.includes('-')) {
					this.isMonitoring = true;
					this.setStatus('Fetching Product Url.', 'WARNING');
					global.monitors.supreme.kw.add(this.id, searchInput, this.products[0].category, (name, id, price) => {
						this.isMonitoring = false;
						if (this.taskData.additional.maxPrice != 0 && (price / 100) > this.taskData.additional.maxPrice) {
							this.setStatus('Price Exceeds Limit.', 'ERROR');
							return;
						}
						this.productData.productName = name;
						this.productName = name;
						this.setProductName(name);
						this.productUrl = `${this.baseUrl}/shop/${id}`;
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


					case 'CATEGORY NOT FOUND':
						this.setStatus('Category Not Found.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

					case 'WEBSTORE CLOSED':
						this.setStatus('Store Closed.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

					case 'STOP':
						return this.stop();

					default:
						logger.error(err)
						return setTimeout(runStage.bind(this), 1000);
				}
			}
		}
		runStage.bind(this)();
	})
}

function getProductData() {
	return new Promise((resolve, reject) => {
		this.setStatus('Fetching Product Data.', 'WARNING');
		async function runStage() {
			this.isMonitoring = true;
			global.monitors.supreme.url.add(this.id, this.productUrl, (styles) => {
				this.isMonitoring = false;
				try {
					let sizeData;
					let styleName;
					let styleId;
					let imageUrl;
					for (let i = 0; i < styles.length; i++) {
						if (keywords.isMatch(styles[i].name.toLowerCase(), keywords.parse(this.products[0].style))) {
							logger.verbose(`[${this.id}] MATCHED: ${styles[i].name}`);
							let instockSizes = styles[i].sizes.filter(size => size.stock_level === 1);
							styleName = styles[i].name;
							styleId = styles[i].id
							imageUrl = 'http:' + styles[i].image_url;
							if (!instockSizes.length > 0) {
								let error = new Error();
								error.code = 'OOS'
								throw error;
							}
							switch (convertSize('supreme', this.products[0].size)) {
								case 'SMALLEST':
									sizeData = instockSizes[0]
									break;
								case 'LARGEST':
									sizeData = instockSizes[instockSizes.length - 1];
									break;
								case 'RANDOM':
									sizeData = instockSizes[Math.floor(Math.random() * parseInt(instockSizes.length))];
									break;
								default:
									for (let j = 0; j < instockSizes.length; j++) {
										sizeData = instockSizes[j]
										if (sizeData.name.includes(convertSize('supreme', this.products[0].size))) {
											break;
										}
									}

							}
							break;
						}

					}
					if (sizeData) {
						let sizeName = sizeData.name;
						this.productData.sizeName = sizeName;
						this.productSizeName = sizeName;
						let sizeId = sizeData.id;
						logger.verbose(`Matched Style: ${styleName} - ${styleId}.`)
						logger.verbose(`Matched Size: ${sizeName} - ${sizeId}.`)
						this.setSizeName(sizeName)
						this.productColour = styleName;
						this.sizeId = sizeId;
						this.styleId = styleId;
						this.productImageUrl = imageUrl;
						resolve();
						return;
					}
					else logger.error('Style Not Found.')
				}
				catch (err) {
					switch (err.code) {
						case 'OOS':
							this.setStatus('Monitoring for Restocks.', 'INFO');
							return setTimeout(runStage.bind(this), this.taskData.delays.monitor)

						case 'ETIMEDOUT':
							this.setStatus('Timed Out.', 'ERROR');
							return setTimeout(runStage.bind(this), 1000);

						default:
							return setTimeout(runStage.bind(this), 1000);
					}
				}
			})

		}
		runStage.bind(this)();

	})
}

function cartProduct() {
	return new Promise((resolve, reject) => {
		async function runStage () {
			try {
				if (!this.restockMode) {
					this.setStatus('Generating Pooky.', 'WARNING');
					logger.warn('Fetching Pooky Cookies.')
					try {
						await pooky.setPooky1.bind(this)();
					}
					catch (err) {
						console.log(err)
						console.log('1st api failed trying 2nd')
						if (err.code === 'API2') {
							await pooky.setPooky2.bind(this)();
						}
					}
				}

				this.setStatus('Delaying ATC.', 'WARNING');
				// cookies.set.bind(this)('www.supremenewyork.com', 'lastVisitedFragment', `products/${this.productData.productId}`);
				if (!this.restockMode) await new Promise(resolve => { setTimeout(resolve, this.taskData.delays.cart) });
				this.setStatus('Adding to Cart.', 'WARNING');
				logger.warn(`Adding ${this.productId} to Cart.`);
				await cart.add.bind(this)();
				resolve();
			}
			catch (err) {
				switch (err.code) {
					case 'ETIMEDOUT':
						this.setStatus('Timed Out.', 'ERROR');
						return setTimeout(runStage.bind(this), 1000);

					case 'OOS':
						this.setStatus('Out of Stock.', 'ERROR');
						await getProductData.bind(this)();
						return setTimeout(runStage.bind(this)(), this.taskData.delays.error);

					case 'STOP':
						return this.stop();

					default:
						console.log(err);
						return;
				}
			}
		}
		runStage.bind(this)();
	})
}

function checkoutProduct() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			try {
				cookies.set.bind(this)('www.supremenewyork.com', 'lastVisitedFragment', 'checkout');
				if (this.region === 'eu' && this.taskData.additional.enableThreeDS && this.nextCardinalStage === 'init_jwt') {
					this.setStatus('Initialising 3DS.', 'WARNING');
					logger.debug('Fetching Mobile Totals.');
					await checkout.fetchMobileTotals.bind(this)();
					logger.debug('Submitting Initial JWT.');
					ipcWorker.send('threeDS init', {
						jwt: this.cardinalServerJWT,
						profile: this.profileName,
						taskId: this.id
					})
					ipcWorker.once(`threeDS setup complete - ${this.id}`, async (event, args) => {
						this.cardinalId = args.cardinalId;
						this.setStatus('Parsing Checkout Form', 'WARNING');
						logger.debug('Parsing Checkout Form.')
						await checkout.fetchForm.bind(this)();
						if (this.hasCaptcha) await this.requestCaptcha();
						if (!this.restockMode) {
							let checkoutDelay;
							if (!this.captchaTime) {
								checkoutDelay = this.taskData.delays.checkout;
							}
							else {
								checkoutDelay = this.taskData.delays.checkout - this.captchaTime;
							}
							if (checkoutDelay < 0) checkoutDelay = 0;

							this.setStatus('Delaying Checkout.', 'WARNING');
							await new Promise(resolve => { setTimeout(resolve, checkoutDelay) });
						}

						this.setStatus('Submitting Checkout.', 'WARNING');
						logger.warn('Submitting Checkout.');
						this.checkoutAttempts++;
						this.checkoutTS = Date.now();
						this.checkoutTime = this.checkoutTS - this.startTS;

						await checkout.submit.bind(this)();
						resolve();
					})
					//await cardinal.submitInitJWT.bind(this)();
					this.nextCardinalStage = 'open_cca';
					resolve();
				}
				this.setStatus("Parsing Checkout Form.");
				await checkout.fetchForm.bind(this)();
				this.setStatus("Submiting Checkout.");
				await checkout.submit.bind(this)();
				resolve();
			}
			catch (err) {
				switch (err.code) {
					case 'ETIMEDOUT':
						this.setStatus('Timed Out.', 'ERROR');
						return setTimeout(runStage.bind(this), 1000);
					case 'STOP':
						return this.stop();
					default:
						let error = new Error();
						error.code = 'FAILED';
						return reject(error);
				}
			}
		}
		runStage.bind(this)();
	})
}

function processStatus() {
	return new Promise((resolve, reject) => {
		let requestedAuth = false;
		async function runStage(isCheckoutResponse = false) {
			try {
				if (!isCheckoutResponse) await checkout.pollStatus.bind(this)();
				let error;
				logger.info(`Checkout Status:\n${JSON.stringify(this.checkoutData)}`);
				switch (this.checkoutData.status) {
					case 'queued':
						this.setStatus('Queued.', 'WARNING');
						logger.warn(this.slug ? `Queued - ${this.slug}` : 'Queued.');
						if (this.checkoutData.hasOwnProperty('slug')) this.slug = this.checkoutData.slug;
						return setTimeout(runStage.bind(this, false), 1000);


					case 'failed':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						if (!this.checkoutData.errors) {
							this.setStatus('Payment Failed.', 'ERROR');
							logger.error('Payment Failed.');
							if (this.checkoutAttempts < this.taskData.setup.checkoutAttempts) {
								return setTimeout(checkoutProduct.bind(this), 1000)
							}
							else {
								err = new Error();
								err.code = 'FAILED'
								return reject(err)
							}
						}
						else return this.setStatus('Billing Error.', 'ERROR');


					case 'cca':
						this.setStatus('CCA', 'WARNING')
						if (!requestedAuth) {
							//ipcWorker.send('start CCA', this.checkoutData);
							this.cardinalTid = uuidv4();
							this.transactionId = this.checkoutData.transaction_id;
							this.authUrl = this.checkoutData.acs_url;
							this.authPayload = this.checkoutData.payload;
							this.cardinalConsumerData = this.checkoutData.consumer;

							ipcWorker.send('threeDS continue', {
								cardData: {
									"AcsUrl": this.checkoutData.acs_url,
									"Payload": this.checkoutData.payload,
								},
								cardOData: {
									"Consumer": this.checkoutData.consumer,
									"OrderDetails": {
										TransactionId: this.checkoutData.transaction_id
									}
								}
							})
							// if (this.nextCardinalStage === 'open_cca') {
							// 	this.setStatus('Initializing 3D Secure.', 'INFO');
							// 	logger.debug('Opening CCA Session.')
							// 	await cardinal.openCCA.bind(this)();
							// 	this.nextCardinalStage = 'request_auth'
							// }

							// if (this.nextCardinalStage === 'request_auth') {
							// 	logger.debug('Setting up Authentication.')
							// 	await cardinal.requestAuth.bind(this)();
							// 	if (this.needsManualAuth) {
							// 		logger.debug('Error Occured with 3D Secure.')
							// 		return
							// 		//await cardinal.fetchAuthHtml.bind(this)();
							// 	}
							// 	this.nextCardinalStage = 'poll_auth'
							// }

							// if (this.nextCardinalStage === 'poll_auth') {
							// 	logger.debug('Polling 3DS Status')
							// 	await cardinal.pollAuthStatus.bind(this)();
							// 	this.nextCardinalStage = 'confirm_transaction'
							// }

							// if (this.nextCardinalStage === 'confirm_transaction') {
							// 	logger.debug('Confirming Transaction.');
							// 	await cardinal.confirmTransaction.bind(this)();
							// 	this.nextCardinalStage = 'close_cca';
							// }

							// if (this.nextCardinalStage === 'close_cca') {
							// 	logger.debug('Closing CCA Session.');
							// 	await cardinal.closeCCA.bind(this)();
							// }

							// this.setStatus('Submitting Checkout.', 'WARNING');
							// logger.warn('Submitting Cardinal Checkout.')
							// await checkout.submit.bind(this)('cardinal');

							// return runStage.bind(this)(true)
						}
						return;


					case 'cardinal_queued':
						this.setStatus('Queued.', 'WARNING');
						logger.warn('Cardinal Queued.');
						return setTimeout(runStage.bind(this, false), 1000);


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
			catch (error) {
				switch(error.code) {
					case 'UNEXPECTED':
					default:
						this.setStatus('Error. Retrying.');
						let errorDelay = settings.has('errorDelay') ? settings.get('errorDelay') : 1000;
						this.setTimeout(rundStage.bind(this, isCheckoutResponse), errorDelay);
				}
			}
		}
		runStage.bind(this)(true);
	})
}

module.exports = { 
	findProduct, 
	getProductData, 
	cartProduct, 
	checkoutProduct, 
	processStatus
}
