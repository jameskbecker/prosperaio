const cart = require('./cart');
const checkout = require('./checkout');
const payment = require('./payment');
const log = require('../../../other/log');
const settings = require('electron-settings');
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
					let productUrl = ['dsml-eflash', 'kith'].includes(this.taskData.site.id) ? await this.Monitor.getProductUrlDSM() : await this.Monitor.getProductUrlSitemap();
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
					//let properties = this.productData.properties;
					this.setStatus('Adding Product to Cart', 'WARNING');
				
					await cart.add.bind(this)('cart');
					if ((this.taskData.site.id === 'palace-eu' || 'palace-us')) {
						await cart.getNote.bind(this)();
					}
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
			try {
				this.setStatus('Starting Checkout Process.', 'WARNING');
				
				await checkout.create.bind(this)();
				await checkout.getAuthenticityToken.bind(this)();
				if (this.hasCaptcha) {
					await this.requestCaptcha();
				}
				this.setStatus('Adding Contact Information', 'WARNING');
				await checkout.update.bind(this)('contact', {
					shipping: this.profile.shipping,
					captchaResponse: this.captchaResponse,
					authToken: this.authToken
				})
				this.setStatus('Adding Shipping', 'WARNING');
				await checkout.update.bind(this)('shipping', {
					shippingId: this.shippingId
				})
				this.setStatus('Added Shipping', 'SUCCESS')
				resolve();
			}
			catch(err) {
				console.log(err)
			}
			
		}
		runStage.bind(this)();
	})
}

exports.sendDiscordCheckout = function() {
	return new Promise((resolve, reject) => {
		function runStage() {
			let webhookUrl = settings.get('discord');
			let checkoutUrl = this.checkoutUrl + `?key=${this.checkoutKey}previous_step=shipping_method&step=payment_method`;
			this.request({
				url: webhookUrl,
				method: 'POST',
				json: true,
				body: {
					"embeds": [{
						author: {name: 'Ready for Manual Checkout!'},
						type: 'rich',
						color: '16007763',
						// thumbnail: {
						// 	url: `https:${this.productData.image}`,
						// },
						fields: [
							{
								"name": "Task ID:",
								"value": this.taskData.id,
								"inline": false
							},
							{
								"name": "Site:",
								"value": this.taskData.site.label,
								"inline": true
							},
							{
								"name": "Product:",
								"value": this.productData.productName,
								"inline": false
							},
							{
								"name": "Size:",
								"value": this.productData.sizeName,
								"inline": true
							},
							{
								"name": "",
								"value": `[Checkout Now](${checkoutUrl})`,
								"inline": false
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