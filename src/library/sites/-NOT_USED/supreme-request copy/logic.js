const cart = require('./cart');
const checkout = require('./checkout');
const pollStatus = require('./poll');
const { utilities, cookies } = require('../../other');
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
					this.startTS = Date.now();
					let searchInput = this.taskData.products[0].searchInput;
					if (searchInput.includes('+') || searchInput.includes('-')) {
						this.setStatus('Searching for Product.', 'WARNING');
						let productOverview = await this.Monitor.checkStockEndpoint('mobile/products.json');
						Object.assign(this.productData, productOverview);
						this.setProductName(this.productData.productName);
						resolve();
					}
					else if (searchInput.includes('supremenewyork.com')) {
						let desktopUrlExp = /https:\/\/www\.supremenewyork\.com\/shop\/\w{1,}\/(\w{1,})\/?(\w{1,})?/
						let mobileUrlExp = /https:\/\/www\.supremenewyork\.com\/mobile#products\/(\w{1,})\/?(\w{1,})?/;

						if (desktopUrlExp.test(this.products[0].searchInput) === true) {
							this.productData.productId = this.products[0].searchInput.match(desktopUrlExp)[1];
							resolve();
						}
						else {
							if (mobileUrlExp.test(this.products[0].searchInput) === true) {
								this.productData.productId = this.products[0].searchInput.match(mobileUrlExp)[1];
								this.setProductName(this.productData.productName);
							}
							else {
								this.setStatus('INVALID URL', 'ERROR');
								reject();
							}
						}
					}
					else {
						this.setStatus('Invalid Search Input.', 'ERROR');
						reject(null);
					}
				}
				catch (err) {
					console.log(err)
					switch (err.code) {
						case 'PRODUCT NOT FOUND':
							this.setStatus('Product Not Found.', 'ERROR');
							return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

						case 'CATEGORY NOT FOUND':
							this.setStatus('Category Not Found.', 'ERROR');
							return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

						case 'WEBSTORE CLOSED':
							this.setStatus('Store Closed.', 'ERROR');
							return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

						case 'ETIMEDOUT':
							this.setStatus('Timed Out.', 'ERROR');
							return setTimeout(runStage.bind(this), this.taskData.delays.error);

						default: 
							console.log(err)
							return setTimeout(runStage.bind(this), this.taskData.delays.error);
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
					this.setStatus('Fetching Product Data.', 'WARNING')
					let productDetails = await this.Monitor.fetchProductData(this.productData.productId);
					Object.assign(this.productData, productDetails);
					this.setSizeName(this.productData.sizeName);
					resolve();
				}
				catch (err) {
					switch (err.code) {
						case 'OUT OF STOCK':
							this.setStatus('Out of Stock.', 'ERROR');
							setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
							break;
						case 'SIZE NOT FOUND':
							this.setStatus('Size Not Found.', 'ERROR');
							setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
							break;
						case 'STYLE NOT FOUND':
							this.setStatus('Variant Not Found.', 'ERROR');
							setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);
							break;
						case 'VARIANT NOT FOUND':
							this.setStatus('Variant Not Found.', 'ERROR');
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
					//if (!this.restockMode) {
					this.setStatus('Generating Pooky.', 'WARNING')
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
					//	}

					this.setStatus('Delaying ATC.', 'WARNING');
					cookies.set.bind(this)('www.supremenewyork.com', 'lastVisitedFragment', `products/${this.productData.productId}`);
					await new Promise(resolve => { setTimeout(resolve, this.taskData.delays.cart) });
					this.setStatus('Adding to Cart.', 'WARNING');
					await cart.add.bind(this)();
					resolve();
				}
				catch (err) {
					switch (err.code) {
						case 'OOS':
							this.setStatus('Out of Stock.', 'ERROR');
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
					cookies.set.bind(this)('www.supremenewyork.com', 'lastVisitedFragment', 'checkout');

					if (this.hasCaptcha) await this.requestCaptcha();

					let checkoutDelay;
					if (!this.captchaTime || !this.taskData.additional.dynamicDelay) checkoutDelay = this.taskData.delays.checkout;
					else checkoutDelay = this.taskData.delays.checkout - this.captchaTime;
					if (checkoutDelay < 0) checkoutDelay = 0;

					this.setStatus('Delaying Checkout.', 'WARNING');
					await new Promise(resolve => { setTimeout(resolve, checkoutDelay) });
					this.setStatus('Submitting Checkout.', 'WARNING');

					this.checkoutAttempts++;
					this.checkoutTS = Date.now();
					this.checkoutTime = this.checkoutTS - this.startTS;

					await checkout.submit.bind(this)();

					this.setStatus('Processing.', 'WARNING');

					await pollStatus.getPoll.bind(this);
					this.successful = true;
					resolve();
				}
				catch (err) {
					let error = new Error();
					switch (err.code) {
						case 'INVALID INFO':
							this.setStatus('Invalid Checkout Info.', 'Error');
							return setTimeout(runStage.bind(this), this.taskData.delays.error);

						case 'TOS':
							this.setStatus('TOS Error.', 'ERROR');
							return setTimeout(runStage.bind(this), this.taskData.delays.error);

						case 'DECLINED':
							this.setStatus(`Payment Declined.`, 'ERROR');
							if (this.checkoutAttempts < this.taskData.setup.checkoutAttempts) {
								return setTimeout(exports.checkoutProduct.bind(this), this.taskData.delays.error);
							}
							error.code = 'FAILED';
							return reject(error);

						case 'DUPLICATE':
							this.setStatus('Duplicate Order.', 'ERROR');
							error.code = 'FAILED';
							return reject(error);
						case 'OOS':
							this.setStatus('Out of Stock.', 'ERROR');
							this.restockMode = true;
							this.taskData.delays.cart = 0;
							this.taskData.delays.checkout = 0;
							if (taskData.setup.restockMode === 'cart') {
								return setTimeout(exports.addCart.bind(this), this.taskData.delays.error);
							}
							else {
								return setTimeout(exports.getProductData.bind(this), this.taskData.delays.error);
							}

						case 'CANADA':
							this.setStatus('Product N/A in Canada', 'ERROR');
							error.code = 'FAILED';
							return reject(error);

						case 'BLOCKED COUNTRY':
							this.setStatus('Blocked in Current Country', 'ERROR');
							error.code = 'FAILED';
							return reject(error);


						default:
							error.code = 'FAILED';
							return reject(error);
					}
				}

			}
		}



		runStage.bind(this)();
	})
}

