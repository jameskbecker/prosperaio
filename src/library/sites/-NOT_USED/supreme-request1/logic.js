const cart = require('./cart');
const checkout = require('./checkout');
const { utilities, cookies } = require('../../other');
const pooky = require('./pooky');

exports.findProduct = function () {
	return new Promise((resolve, reject) => {
		const runStage = async function () {
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

					case 'STOP':
						return this.stop();

					default:
						console.log(err)
						return setTimeout(runStage.bind(this), this.taskData.delays.error);
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.getProductData = function () {
	return new Promise((resolve, reject) => {
		const runStage = async function () {
			try {
				this.setStatus('Fetching Product Data.', 'WARNING')
				let productDetails = await this.Monitor.fetchProductData(this.productData.productId);
				Object.assign(this.productData, productDetails);
				this.setSizeName(this.productData.sizeName);
				resolve();
			}
			catch (err) {
				switch (err.code) {
					case 'ETIMEDOUT':
						this.setStatus('Timed Out.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.error);

					case 'OUT OF STOCK':
						this.setStatus('Out of Stock.', 'ERROR');
						return setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);

					case 'SIZE NOT FOUND':
						this.setStatus('Size Not Found.', 'ERROR');
						return setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);

					case 'STYLE NOT FOUND':
						this.setStatus('Variant Not Found.', 'ERROR');
						return setTimeout(exports.getProductData.bind(this), this.taskData.delays.monitor);

					case 'VARIANT NOT FOUND':
						this.setStatus('Variant Not Found.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.monitor);

					case 'STOP':
						return this.stop();
				}
			}
		}
		runStage.bind(this)();

	})
}

exports.cartProduct = async function () {
	return new Promise(async (resolve, reject) => {
		const runStage = async function () {
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
				if (!this.restockMode) await new Promise(resolve => { setTimeout(resolve, this.taskData.delays.cart) });
				this.setStatus('Adding to Cart.', 'WARNING');
				await cart.add.bind(this)();
				resolve();
			}
			catch (err) {
				switch (err.code) {
					case 'ETIMEDOUT':
						this.setStatus('Timed Out.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.error);

					case 'OOS':
						this.setStatus('Out of Stock.', 'ERROR');
						return;

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

exports.checkoutProduct = function () {
	return new Promise((resolve, reject) => {
		async function runStage(callback) {
			try {
				cookies.set.bind(this)('www.supremenewyork.com', 'lastVisitedFragment', 'checkout');

				if (this.hasCaptcha) await this.requestCaptcha();
				this.setStatus('Parsing Checkout Form', 'WARNING');
				await checkout.getForm.bind(this)();
				if (!this.restockMode) {
					let checkoutDelay;
					if (!this.captchaTime) checkoutDelay = this.taskData.delays.checkout;
					else checkoutDelay = this.taskData.delays.checkout - this.captchaTime;
					if (checkoutDelay < 0) checkoutDelay = 0;

					this.setStatus('Delaying Checkout.', 'WARNING');
					await new Promise(resolve => { setTimeout(resolve, checkoutDelay) });
				}


				this.setStatus('Submitting Checkout.', 'WARNING');

				this.checkoutAttempts++;
				this.checkoutTS = Date.now();
				this.checkoutTime = this.checkoutTS - this.startTS;

				await checkout.submit.bind(this)();
				resolve();
			}
			catch (err) {
				switch (err.code) {
					case 'ETIMEDOUT':
						this.setStatus('Timed Out.', 'ERROR');
						return setTimeout(runStage.bind(this), this.taskData.delays.error);
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

exports.processStatus = function () {
	return new Promise((resolve, reject) => {
		async function runStage(isCheckoutResponse) {
			try {
				if (!isCheckoutResponse) await checkout.getStatus.bind(this)();
				let error;
				console.log(this.checkoutData)
				switch (this.checkoutData.status) {
					case 'queued':
						this.setStatus('Queued.', 'WARNING');
						if (this.checkoutData.hasOwnProperty('slug')) this.slug = this.checkoutData.slug;
						return setTimeout(runStage.bind(this), 1000);

					case 'cardinal_queued':
						this.setStatus('Queued for Cardinal.', 'WARNING');
						return setTimeout(runStage.bind(this), 1000);

					case 'cca':
						this.setStatus('Waiting for Authentication.', 'WARNING');
						return setTimeout(runStage.bind(this), 1000);

					case 'failed':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						if (!this.checkoutData.errors) {
							this.setStatus('Payment Failed.', 'ERROR');
							return this.checkoutAttempts < this.taskData.setup.checkoutAttempts ? setTimeout(exports.checkoutProduct.bind(this), this.taskData.delays.error) : new Error();
						}
						else return this.setStatus('Billing Error.', 'ERROR');

					case 'paid':
						if (this.checkoutData.hasOwnProperty('id')) this.orderNumber = this.checkoutData.id;
						this.setStatus('Check Email.', 'SUCCESS');
						resolve();
						return;

					case 'dup':
						this.setStatus('Duplicate Order.', 'WARNING');
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
				console.log(err)
			}
		}
		runStage.bind(this)(true);
	})
}
