const cart = require('./cart');
const checkout = require('./checkout');
const ticket = require('./ticket');
const { convertSize, cookies, keywords, logger, utilities } = require('../../other');
const { URLMonitor } = require('../../monitors/supreme');

const cheerio = require('cheerio');
const uuidv4 = require('uuid/v4');
const settings = require('electron-settings');
const ipcWorker = require('electron').ipcRenderer;


function findProduct() {
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
			this.isMonitoringKW = true;

			global.monitors.supreme.kw.add(this.id, searchInput, category, (name, id, price) => {
				this.isMonitoringKW = false;
				if (maxPrice > 0 && (price / 100) > maxPrice) {
					this.setStatus('Price Exceeds Limit.', 'ERROR');
					reject(new Error('PRICE LIMIT'));
					return;
				}
				this.startTS = Date.now();
				this.productId = id;
				this.productName = name;
				this.productUrl = this.baseUrl + '/shop/' + this.productId;

				cookies.set.bind(this)('www.supremenewyork.com', 'shoppingSessionId', new Date().getTime());
				this.setProductName();
				resolve();
				return;
			})
		}
		runStage.bind(this)();
	})
}

function getProductData() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop ) return this.stop();
			logger.warn(`[T:${this.id}] Adding to Url Monitor.`);
			this.setStatus('Fetching Product Data.', 'WARNING');
			this.isMonitoring = true;

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
									console.log('SIZE:',this.products[0].size)
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
							this.setSizeName();
								break;
							case 'LARGEST': sizeData = matchedData[matchedData.length - 1];
							this.setSizeName();
								break;
							case 'RANDOM': sizeData = matchedData[Math.floor(Math.random() * parseInt(matchedData.length))];
							this.setSizeName();
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
						this.setSizeName();
						this.productSizeName = sizeData.name;
						this.productColour = styleName;
						this.sizeId = sizeData.id;
						this.styleId = styleId;
						this.productImageUrl = imageUrl;

						logger.verbose(`[T:${this.id}] [${this.styleId}] Matched Style: ${this.productColour}.`);
						logger.verbose(`[T:${this.id}] [${this.sizeId}] Matched Size : ${this.productSizeName}.`);
						global.monitors.supreme.url[this.productUrl].remove(this.id);
						
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
	return new Promise((resolve, reject) => {
		async function runStage() {
			try {
				if (this.shouldStop) return this.stop();
				//Get First _Ticket
				this.setStatus('Generating Cookies', 'WARNING');
				logger.debug('Fetching Ticket #1')

				let response = await ticket.get.bind(this)()
				let body = response.body;
				console.log(body)

				//User Agent used to Generate Ticket
				if (body.userAgent) { this.userAgent = body.userAgent; }

				//Parsed ATC Form
				if (body.atcData && typeof body.atcData.atcForm === 'object') {
					this.atcForm = body.atcData.atcForm;
				}

				// Pre-Cart Ticket
				if (body.ticket && body.ticket.value) {
					let ticketValue = body.ticket.value;
					cookies.set.bind(this)(this.baseUrl, ticketValue.split('=')[0], ticketValue.split('=')[1]);
				}

				let cartDelay = !this.restockMode ? this.taskData.delays.cart : 0;

				//Delay ATC
				this.setStatus('Delaying ATC.', 'WARNING');
				logger.debug(`Delaying ATC (${cartDelay}ms).`)
				await utilities.sleep(cartDelay);
				
				if (this.shouldStop) return this.stop();
				
				//ATC Request
				this.setStatus('Adding to Cart.', 'WARNING');
				response = await cart.add.bind(this)();

				//Handle ATC Response
				body = response.body;
				logger.info(`[T:${this.id}] Cart Response:\n${JSON.stringify(response.body, null, '\t')}`);
				if (
					(body.hasOwnProperty('length') && !body.length > 0) ||
					(body.hasOwnProperty('success') && !body.success) ||
					(body.hasOwnProperty('length') && !response.body[0].in_stock)
				) {
					throw new Error('OOS');
				}

				let pureCart; let _ticket;

				pureCart = cookies.get.bind(this)(this.baseUrl.replace('https://', ''), 'pure_cart').value || null
				_ticket = cookies.get.bind(this)(this.baseUrl.replace('https://', ''), 'ticket').value || '';

				if (_ticket) {
					logger.debug(`Ticket: ${ticket}`);
					this.ticket = _ticket;
				}
				if (pureCart) {
					let cookieValue = JSON.parse(decodeURIComponent(pureCart));
					delete cookieValue.cookie;
					this.cookieSub = encodeURIComponent(JSON.stringify(cookieValue));
				}

				resolve();
			}
			catch (error) {
				switch (error.message) {
					case 'STOP':
						return this.stop();

					case 'OOS':
						this.setStatus('Out of Stock.', 'ERROR');
						logger.error('OOS');
						break;

					default:
						console.log(error);
				}
				return setTimeout(runStage.bind(this), 1000)
			}
		}
		runStage.bind(this)();
	})
}

