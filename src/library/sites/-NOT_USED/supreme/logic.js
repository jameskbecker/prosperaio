const backend = require('./backend');
const frontend = require('./frontend');
const pollStatus = require('./poll');
const { utilities } = require('../../other');
const pooky = require('./pooky');

exports.findProduct = function () {
	return new Promise((resolve, reject) => {
		const runStage = async function () {	
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					
					switch (this.taskData.setup.searchMode) {
						case 'keywords':
							this.setStatus('SEARCHING FOR PRODUCT', 'WARNING')
							await this.checkStockEndpoint('mobile/products.json');
							this.setStatus('FOUND PRODUCT', 'WARNING');
							resolve();
							break;
						case 'url':
							let desktopUrlExp = /https:\/\/www\.supremenewyork\.com\/shop\/\w{1,}\/(\w{1,})\/?(\w{1,})?/
							let mobileUrlExp = /https:\/\/www\.supremenewyork\.com\/mobile#products\/(\w{1,})\/?(\w{1,})?/;

							if (desktopUrlExp.test(this.products[0].searchInput) === true) {
								this.productData.productSKU = this.products[0].searchInput.match(desktopUrlExp)[1];
								resolve();
							}
							else {
								if (mobileUrlExp.test(this.products[0].searchInput) === true) {
									this.productData.productSKU = this.products[0].searchInput.match(mobileUrlExp)[1];
								}
								else {
									this.setStatus('INVALID URL', 'ERROR');
									reject();
								}
							}

							break;
						default: console.log('NO MODE')
					}
				}
				catch (err) {
					switch (err.code) {
						case 'PRODUCT NOT FOUND':
							this.setStatus('PRODUCT NOT FOUND.', 'ERROR');
							setTimeout(runStage.bind(this), this.taskData.delays.monitor);
							break;
						case 'CATEGORY NOT FOUND':
							this.setStatus('CATEGORY NOT FOUND.', 'ERROR');
							setTimeout(runStage.bind(this), this.taskData.delays.monitor);
							break;

						case 'ETIMEDOUT':
							this.setStatus('TIMED OUT', 'ERROR');
							setTimeout(runStage.bind(this), this.taskData.delays.error);
							break;
						default: console.log(err)

					}
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.getProductData = function () {
	return new Promise((resolve, reject) => {
		const runStage = async function () {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					let startTime = Date.now();
					this.setStatus('CHECKING STOCK', 'WARNING');
					await this.checkProductEndpoint();
					this.setStatus('FOUND PRODUCT STYLE', 'WARNING');
					this.times.fetchedProductData = Date.now() - startTime;
					console.log('fetched product data in:', this.times.fetchedProductData, 'ms')
					resolve();
				}
				catch (err) {
					switch (err.code) {
						case 'OUT OF STOCK':
							this.setStatus('OUT OF STOCK', 'ERROR');
							setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
								break;
							case 'SIZE NOT FOUND':
								this.setStatus('SIZE NOT FOUND', 'ERROR');
								setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
							break;
						case 'STYLE NOT FOUND':
							this.setStatus('STYLE NOT FOUND', 'ERROR');
							setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
							break;
						case 'VARIANT NOT FOUND':
							this.setStatus('VARIANT NOT FOUND.', 'ERROR');
							setTimeout(runStage.bind(this), this.taskData.delays.monitor);
							break;
					}
				}

			}
		}
		runStage.bind(this)();

	})
}

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
					switch (this.taskData.setup.mode) {
						case 'request':
							this.setStatus('DELAYING', 'WARNING');
							await utilities.sleep(this.taskData.delays.cart);
							this.setStatus('ATTEMPTING TO CART', 'WARNING');
							await backend.cart.addCart.bind(this)();
							this.setStatus('CARTED PRODUCT', 'WARNING');
							this.times.cart = Date.now() - this.startTime;
							console.log('carted in:', this.times.cart, 'ms')
							resolve();
							break;
						case 'browser':
							await frontend.cart.addCart.bind(this)();
							this.setStatus('CARTED PRODUCT', 'WARNING')();
							resolve();
							break;
						default:
					}
					// switch (this.taskData.setup.mode) {
					// 	case 'request-mobile':
					// 		this.setStatus('DELAYING', 'WARNING');
					// 		await utilities.sleep(this.taskData.delays.cart);
					// 		this.setStatus('ATTEMPTING TO CART', 'WARNING');
					// 		await backend.cart.addCart.bind(this)();
					// 		this.setStatus('CARTED PRODUCT', 'WARNING');
					// 		this.times.cart = Date.now() - this.startTime;
					// 		console.log('carted in:', this.times.cart, 'ms')
					// 		resolve();
					// 		break;
					// 	case 'browser-mobile':
					// 		await frontend.cart.addCart.bind(this)();
					// 		this.setStatus('CARTED PRODUCT', 'WARNING')();
					// 		resolve();
					// 		break;
					// 	case 'browser-desktop':
					// 		await frontend.cart.addCartDesktop.bind(this)();
					// 		this.setStatus('CARTED PRODUCT', 'WARNING');
					// 		resolve();
					// 	case 'hybrid':
					// 		// let cookies = await frontend.session.getCookies.bind(this)();
					// 		// console.log(cookies)
					// 		reject();
					// 		break;
					// 	default:
					// 		this.setStatus('INVALID TASK MODE', 'ERROR');
					// 		let err = new Error;
					// 		err.code = 'NO TASK MODE'
					// 		reject(err);
					// }
				}
				catch (err) {
					switch (err.code) {
						case 'OUT OF STOCK':
							this.setStatus('OUT OF STOCK', 'ERROR')();
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
				let startTime = Date.now();
				try {
					switch (this.taskData.setup.mode) {
						case 'request':
							if (this.taskData.additional.pookyBypass === true && this.restockMode === false) {
								this.setStatus('HANDLING POOKY', 'WARNING')
								await pooky.getCookies.bind(this)();
							}
							await this.requestCaptcha();
							this.setStatus('SUBMITTING PAYMENT', 'WARNING')();
							await backend.checkout.postMobile.bind(this)();
							this.checkoutTime = Date.now() - this.startTime;
							this.setStatus('PROCESSING', 'WARNING');
							this.checkoutAttempts++;
							
							
							callback.bind(this)();
							resolve();
							break;
						case 'browser':
								this.setStatus('SUBMITTING PAYMENT', 'WARNING')();
							if (this.taskData.setup.platform === 'mobile') await frontend.checkout.fillForm.bind(this)();
							else if (this.taskData.setup.platform === 'desktop') await frontend.checkout.fillFormDesktopEu.bind(this)();
							else throw Error;
							this.setStatus('PROCESSING', 'WARNING');
							this.checkoutAttempts++;
							callback.bind(this)();
							this.checkoutTime = Date.now() - this.startTime;
							resolve();
							break;
						default:
					}

				}
				catch (err) {
					switch (err.code) {
						case 'INVALID PAYMENT':
							this.setStatus('INVALID PAYMENT INFO', 'ERROR')();
							this.isActive = false;
							reject(null);
							break;
						case 'TERMS UNACCEPTED':
							this.setStatus('TERMS NOT ACCEPTED', 'ERROR')();
							this.isActive = false;
							reject(null);
							break;
						case 'INVALID BILLING':
							this.setStatus('INVALID BILLING INFO', 'ERROR')();
							this.isActive = false;
							reject(null);
							break;
						case 'NO CAPTCHA':
								this.times.checkout = Date.now() - startTime;
								console.log('submitted checkout in:', this.times.checkout, 'ms');
							this.setStatus('CAPTCHA TOKEN REQUIRED', 'ERROR')();
							this.isActive = false;
							reject(null);
							break;
						default:
							console.log(err)
					}
				}

			}
		}

		async function checkStatus() {
			try {
				console.log(this.slug);
				this.setStatus('PROCESSING', 'WARNING');
				await pollStatus.getPoll.bind(this)();
			}
			catch (err) {
				switch (err.code) {
					case 'QUEUED':
						setTimeout(checkStatus.bind(this), this.taskData.delays.error);
						break;
					case 'OOS':
						this.setStatus('OUT OF STOCK', 'ERROR')();
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
						this.setStatus(`CARD DECLINED [${this.checkoutAttempts}]`, 'ERROR')();
						if (this.checkoutAttempts < this.taskData.setup.checkoutAttempts) {
							setTimeout(runStage.bind(this, checkStatus), this.taskData.delays.error);
						}
						else {
							resolve();
						}


						break;
					case 'PAYMENT ERROR':
						this.setStatus(`PAYMENT ERROR [${this.checkoutAttempts}]`, 'ERROR')();
						if (this.checkoutAttempts < this.taskData.checkoutAttempts + 0) {

							setTimeout(runStage.bind(this, checkStatus), this.taskData.delays.error);
						}
						else {

							reject(null);
						}

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
