const Task = require('../../tasks/base');
const logic = require('./logic');
const { utilities } = require('../../other');
const { KWMonitor, URLMonitor } = require('../../monitors/supreme');
const request = require('request-promise-native');
const settings = require('electron-settings');
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth())

class SupremeBrowser extends Task {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.executablePath = settings.get('browser-path');
		this.restockMode = false;
		this.proxy = this._getProxy();
		this.request = request.defaults({
			gzip: true,
			timeout: parseInt(this.taskData.delays.timeout) > 0 ? parseInt(this.taskData.delays.timeout) : 30000,
			resolveWithFullResponse: true
		});

		//Setup Keyword Monitor
		if (!global.monitors.supreme.kw) {
			global.monitors.supreme.kw = new KWMonitor({
				baseUrl: this.baseUrl,
				proxyList: this._proxyList
			});
		}

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

	async run() {
		this.setStatus('Hello')
		try {
			await this._setup();
			await utilities.setTimer.bind(this)(); this.setStatus('Starting Task.', 'WARNING');
			await logic.fetchStockData.bind(this)();
			await logic.fetchProductData.bind(this)();
			await this._addToCart();
			await this._checkout();
			await logic.processStatus.bind(this)(true);
		}
		catch (error) {
			console.log(error);
		}
	}

	_setup() {
		let config = {
			launch: {
				headless: true,
				executablePath: this.executablePath,
				args: [
					'--no-sandbox',
					'--disable-gpu',
					`--window-size=500,800`
				]
			},
			emulate: {
				userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
				viewport: {
					width: 500, height: 800,
					isMobile: true,
					hasTouch: true
				}
			},
			auth: null
		}
		if (this.proxy) {
			let splitProxy = this.proxy.split(':');
			let host = splitProxy[0];
			let port = splitProxy[1];
			config.launch.args.push(`--proxy-server=http://${host}:${port}`);

			if (splitProxy.length === 4) {
				config.auth = {
					username: splitProxy[2],
					password: splitProxy[3]
				}
			}
		}
		return new Promise(async (resolve) => {

			this.browser = await puppeteer.launch(config.launch);
			this.page = await this.browser.newPage();

			await this.page.emulate(config.emulate);
			await this.page.authenticate(config.auth);
			await this.page.setCookie({
				"name": 'js-address', "value": this._buildJSAddress(),
				"domain": this.baseUrl.split('://')[1],
				"path": "/",
				"httpOnly": false,
				"secure": false
			})
			resolve();
		})


	}

	_addToCart() {
		return new Promise(async resolve => {
			this.startTime = Date.now();
			this.page.goto(`${this.mobileUrl}/${this.styleId}`, { 
				waitUntil: 'networkidle2' 
			});


			this.setStatus('Loading Page', 'INFO')
			await this.page.waitForSelector('.cart-button');
			this.setStatus('Carting.', 'WARNING');
			const cartButtonText = await this.page.$eval('.cart-button', button => button.innerHTML);
			if (cartButtonText === 'sold out') {
				throw new Error('OOS');
			}

			else {
				await this.page.waitForSelector('select[name="size-options"]');
				await this.page.select('select[name="size-options"]', '' + this.sizeId);

				this.setStatus('Delaying ATC.', 'WARNING');
				await this.page.waitFor(this.taskData.delays.cart || 0);
				
				this.setStatus('Carting.', 'WARNING');
				await this.page.tap('span.cart-button');
				await this.page.waitForResponse(`${this.baseUrl}/shop/${this.productId}/add.json`)
				this.setStatus('Added to Cart.', 'SUCCESS');
				resolve();
			}
		})
	}

	_checkout() {
		return new Promise(async resolve => {
			let paymentInfo = this.profile.payment;

				await this.page.goto(this.baseUrl + '/mobile#checkout');
				await this.page.waitFor('#order_billing_name');

				this.setStatus('Filling Checkout Form.', 'WARNING');
				if (this.region === 'EU') {
					await this.page.select('select#credit_card_type', this.profile.payment.type);
				}
				await this.page.tap('input[placeholder="credit card number"]');
				await this.page.evaluate(`$('input[placeholder="credit card number"]').val('${this.profile.payment.cardNumber.replace(/\s/g, '')}')`)

				await this.page.select('select#credit_card_month', this.profile.payment.expiryMonth);
				await this.page.select('select#credit_card_year', paymentInfo.expiryYear);

				await this.page.tap('input[placeholder="cvv"]');
				await this.page.type('input[placeholder="cvv"]', paymentInfo.cvv, { delay: 1 });

				await this.page.tap('#order_terms');

				// if (this.hasCaptcha) {
				// 	this.setStatus('Waiting for Captcha', 'WARNING');
				// 	await this.requestCaptcha();
				// }

				this.setStatus('Delaying Checkout', 'WARNING');
				await utilities.sleep(this.taskData.delays.checkout || 0);

				this.setStatus('Submitting Checkout', 'WARNING');
				this.checkoutTime = Date.now();
				this.checkoutAttempts++;

				await this.page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML = "${this.captchaResponse}"`);
				await this.page.tap('#submit_button');
				this.page.on('response', async response => {
					if (response.url() === `${this.baseUrl}/checkout.json`) {
						let body = JSON.parse(await response.text());
						console.log('here:', body)
						this.checkoutData = body;
						resolve();
					}
				})
		})
	}


	_buildJSAddress() {
		let rememberedFields = [];
		switch (this.region) {
			case 'JP':
				rememberedFields = [
					"#order_billing_name",
					"#order_billing_last_name",
					"#order_email",
					"#order_tel",
					"#order_billing_address",
					"#order_billing_city",
					"#order_billing_state",
					"#order_billing_zip"
				]
			case 'EU':
				rememberedFields = [
					this.profile.billing.first + ' ' + this.profile.billing.last,
					this.profile.billing.email,
					this.profile.billing.telephone,
					this.profile.billing.address1,
					this.profile.billing.address2,
					this.profile.billing.city,
					null, //"#order_billing_state", 
					this.profile.billing.zip,
					this.profile.billing.country,
					'' //#order_billing_address3
				]
				break;
			case 'US':
				rememberedFields = [
					this.profile.billing.first + ' ' + this.profile.billing.last,
					this.profile.billing.email,
					this.profile.billing.telephone,
					this.profile.billing.address1,
					this.profile.billing.city,
					this.profile.billing.state,
					this.profile.billing.zip
				]
		}
		return encodeURIComponent(rememberedFields.join('|'))
	}
}

module.exports = SupremeBrowser; 