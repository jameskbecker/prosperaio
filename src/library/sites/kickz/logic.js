const cart = require('./cart');
const checkout = require('./checkout');
const buildForm = require('./form-builder');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { cookies, utilities, logger } = require('../../other');
const cheerio = require('cheerio');
exports.generateCookies = function () {
	return new Promise(async resolve => {
		this.setStatus('Generating Cookies.', 'WARNING');
		puppeteer.use(StealthPlugin())
		try {
			this.browser = await puppeteer.launch({ headless: true })
			this.page = await this.browser.newPage();
			await this.page.goto('https://www.kickz.com');
			await this.page.hover('*');
			await this.page.click('*');
			let pageCookies = await this.page.cookies();
			let validAbck = false;
			for (let i = 0; i < pageCookies.length; i++) {
				if (pageCookies[i].name === '_abck' && pageCookies[i].value.includes('~0~')) {
					logger.verbose(`Valid _abck: ${pageCookies[i].value}`);
					validAbck = true;
				}
				else {
					cookies.set.bind(this)('https://' + pageCookies[i].domain, pageCookies[i].name, pageCookies[i].value);
				}
			}
			if (validAbck) resolve();
			else {
				console.log(pageCookies)
			}

		}
		catch (error) { console.error(error) }
	})
}

exports.cart = function () {
	return new Promise((resolve, reject) => {
		async function runStage() {
			this.setStatus('Fetching Cart Data.', 'INFO')
			cart.fetchData.bind(this)()
				.then(response => {
					let $ = cheerio.load(response.body);
					let ttokenElement = $('input#ttoken')
					if (ttokenElement) {
						cartToken = ttokenElement.val();
						this.cartToken = cartToken;
					}

					let matchedSizeElements = $(`[id*="US"][data-size="${this.sizeCode}"]`);
					if (matchedSizeElements.length === 0) {
						let error = new Error();
						error.message = `Size Not Found`;
						return Promise.reject(error);
					}

					let matchedSizeData = matchedSizeElements[0].attribs.onclick;
					let variantId = matchedSizeData.replace(/( |')/g, '').split(',\n')[1];
					if (!variantId) {
						let error = new Error();
						error.message = `VARIANT_NOT_FOUND`;
						return Promise.reject(error);
					}

					this.variantId = variantId;
					return Promise.resolve();
				})
				.then(() => { return utilities.sleep(this.taskData.delays.cart) })
				.then(() => {
					this.setStatus('Adding to Cart.', 'WARNING')
					return cart.add.bind(this)()
				})
				.then(response => {
					let body = response.body;
					if (body.isError) {
						logger.error(`[${this.id}] Error Adding to Cart.`);
					}
					if (body.msg) {
						logger.error(`[${this.id}] ${body.msg}`)
					}
					let cartData = response.body.prod;
					let productData = response.body.productVariantJSON;
					if (productData) {
						this.setProductName(productData.name);
					}
					if (!cartData) {

					}
					this.setStatus('Carted Product!', 'SUCCESS');
					cookies.set.bind(this)(this.baseUrl, '_basket_visited', 'true');
					cookies.set.bind(this)(this.baseUrl, 'kickz_visited', 'true');
					cookies.set.bind(this)(this.baseUrl, 'BT _ctst', '101');
					cookies.set.bind(this)(this.baseUrl, 'SHOP_ACTION', 'checkout-input');
					return Promise.resolve();
				})
				.then(() => { return cart.get.bind(this)() })
				.then(response => {
					this.setStatus('Fetched Cart Page', 'INFO');
					resolve();
				})
				.catch(error => {
					this.setStatus('Error Carting Product.', 'ERROR');
					logger.error(`[${this.id}] ${error.message}.`);
					//return setTimeout(runStage.bind(this), 1000)
				})
		}
		runStage.bind(this)();
	})
}

exports.reserve = function () {
	return new Promise((resolve, reject) => {
		async function runStage() {
			try {
				this.setStatus('Reserving Cart.', 'WARNING')

				checkout.reserveBasketItems.bind(this)()
				.then(response => {
					try {
						let body = response.body;
						switch (body.state) {
							case 'REQUESTED':
								logger.debug('Requested Cart Reservation');
								return setTimeout(runStage.bind(this), 500);

							case 'RESERVED':
								logger.debug('Reserved Cart!');
								this.setStatus('Reserved Cart!', 'SUCCESS');
								return resolve();

							case 'NEW':
								break;

						}
						console.log(body)
						if (body.infoMessages.length > 0) {
							logger.error(body.infoMessages.join('\n'))
						}
						if (body.errorMessages.length > 0) {
							logger.error(body.errorMessages[0])
						}
						logger.debug('Error Reserving Cart.');
						logger.error('Error Reserving Cart.', 'ERROR');
						return setTimeout(runStage.bind(this), 1000);
					}
					catch(error) {}
				})
				.catch(error => {
					if (error.name === "StatusCodeError") {
						switch (error.statusCode) {
							case 403:
								this.setStatus('Access Denied.', 'ERROR');
								break;
						}
					}
					logger.error(error.message)
				});
			}
			catch (err) {
				switch (err.code) {
					case 'REQUESTED':
					//return setTimeout(runStage.bind(this), 250);

					default:
						console.log(err);
						this.setStatus('Error Reserving Cart.', 'ERROR');
					//return setTimeout(runStage.bind(this), this.taskData.delays.error);
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.checkout = function () {
	return new Promise((resolve, reject) => {
		function runStage() {
			//await this.requestCaptcha();
			//checkout.loginOffer.bind(this)();
			this.setStatus('Submitting Address.', 'WARNING');
			checkout.addressHint.bind(this)()
			.then (response => {
				console.log(response.body)
				return Promise.resolve();
			})
			.then(() => {
				this.setStatus('Submitting Payment Summary.', 'WARNING');
				return checkout.paymentSummarySubmit.bind(this)();
			})
			.then(response => {
				console.log(response.body)
				return Promise.resolve();
			})
			.then(() => {
				this.setStatus('Requesting Payment Method.', 'WARNING');
				return checkout.paymentMethodSubmit.bind(this)();
			})
			.then(response => {
				console.log(response)
				this.payloadUrl = response.headers.location;
				this.paypalUrl = response.headers.location;
				console.log(this.payloadUrl)
				//resolve();
			})
			.catch(error => {
				console.error(error);
			})
		}
		runStage.bind(this)();
	})
}
