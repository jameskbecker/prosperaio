const token = require('./access');
const checkout = require('./checkout');
const queue = require('./queue');
const payment = require('./payment');
const log = require('../../../other/log');
const builder = require('./builder');	
exports.fetchApiToken = function() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					this.setStatus('FETCHING ACCESS TOKEN', 'WARNING');
					await token.fetch.bind(this)();
					log.debug(`[ ${this.taskData.id} ] [ INFO ] FETCHED API TOKEN: ${this.apiToken}`);
					resolve();
				}
				catch (err) {
					switch(err.code) {
						case 'PASSWORD':
							this.setStatus('PASSWORD PAGE ACTIVE. RETRYING.', 'ERROR');
							return setTimeout(runStage.bind(this), this.taskData.delays.error);
						default: () => {
							if(err.code) console.log(err.code);
							else console.log(err);
						}
					}
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.preloadCheckout = function() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					// this.setStatus('PRELOADING QUEUE', 'WARNING');
					// await queue.preload.bind(this)();
					this.setStatus('Creating Checkout.', 'WARNING');
					await checkout.create.bind(this)();
					if (this.isQueued) {
						await queue.bypass.bind(this)();
					}
					await checkout.getCheckoutToken.bind(this)();
					this.setStatus('Created Checkout!', 'SUCCESS');
					log.debug(`[ ${this.taskData.id} ] [ INFO ] CREATED CHECKOUT: ${this.checkoutToken}`);
					resolve();
				}
				catch(err) {
					console.log(err)
					reject(err);
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.preloadSession = function() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					this.setStatus('Creating Session.', 'WARNING')
					await checkout.getSessionId.bind(this)();
					log.debug(`[ ${this.taskData.id} ] [ INFO ] CREATED SESSION: ${this.sessionId}`);
					this.setStatus('Created Session!', 'SUCCESS');
					resolve();
				}
				catch(err) {
					console.log(err)
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.findProduct = function() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					this.setStatus('Searching for Product.', 'WARNING');
					let productUrl = ['dsml-eflash'].includes(this.taskData.site.id) ? await this.Monitor.getProductUrlDSM() : await this.Monitor.getProductUrlSitemap();
					this.productData.productUrl = productUrl;
					this.setStatus('Found Product!', 'SUCCESS');
					log.debug(`[ ${this.taskData.id} ] [ INFO ] FOUND PRODUCT URL: ${this.productData.productUrl}`);
					resolve();
				}
				catch(err){
					switch (err.code) {
						case 'PRODUCT NOT FOUND':
							this.setStatus('Product Not Found.', 'ERROR');
							return setTimeout(runStage.bind(this), this.taskData.delays.monitor);
							break;
						default: console.log(err)
					}
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.fetchProductData = function() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					this.setStatus('Fetching Product Data.', 'WARNING');	
					let productData = ['dsml-eflash'].includes(this.site.id) ? await this.Monitor.getProductDataFrontend(this.productData.productUrl) : await this.Monitor.getProductDataJSON(this.productData.productUrl);
					if (productData.properties) this.hasCartProperties = true;
					Object.assign(this.productData, productData);
					this.setStatus('Fetched Product Data!', 'SUCCESS');
					this.setProductName(this.productData.name);
					resolve();
				}
				catch(err) {
					switch(err.code) {
						case 'OOS':
							this.setStatus('Out of Stock.', 'ERROR');
							return setTimeout(runStage.bind(this), this.taskData.delays.error);
						default: console.log(err)
					}
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.cartItem = function() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					let variantId = this.productData.variantId;
					let qty = parseInt(this.taskData.products[0].productQty);
					let properties = this.productData.properties;
					this.setStatus('Adding Product to Cart', 'WARNING');
					await checkout.update.bind(this)(builder.apiCart(variantId, qty, properties));
					this.setStatus('Product Added.', 'SUCCESS');
					resolve();
				}
				catch(err) {
					console.log(err)
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.checkout = function() {
	return new Promise((resolve, reject) => {
		async function runStage() {
			if (this.shouldStop === true) {
				let stopErr = new Error();
				stopErr.code = 'STOP';
				reject(stopErr);
			}
			else {
				try {
					if (!this.shippingId) {
						this.setStatus('Polling Shipping Rates', 'WARNING');
						await checkout.getRates.bind(this)();
					}
					// if (this.hasCaptcha === true) {
					// 	await this.requestCaptcha();
					// }
					//this.setStatus('Submitting Order', 'INFO');
					//await checkout.getCheckoutToken.bind(this)()
					this.checkoutTS = Date.now();
					this.checkoutTime = this.checkoutTS - this.startTS;
					// console.log(`Submitted Checkout in ${this.checkoutTime}ms`);
					// await checkout.submitOrder.bind(this)()
					
					// this.setStatus('Processing', 'WARNING');
					// await checkout.getLatestPaymentId.bind(this)();
					// await checkout.pollPaymentStatus.bind(this)()
					resolve();
				}
				catch(err) {
					switch (err.code) {
						case 'SHIPPING':
							this.setStatus('Invalid Shipping Rate.', 'ERROR');
							reject(err);
							break;
						case 'CAPTCHA':
							this.setStatus('Invalid Captcha.', 'ERROR');
							reject(err);
							break;
						default: console.log(error)
					}
				}
			}
		}
		runStage.bind(this)();
	})
}

exports.sendDiscordCheckout = function() {
	return new Promise((resolve, reject) => {
		function runStage() {
			let webhookUrl = settings.get('discord');
			let checkoutUrl = this.checkoutUrl + `?key=${this.checkoutAuthToken}&previous_step=shipping_method&step=payment_method`;
			this.request({
				url: webhookUrl,
				method: 'POST',
				json: true,
				body: {
					embeds: [{
						author: {
							name: 'Ready for Manual Checkout!'
						},
						type: 'rich',
						color: '16007763',
						// thumbnail: {
						// 	url: `https:${this.productData.image}`,
						// },
						fields: [				
							{
								name: 'Profile:',
								value: this.taskData.setup.profile,
								inline: false
							},			
							{
								name: 'Site:',
								value: this.taskData.site.label,
								inline: true
							},
							
							{
								name: 'Product:',
								value: this.productData.name,
								inline: false
							},
							{
								name: 'Size:',
								value: this.productData.sizeName,
								inline: true
							},
							{
								name: 'Go to Checkout',
								value: `[Click Here](${checkoutUrl})`,
								inline: false
							}
						],
						footer: {
							text: `XXXAIO • ${new Date().toUTCString()}`,
							icon_url: 'https://i.imgur.com/Ce8ZncT.png'
						}
					}]
				}
			}, (error, response, body) => {
				if (error) {
					console.log(error)
				}
				else if ((response.statusCode === 200 || 204)) {
					resolve();
				}
				else {
					console.log(response.statusCode)
					console.log(response.statusMessage)
				}
			})
		}
		runStage.bind(this)();
	})
}