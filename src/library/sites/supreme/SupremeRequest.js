const SupremeBase = require('./SupremeBase');
const { cookies, utilities, logger } = require('../../other');

const cheerio = require('cheerio');
const ipcWorker = require('electron').ipcRenderer;
const settings = require('electron-settings');

class SupremeRequest extends SupremeBase {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.cardinal = {
			id: '',
			tid: '',
			transactionId: '',
			transactionToken: '',
			serverJWT: '',
			responsePayload: '',
			consumerData: {},
			authentication: {
				url: '',
				payload: ''
			}
		};
	}

	async run() {
		try {
			await this._setTimer();
			this.setStatus('Starting Task.', 'WARNING');
			logger.warn(`[Task ${this.id}] Starting.`);

			//Find Product
			await this._fetchStockData();
			if (this.shouldStop) return this.stop();
			await this._fetchProductData();

			//ATC Process
			if (this.shouldStop) return this.stop();
			await this._atcProcess();

			//Checkout Process
			if (this.shouldStop) return this.stop();
			await this._checkoutProcess();
			await this._processStatus();

			if (this.successful) {
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
			}
			else { console.log('failed') }
			this.isActive = false;

		}
		catch (error) {
			switch (error.code) {
				case 'NO TASK MODE':
					this.isActive = false;
					alert('INVALID TASK MODE');
					return this.stop();

				default:
					console.log(error)
			}
		}
	}

	_atcProcess() {
		return new Promise(async function runStage(resolve, reject) {
			try {
				let cartDelay = !this.restockMode ? this.taskData.delays.cart : 0;
				cookies.set.bind(this)('shoppingSessionId', (new Date().getTime()).toString())

				//ATC Delay
				if (!this.restockMode) {
					this.setStatus('Delaying ATC.', 'WARNING');
					await this._sleep(cartDelay);
				}

				if (this.shouldStop) return this.stop();


				this.setStatus('Adding to Cart.', 'WARNING');
				logger.warn(`[T:${this.id}] Adding ${this.productId} to Cart.`);

				
				cookies.set.bind(this)('lastVisitedFragment', `products/${this.productId}/${this.styleId}`);
				/* ------------------------------------ ATC OPTIONS ------------------------------------ */
				let body = await this._addToCart();
				logger.info(`[T:${this.id}] Cart Response:\n${JSON.stringify(body)}`);
				if (
					(body.hasOwnProperty('length') && !body.length > 0) ||
					(body.hasOwnProperty('success') && !body.success) ||
					(body.hasOwnProperty('length') && !body[0].in_stock)
				) {
					throw new Error('OOS');
				}

				let pureCart = cookies.get.bind(this)('pure_cart') || null
				let ticket = cookies.get.bind(this)('ticket') || '';

				if (ticket) {
					logger.debug(`Ticket: ${ticket}`);
					this.ticket = ticket;
				}

				if (!pureCart) {
					throw new Error('NO PURE CART')
				}
				let cookieValue = JSON.parse(decodeURIComponent(pureCart));
				delete cookieValue.cookie;
				this.cookieSub = encodeURIComponent(JSON.stringify(cookieValue));
				this.setStatus('Added to Cart!', 'SUCCESS');
				resolve();
			}
			catch (error) {
				switch (error.message) {
					case 'OOS':
						this.setStatus('Out of Stock.', 'ERROR');
						logger.error('OOS');
						//TODO: MAKE IT ENTER RESTOCK MODE
						break;

					default:
						this.setStatus('ATC Error', 'ERROR');
						console.error(error);
				}
				let errorDelay = settings.has('globalErrorDelay') ? settings.get('globalErrorDelay') : 1000
				return setTimeout(runStage.bind(this, resolve, reject), errorDelay)
			}
		}.bind(this))
	}

	_checkoutProcess() {
		return new Promise(async function runStage(resolve, reject) {
			try {
				cookies.set.bind(this)('lastVisitedFragment', 'checkout');

				/* ---------------------------- FETCH & PARSE CHECKOUT FORM ----------------------------- */

				this.setStatus("Parsing Checkout Form.", 'WARNING');
				let body = await this._fetchMobile();
				let $ = cheerio.load(body);
				let checkoutTemplate = $("#checkoutViewTemplate").html();
				this.formElements = this._parseCheckoutForm(checkoutTemplate);
				/* ------------------------------------------------------------------------------------- */
				
				if (this.shouldStop) return this.stop();

				/* ---------------------------------- SETUP 3D SECURE ---------------------------------- */

				if (this.region === 'EU' && !this.taskData.additional.enableThreeDS) {
					this.setStatus('Initialising 3DS.', 'WARNING');
					logger.debug(`[T:${this.id}] Fetching Mobile Totals.`);
					
					/* ----------------------------------------------------------------------------------- */
					
					/* ----------------------------------------------------------------------------------- */
					
					//Fetch Mobile Totals
					body = await this._fetchMobileTotals();
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
					this.cardinal.id = await this._setupThreeDS();
				}
				/* ------------------------------------------------------------------------------------- */

				if (this.shouldStop) return this.stop();

				/* ---------------------------------- REQUEST CAPTCHA ---------------------------------- */
				
				if (this.hasCaptcha) { 
					await this.requestCaptcha() 
				}
				/* ------------------------------------------------------------------------------------- */

				if (this.shouldStop) return this.stop();				
				
				/* ----------------------------------- DELAY CHECKOUT ---------------------------------- */
				
				if (!this.restockMode) {
					this.setStatus('Delaying Checkout.', 'WARNING');
					let checkoutDelay;
					if (!this.captchaTime) { 
						checkoutDelay = this.taskData.delays.checkout; 
					}
					else { 
						checkoutDelay = this.taskData.delays.checkout - this.captchaTime; 
					}
					if (checkoutDelay < 0) {
						checkoutDelay = 0;
					}
		
					await this._sleep(checkoutDelay);
				}
				/* ------------------------------------------------------------------------------------- */
				
				if (this.shouldStop) return this.stop();

				/* ---------------------------------- SUBMIT CHECKOUT ---------------------------------- */
				logger.warn('Submitting Checkout.');
				this.setStatus('Submitting Checkout.', 'WARNING');
				this.checkoutAttempts++;
				this.checkoutTS = Date.now();
				this.checkoutTime = this.checkoutTS - this.startTS;
			
				body = await this._submitCheckout();
				this.checkoutData = body;
				resolve();
			}
			catch (error) {
				switch (error.message) {
					default:
						this.setStatus('Error Checking Out', 'ERROR');
						console.log(error);
				}
				return setTimeout(runStage.bind(this), 1000);
			}
		}.bind(this))
	}



	
	async _addToCart() {
		if (!this.atcForm) {
			this.atcForm = this._form('cart-add');
		}
		let options = {
			url: `${this.baseUrl}/shop/${this.productId}/add.json`,
			method: 'POST',
			proxy: this.proxy,
			form: this.atcForm,
			timeout: 5000,
			json: true,
			headers: {
				"Accept": "application/json",
				"Accept-Encoding": "gzip, deflate, br",
				"Content-Type": "application/x-www-form-urlencoded",
				"Origin": this.baseUrl,
				"Referer": `${this.baseUrl}/mobile/`,
				"User-Agent": this.userAgent,
				"X-Requested-With": "XMLHttpRequest"
			}
		}

		let response = await this.request(options);
		return response.body;
	}

	async _fetchMobile() {
		let options = {
			url: `${this.baseUrl}/mobile`,
			method: 'GET',
			proxy: this.proxy,
			headers: {
				"Upgrade-Insecure-Requests": "1",
				"User-Agent": this.userAgent
			}
		}
		let response = await this.request(options);
		return response.body;
	}

	async _fetchMobileTotals() {
		let options = {
			url: `${this.baseUrl}/checkout/totals_mobile.js`,
			method: 'GET',
			proxy: this.proxy,
			qs: this._form('mobile-totals')
		}
		let response = await this.request(options);
		return response.body;
	}

	async _submitCheckout() {
	//let path = endpoint !== 'cardinal' ? '/checkout.json' : '/checkout/' + this.slug + '/cardinal.json';
		let options = {
			url: this.baseUrl + '/checkout.json',
			method: 'POST',
			proxy: this.proxy,
			json: true,
			timeout: 7000,
			form: this._form('parsed-checkout'),
			headers: {
				"Accept": "application/json",
				'Accept-Encoding': 'gzip, deflate, br',
				'Origin': this.baseUrl,
				'Referer': this.baseUrl + '/mobile',
				'User-Agent': this.userAgent
			}
		}
		let response = await this.request(options);
		return response.body;
	
	}


	_setupThreeDS() {
		return new Promise(resolve => {
			logger.debug('Submitting Initial JWT.');
			ipcWorker.send('cardinal.setup', {
				jwt: this.cardinal.serverJWT,
				profile: this.profileName,
				taskId: this.id
			})
			ipcWorker.once(`cardinal.setupComplete(${this.id})`, (event, args) => {
				resolve(args.cardinalId);
			})
		})
	}



}

module.exports = SupremeRequest;