exports.pollStatus = function () {
	return new Promise((resolve, reject) => {
		async function runStage() {
			try {
				console.log(this.slug);
				await pollStatus.getPoll.bind(this);
			}
			catch (err) {
				let error = new Error();
				switch (err.code) {
					case 'QUEUED':
						return setTimeout(runStage.bind(this), this.taskData.delays.error);

					case 'DECLINED':
						this.setStatus(`Payment Declined.`, 'ERROR');
						if (this.checkoutAttempts < this.taskData.setup.checkoutAttempts) {
							return setTimeout(exports.checkoutProduct.bind(this), this.taskData.delays.error);
						}
						error.code = 'FAILED';
						return reject(error);

					case 'DUPLICATE':
						this.setStatus('Duplicate Order.', 'ERROR');
						error.code = 'FAILED';
						return reject(error);
					case 'OOS':
						this.setStatus('Out of Stock.', 'ERROR');
						this.restockMode = true;
						this.taskData.delays.cart = 0;
						this.taskData.delays.checkout = 0;
						if (taskData.setup.restockMode === 'cart') {
							return setTimeout(exports.addCart.bind(this), this.taskData.delays.error);
						}
						else {
							return setTimeout(exports.getProductData.bind(this), this.taskData.delays.error);
						}

					case 'CANADA':
						this.setStatus('N/A in Canada', 'ERROR');
						error.code = 'FAILED';
						return reject(error);

					case 'BLOCKED COUNTRY':
						this.setStatus('Blocked in Current Country', 'ERROR');
						error.code = 'FAILED';
						return reject(error);


					default:
						error.code = 'FAILED';
						return reject(error);
				}
			}
		}
		runStage.bind(this)();
	})
}
