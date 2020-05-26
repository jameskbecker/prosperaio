const Task = require('../Task');
const { utilities, logger } = require('../../other');
const { URLMonitor, KWMonitor } = require('../../monitors/supreme');
const settings = require('electron-settings');
const request = require('request-promise-native');
const cheerio = require('cheerio');
class SupremeBase extends Task {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.restockMode = false;
		this.cookieJar = request.jar();
		this.request = request.defaults({
			jar: this.cookieJar,
			gzip: true,
			timeout: settings.has('globalTimeoutDelay') ? settings.get('globalTimeoutDelay') : 5000,
			resolveWithFullResponse: true
		});
		this.productUrl;
		this.formElements = [];
		this.cookieSub = '';
		this.slug = '';
		this.checkoutAttempts = 0;
		this.checkoutData = {};
		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Snapchat/10.77.0.54 (like Safari/604.1)';
		//Set Region
		switch (this.taskData.site) {
			case 'supreme-eu': this.region = 'EU';
				break;
			case 'supreme-us': this.region = 'US';
				break;
			case 'supreme-jp': this.region = 'JP';
				break;
		}
	}

	set checkoutDelay(delay) {
		if (delay <= 0) this.checkoutDelay = 0;
		else this.checkoutDelay = delay;
	}

	_fetchStockData() {
		return new Promise((resolve, reject) => {
			async function runStage() {
				//Setup Keyword Monitor
				if (!global.monitors.supreme.kw) {
					global.monitors.supreme.kw = new KWMonitor({
						baseUrl: this.baseUrl,
						proxyList: this._proxyList
					});
				}
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
					resolve();
					return;
				})
			}
			runStage.bind(this)();
		})
	}

	_fetchProductData() {
		return new Promise(function runStage(resolve, reject) {		
			if (!global.monitors.supreme.url.hasOwnProperty(this.productUrl)) {
				global.monitors.supreme.url[this.productUrl] = new URLMonitor(this.productUrl, this._proxyList);
			}
			
			
			this.isMonitoring = true;
			if (this.shouldStop) return this.stop();
			this.setStatus('Fetching Product Data.', 'WARNING');
			let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
			global.monitors.supreme.url[this.productUrl].monitorDelay = monitorDelay;
			global.monitors.supreme.url[this.productUrl].add(this.id, (styles) => {
				try {
					if (this.shouldStop) return this.stop();

					let sizeData;
					let styleName;
					let styleId;
					let imageUrl;
					for (let i = 0; i < styles.length; i++) {
						if (this._keywordsMatch(styles[i].name.toLowerCase(), this._parseKeywords(this.products[0].style))) {
							styleName = styles[i].name;
							styleId = styles[i].id
							imageUrl = 'https:' + styles[i].image_url;

							switch (this.products[0].size) {
								case "RANDOM":
									sizeData = styles[i].sizes[Math.floor(Math.random() * styles[i].sizes.length)];
									break;
								case "SMALLEST":
									sizeData = styles[i].sizes[0];
									break;
								case "LARGEST":
									sizeData = styles[i].sizes[styles[i].sizes.length - 1];
									break;
								default:
									sizeData = styles[i].sizes.filter(size => size.name.toLowerCase().includes(this.products[0].size))[0] || null;
							}
							break;
						}
					}

					if (!styleName) {
						throw new Error('Style Not Found');
					}

					if (!sizeData) {
						throw new Error('Size Not Found');
					}

					this.sizeName = sizeData.name;
					this.productColour = styleName;
					this.sizeId = sizeData.id;
					this.styleId = styleId;
					this.productImageUrl = imageUrl;

					logger.verbose(`[T:${this.id}] [${this.styleId}] Matched Style: ${this.productColour}.`);
					logger.verbose(`[T:${this.id}] [${this.sizeId}] Matched Size : ${this.sizeName}.`);

					if (this.taskData.setup.restockMode === 'stock' && !sizeData.stock_level) {
						throw new Error('OOS')
					}

					global.monitors.supreme.url[this.productUrl].remove(this.id);
					this.isMonitoring = false;
					resolve();
				}
				catch (error) {
					switch (error.message) {
						case 'OOS':
							this.setStatus('OOS. Retrying.', 'ERROR');
							logger.error(`[T:${this.id}] [${this.productName}] OOS`);
							break;

						case 'Style Not Found':
							this.setStatus('Style Not Found', 'ERROR');
							logger.error(`[T:${this.id}] Style Not Found`);
							break;

						case 'Size Not Found':
							this.setStatus('Size Not Found', 'ERROR');
							logger.error(`[T:${this.id}] [${this.productName}] Size Not Found`);
							break;

						default:
							this.setStatus('Error. Retrying', 'ERROR');
							console.log(error);

					}
					let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
					return setTimeout(runStage.bind(this, resolve, reject), monitorDelay);
				}
			})


		}.bind(this))
	}

	_parseCheckoutForm(checkoutTemplate) {
		let formElements = [];
		let $ = cheerio.load(checkoutTemplate);
		let checkoutForm = $('form[action="https://www.supremenewyork.com/checkout.json"]').html();
		$ = cheerio.load(checkoutForm);

		$(':input[type!="submit"]').each(function () {
			let formElement = $(this)[0].attribs;
			let output = {};
			let attributes = ["name", "id", "placeholder", "value", "style"]
			attributes.forEach(attribute => {
				if (Object.hasOwnProperty.bind(formElement)(attribute)) {
					output[attribute] = formElement[attribute]
				}
			})
			if (Object.keys(output).length > 0) {
				//logger.verbose(`Parsed Form Element:\n${output.name}`)
				formElements.push(output);
			}
		})
		return formElements;
	}

	_pollStatus() {
		let options = {
			url: this.baseUrl + '/checkout/' + this.slug + '/status.json',
			method: 'GET',
			proxy: utilities.formatProxy(this._getProxy()),
			json: true,
			headers: {
				'accept': 'application/json',
				'accept-encoding': 'gzip, deflate, br',
				'origin': this.baseUrl,
				'referer': this.baseUrl + '/mobile',
				'user-agent': this.userAgent
			}
		}
		return this.request(options);
	}

	_processStatus() {
		return new Promise((resolve, reject) => {
			let requestedAuth = false;
			async function runStage(isCheckoutResponse = false) {
				try {
					if (!isCheckoutResponse) {
						this._pollStatus()
							.then(response => {
								this.checkoutData = response.body;
							})
							.catch(error => {
								return setTimeout(runStage.bind(this), 1000);
							})
					}
					let error;
					logger.info(`Checkout Status:\n${JSON.stringify(this.checkoutData, null, ' ')}`);

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
									error = new Error();
									error.code = 'FAILED'
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
							setTimeout(runStage.bind(this, isCheckoutResponse), errorDelay);
					}
				}
			}
			runStage.bind(this)(true);
		})
	}

	_form(type) {
		let form;
		switch (type) {
			case 'cart-add':
				if (this.region === 'us') {
					form = {
						"s": this.sizeId,
						"st": this.styleId,
						// "ds": 'bog',
						// "ds1": 'bog2',
						// "ns": ((+this.sizeId) + (+this.styleId)),
						"qty": this.products[0].productQty || 1
					}
				}
				else {
					form = {
						"size": this.sizeId,
						"style": this.styleId,
						"qty": this.products[0].productQty || 1
					}
				}
				break;

			case 'mobile-totals':
				form = {
					"order[billing_country]": this.profile.billing.country,
					"cookie-sub": this.cookieSub,
					"mobile": true
				}
				break;

			case 'parsed-checkout':
				form = {
					'g-recaptcha-response': this.captchaResponse
				}
				if (Math.floor(Math.random() * 2)) form['is_from_ios_native'] = '1';

				for (let i = 0; i < this.formElements.length; i++) {
					let element = this.formElements[i];
					if (
						element.hasOwnProperty('style') &&
						element.style.includes('absolute')
					) {
						let name = element.name || element.id;
						form[name] = element.value || '';
					}
					else if (element.placeholder) {
						switch (element.placeholder) {
							case 'full name':
							case 'na‌me':
								form[element.name] = `${this.profile.billing.first} ${this.profile.billing.last}` || '';
								break;

							case 'email':
								form[element.name] = this.profile.billing.email || '';
								break;

							case 'telephone':
								form[element.name] = this.profile.billing.telephone || '';
								break;
							case 'address':
								form[element.name] = this.profile.billing.address1 || '';
								break;

							case 'address 2':
							case 'apt, unit, etc':
								form[element.name] = this.profile.billing.address2 || '';
								break;

							case 'postcode':
							case 'zip':
								form[element.name] = this.profile.billing.zip || '';
								break;
							case 'city':
								form[element.name] = this.profile.billing.city || '';
								break;
							case 'state':
								form[element.name] = this.profile.billing.state || '';
								break;
							case 'credit card number':
								form[element.name] = this.profile.payment.cardNumber || '';
								break;
							case 'cvv':
								form[element.name] = this.profile.payment.cvv || '';
								break;
						}

					}
					else if (element.id && !element.value) {
						switch (element.id) {
							case 'store_credit_id':
								form[element.name] = '';
								break;
							case 'cookie-sub':
								form[element.name] = this.cookieSub || '';
								break;
							case 'order_billing_country':
								form[element.name] = this.profile.billing.country || '';
								break;
							case 'credit_card_type':
								form[element.name] = this.profile.payment.type || '';
								break;
							case 'credit_card_month':
								form[element.name] = this.profile.payment.expiryMonth || '';
								break;
							case 'credit_card_year':
								form[element.name] = this.profile.payment.expiryYear || '';
								break;
						}
					}
					else if (element.name !== 'store_address') {
						form[element.name] = (element.hasOwnProperty('value') ? element.value : '');
					}
				}

				if (this.region === 'EU') {
					form['cardinal_id'] = this.cardinal && this.cardinal.id ? this.cardinal.id : '';
				}
				break;
		}
		logger.verbose(JSON.stringify(form, null, '\t'));
		return form;
	}


}

module.exports = SupremeBase;