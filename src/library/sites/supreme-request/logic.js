const cart = require('./cart');
const checkout = require('./checkout');
const pooky = require('./pooky');
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
				this.productUrl = this.baseUrl + '/shop/' + this.productId;

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
			logger.warn(`[T:${this.id}] Adding to Url Monitor.`);
			this.setStatus('Fetching Product Data.', 'WARNING');
			this.isMonitoring = true;

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
	return new Promise((resolve, reject) => {
		async function runStage() {
			this.setStatus('Generating Ticket #1', 'WARNING');
			//Get ATC _ticket
			ticket.get.bind(this)()
				.then(response => {
					let body = response.body;
					console.log(body)
					if (body.ticket && body.ticket.value) {
						let ticketValue = body.ticket.value;
						cookies.set.bind(this)(this.baseUrl, ticketValue.split('=')[0], ticketValue.split('=')[0]);
						return Promise.resolve();
					}
				})
				//Delay ATC
				.then(() => {
					this.setStatus('Delaying ATC.', 'WARNING');
					let cartDelay = !this.restockMode ? this.taskData.delays.cart : 0;
					return utilities.sleep(cartDelay);
				})

				//ATC Request
				.then(() => {
					if (this.shouldStop) {
						throw new Error('STOP');
					}
					this.setStatus('Adding to Cart.', 'WARNING');
					logger.warn(`[T:${this.id}] Adding ${this.productId} to Cart.`);
					return cart.add.bind(this)();
				})
				//Handle ATC Response
				.then(response => {
					logger.info(`[T:${this.id}] Cart Response:\n${JSON.stringify(response.body, null, '\t')}`);
					if (!response.body.length > 0 || !response.body[0].in_stock) {
						throw new Error('OOS');
					}

					let responseCookies = response.headers['set-cookie'];
					let pureCart;
					let ticket;
					pureCart = cookies.get.bind(this)(this.baseUrl.replace('https://', ''), 'pure_cart')
					ticket = pureCart = cookies.get.bind(this)(this.baseUrl.replace('https://', ''), 'ticket') || '';

					if (ticket) {
						logger.debug(`Ticket: ${ticket}`);
						this.ticket = ticket;
					}
					if (pureCart) {
						this.cookieSub = pureCart;
						resolve();
					}
				})
				.catch(error => {
					if (error.message === "STOP") {
						console.log('hello')
						return this.stop();
					}
					if (error.message === 'OOS') {
						this.setStatus('Out of Stock.', 'ERROR');
						logger.error('OOS')
						return setTimeout(runStage.bind(this), 1000)
					}
					this.setStatus('Failed ATC.', 'ERROR');
					logger.error(`[T:${this.id}] [ATC] ${error.message}.`);
					return setTimeout(runStage.bind(this), 1000)
				})
		}
		runStage.bind(this)();
	})
}

function handlePooky() {
	return new Promise((resolve, reject) => {
		this.setStatus('Generating Pooky.', 'WARNING');
		logger.warn(`[T:${this.id}] Fetching Pooky Cookies.`);
		pooky.setPooky1.bind(this)()
			.then(response => {
				if (this.shouldStop) return Promise.reject(new Error('STOP'));
				let body = response.body;
				logger.info(`Pooky API Response:\n ${JSON.stringify(body, null, '\t')}`)
				for (let i = 0; i < Object.keys(body).length; i++) {
					if (Object.keys(body).includes('pooky')) {
						cookies.set.bind(this)('http://www.supremenewyork.com', Object.keys(body)[i], body[Object.keys(body)[i]]);
					}
				}
				logger.debug(`[T:${this.id} [Pooky] Set Pooky Cookies.`);
				resolve();
			})
			.catch(error => {

				logger.error(`[T:${this.id}] [Pooky] ${error.message}.`);
				resolve();
			})
	})
}