function checkoutProduct() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			try {
				if (this.shouldStop) return this.stop();
				cookies.set.bind(this)('www.supremenewyork.com', 'lastVisitedFragment', 'checkout');
				this.setStatus("Parsing Checkout Form.");
				//Fetch Mobile Page
				let response = await checkout.fetchForm.bind(this)();
				//Parse Checkout Form
				await checkout.handleFetchForm.bind(this)(response);

				if (this.shouldStop) return this.stop();
				if (
					this.region === 'eu' &&
					!this.taskData.additional.enableThreeDS/*bypass*/
				) {
					this.setStatus('Initialising 3DS.', 'WARNING');
					logger.debug(`[T:${this.id}] Fetching Mobile Totals.`);
					//Fetch Mobile Totals
					response = await checkout.fetchMobileTotals.bind(this)();
					let body = response.body;
					let $ = cheerio.load(body);
					let serverJWT = $('#jwt_cardinal').val();
					let orderTotal = $('#total').text();

					if (orderTotal) {
						logger.info(`Order Total:\n${this.orderTotal}`);
						this.orderTotal = orderTotal;

					}
					if (serverJWT) {
						logger.info(`Initial JWT:\n${this.cardinal.serverJWT}`);
						this.cardinal.serverJWT = serverJWT;
					}

					//Setup 3D Secure
					await checkout.setupThreeDS.bind(this)();
				}

				if (this.shouldStop) return this.stop();

				// //Request Captcha	
				if (this.hasCaptcha) {
					await this.requestCaptcha();
				}

				if (this.shouldStop) return this.stop();

				//Delay Checkout
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
					await utilities.sleep(checkoutDelay);
				}
				if (this.shouldStop) return this.stop();
				//Fetch Post-Cart Ticket
				this.setStatus('Generating Ticket #2', 'WARNING');
				response = await ticket.get.bind(this)();
				let body = response.body;
				if (body.ticket && body.ticket.value) {
					let ticketValue = body.ticket.value;
					cookies.set.bind(this)(this.baseUrl, ticketValue.split('=')[0], ticketValue.split('=')[1]);

				}
				// })
				//Submit Checkout
				// .then(() => {
				if (this.shouldStop) return this.stop();
				logger.warn('Submitting Checkout.');
				this.setStatus('Submitting Checkout.', 'WARNING');

				this.checkoutAttempts++;
				this.checkoutTS = Date.now();
				this.checkoutTime = this.checkoutTS - this.startTS;

				response = await checkout.submit.bind(this)();
				// })
				// //Handle Checkout Response
				// .then(response => {
				if (this.shouldStop) return this.stop();
				this.checkoutData = response.body;
				resolve()
				// 	return Promise.resolve();
				// })
				//Error Handling	
				// .catch(error => {
				// 	if (error.message === "STOP") return this.stop();
				// 	console.error(error);
				// 	return setTimeout(runStage.bind(this), 1000);
				// })
			}
			catch(error) {
				switch(error.message) {
					default:
						this.setStatus('Error Checking Out', 'ERROR');
						console.log(error);
				}
				return setTimeout(runStage.bind(this), 1000);
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
				logger.info(`Checkout Status:\n${JSON.stringify(this.checkoutData, null, '\t')}`);

				switch (this.checkoutData.status) {
					case 'queued':
						this.setStatus('Processing...', 'WARNING');
						logger.warn(this.slug ? `[T.${this.id}] Queued - ${this.slug}.` : `[T.${this.id}] Queued.`);
						if (this.checkoutData.hasOwnProperty('slug')) this.slug = this.checkoutData.slug;
						return setTimeout(runStage.bind(this, false), 1000);


					case 'failed':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						if (!this.checkoutData.errors) {
							this.setStatus('Payment Failed.', 'ERROR');
							logger.error(`[T.${this.id}] Payment Failed.`);
							if (this.checkoutAttempts < this.taskData.setup.checkoutAttempts) {
								return setTimeout(this.retryCheckout.bind(this), 1000)
							}
							else {
								err = new Error();
								err.code = 'FAILED'
								return resolve()
							}
						}
						else return this.setStatus('Form Error.', 'ERROR');


					case 'cca':
						this.setStatus('CCA', 'WARNING')
						this.cardinal.tid = uuidv4();
						this.cardinal.transactionId = this.checkoutData.transaction_id;
						this.cardinal.authentication.url = this.checkoutData.acs_url;
						this.cardinal.authentication.payload = this.checkoutData.payload;
						this.cardinal.consumerData = this.checkoutData.consumer;

						function authHandler() {
							return new Promise((resolve, reject) => {
								ipcWorker.once(`cardinal.validated(${this.id})`, (event, args) => {
									console.log('[IPC', `cardinal.validated(${this.id})\n`, args);
									if (args.responseJWT) {
										logger.debug('Payment Success');
										resolve();
									}
									else {
										logger.debug('Payment Failure');
										reject()
									}
								})
								ipcWorker.send('cardinal.continue', {
									taskId: this.id,
									cardData: {
										"AcsUrl": this.cardinal.authentication.url,
										"Payload": this.cardinal.authentication.payload,
									},
									cardOData: {
										"Consumer": this.cardinal.consumerData,
										"OrderDetails": {
											TransactionId: this.cardinal.transactionId
										}
									}
								})

							})

						}
						authHandler.bind(this)()
							.then(() => {
								return checkout.submit.bind(this)('cardinal');
							})

							.then(response => {
								console.log(response.body);
								this.checkoutData = response.body;
								return Promise.resolve();
							})
							.then(() => {
								setTimeout(runStage.bind(this, false), 1000);
								return Promise.resolve();
							})
							.catch(error => {
								console.log(error);

							})
						break;


					case 'cardinal_queued':
						this.setStatus('Processing...', 'WARNING');
						logger.warn(`[T.${this.id}] Cardinal Queued.`);
						return setTimeout(runStage.bind(this, false), 1000);


					case 'paid':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						this.successful = true;

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
						console.log(this.checkoutData)
						this.setStatus('Unexpected Error', 'ERROR');
						error = new Error();
						error.code = 'UNEXPECTED';
						reject(error);
				}
			}
			catch (error) {
				switch (error.code) {
					case 'UNEXPECTED':
					default:
						console.log(error)
						this.setStatus('Error. Retrying.');
						let errorDelay = settings.has('errorDelay') ? settings.get('errorDelay') : 1000;
						this.setTimeout(runStage.bind(this, isCheckoutResponse), errorDelay);
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