function checkoutProduct() {
	return new Promise((resolve, reject) => {
		function runStage() {
			cookies.set.bind(this)('www.supremenewyork.com', 'lastVisitedFragment', 'checkout');
			this.setStatus("Parsing Checkout Form.");
			//Fetch Mobile Page
			checkout.fetchForm.bind(this)()
				//Parse Checkout Form
				.then(response => {
					if (this.shouldStop) return Promise.reject(new Error('STOP'));
					let body = response.body;
					console.log(body)
					let formElements = [];
					let $ = cheerio.load(body);
					let checkoutWrapper = $("#checkoutViewTemplate").html();
					$ = cheerio.load(checkoutWrapper);
					let checkoutForm = $('form[action="https://www.supremenewyork.com/checkout.json"]').html();
					$ = cheerio.load(checkoutForm);
					$(':input').each(function () {
						let name;
						let placeholder;
						let value;
						let id;
						if ($(this).attr('name')) {

							// name = $(this).attr('name');
							// let tagName = $(this).prop('tagName')
							// if (tagName === 'INPUT' && $(this).val()) value = $(this).val();
							// if ($(this).attr('placeholder')) placeholder = $(this).attr('placeholder');
							// else if ($(this).attr('id')) id = $(this).attr('id');

							// let formElement = {	name };
							// if (placeholder) formElement.placeholder = placeholder;
							// if (value) formElement.value = value;
							// if (id) formElement.id = id;
							formElement = $(this)[0].attribs
							logger.verbose(`Parsed Form Element:\n${formElement.name}`)
							formElements.push(formElement);
						}

					})
					this.formElements = formElements;
					return Promise.resolve();
				})
				//Fetch Mobile Totals
				.then(() => {
					if (this.shouldStop) return Promise.reject(new Error('STOP'));
					if (
						this.region === 'eu' &&
						this.taskData.additional.enableThreeDS
					) {
						this.setStatus('Initialising 3DS.', 'WARNING');
						logger.debug(`[T:${this.id}] Fetching Mobile Totals.`);
						return checkout.fetchMobileTotals.bind(this)();
					}
					else {
						return Promise.resolve();
					}
				})
				//Handle Mobile Totals Response
				.then(response => {
					if (this.shouldStop) return Promise.reject(new Error('STOP'));
					if (response) {
						const body = response.body;
						const $ = cheerio.load(body);
						let serverJWT = $('#jwt_cardinal').val();
						let orderTotal = $('#total').text();

						if (orderTotal) {
							this.orderTotal = orderTotal;
							logger.info(`Order Total:\n${this.orderTotal}`);
						}
						if (serverJWT) {
							this.cardinal.serverJWT = serverJWT;
							logger.info(`Initial JWT:\n${this.cardinal.serverJWT}`);
						}
						return Promise.resolve();

					}
					else {
						return Promise.resolve();
					}

				})
				//Request 3DS Solving
				.then(async () => {
					if (this.shouldStop) return Promise.reject(new Error('STOP'));
					if (
						this.region === 'eu' &&
						this.taskData.additional.enableThreeDS
					) {
						function threeDHandler() {
							return new Promise(resolve => {
								logger.debug('Submitting Initial JWT.');
								ipcWorker.send('cardinal.setup', {
									jwt: this.cardinal.serverJWT,
									profile: this.profileName,
									taskId: this.id
								})
								ipcWorker.once(`cardinal.setupComplete(${this.id})`, (event, args) => {
									this.cardinal.id = args.cardinalId;
									resolve();
								})
							})
						}
						await threeDHandler.bind(this)();
						return Promise.resolve();
					}
					else {
						return Promise.resolve();
					}
				})
				//Request Captcha
				.then(() => {
					if (this.shouldStop) return Promise.reject(new Error('STOP'));
					if (this.hasCaptcha) {
						return this.requestCaptcha();
					}
					else {
						return Promise.resolve();
					}
				})
				//Delay Checkout
				.then(() => {
					if (this.shouldStop) {
						return Promise.reject(new Error('STOP'));
					}
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
						return utilities.sleep(checkoutDelay);
					}
					else {
						return Promise.resolve();
					}
				})
				.then(() => {
					this.setStatus('Generating Ticket #2', 'WARNING');
					return ticket.get.bind(this)();
				})
				.then(response => {
					let body = response.body;
					console.log(body)
					if (body.ticket && body.ticket.value) {
						let ticketValue = body.ticket.value;
						cookies.set.bind(this)(this.baseUrl, ticketValue.split('=')[0], ticketValue.split('=')[0]);
						return Promise.resolve();
					}
				})
				//Submit Checkout
				.then(() => {
					if (this.shouldStop) return Promise.reject(new Error('STOP'));
					logger.warn('Submitting Checkout.');
					this.setStatus('Submitting Checkout.', 'WARNING');

					this.checkoutAttempts++;
					this.checkoutTS = Date.now();
					this.checkoutTime = this.checkoutTS - this.startTS;

					return checkout.submit.bind(this)();
				})
				//Handle Checkout Response
				.then(response => {
					if (this.shouldStop) return Promise.reject(new Error('STOP'));
					this.checkoutData = response.body;
					resolve()
					return Promise.resolve();
				})
				//Error Handling	
				.catch(error => {
					if (error.message === "STOP") return this.stop();
					console.error(error);
					return setTimeout(runStage.bind(this), 1000);
				})
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
						this.setStatus('Queued.', 'WARNING');
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
						this.setStatus('Queued.', 'WARNING');
						logger.warn(`[T.${this.id}] Cardinal Queued.`);
						return setTimeout(runStage.bind(this, false), 1000);


					case 'paid':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						this.setStatus('Success.', 'SUCCESS');
						let privateFields = [];
						let publicFields = [];
						if (this.productColour) {
							let field = {
								name: "Colour:",
								value: this.productColour,
								inline: true
							}
							privateFields.push(field);
							publicFields.push(field);
						}

						if (this.checkoutData.hasOwnProperty("status")) {
							let field = {
								name: "Status:",
								value: this.checkoutData.status.capitalise(),
								inline: true
							}
							privateFields.push(field)
						}

						if (this.cardinal.id) {
							let field = {
								name: "Transaction ID:",
								value: '||' + this.cardinal.id + '||',
								inline: true
							}
							privateFields.push(field);
						}

						this.postPublicWebhook(publicFields);
						this.postPrivateWebhook(privateFields);
						this.addToAnalystics();
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
	handlePooky,
	checkoutProduct,
	processStatus
}