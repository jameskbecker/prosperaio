const Supreme = require('./SupremeBase')
const { utilities } = require('../../other');
const settings = require('electron-settings');
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth")
const querystring = require('querystring');


class SupremeHybrid extends Supreme {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.config = {
			launch: {
				headless: false,
				executablePath: settings.has('browser-path') ? settings.get('browser-path') : null,
				args: [
					'--no-sandbox',
					'--disable-gpu',
					`--window-size=500,800`
				]
			},
			emulate: {
				userAgent: this.userAgent,
				viewport: {
					width: 500, height: 800,
					isMobile: true,
					hasTouch: true
				}
			},
			auth: null
		}
		this.browser;
		this.page;
	}

	async run() {
		try {
			this.setStatus('Initialising.', 'INFO')
			await this._setup();
			await this._setTimer(); 
			this.setStatus('Starting Task.', 'WARNING');
			await this._fetchStockData();
			await this._fetchProductData();
			await this._addToCart();
			await this._checkout();
			await this._processStatus();

			//Add Publish Success
		}
		catch (error) {
			console.log(error);
		}
	}

	_setup() {
		if (this.proxy) {
			let splitProxy = this.proxy.split(':');
			let host = splitProxy[0];
			let port = splitProxy[1];
			this.config.launch.args.push(`--proxy-server=http://${host}:${port}`);

			if (splitProxy.length === 4) {
				this.config.auth = {
					username: splitProxy[2],
					password: splitProxy[3]
				}
			}
		}
		return new Promise(async (resolve) => {
			puppeteer.use(pluginStealth());
			this.browser = await puppeteer.launch(this.config.launch);
			this.page = await this.browser.newPage();

			await this.page.emulate(this.config.emulate);
			await this.page.authenticate(this.config.auth);
			await this.page.goto(this.baseUrl)
			resolve();
		})


	}

	_addToCart() {
		return new Promise(async resolve => {
			this.startTime = (new Date).getTime();
			await this.page.setCookie({
				name: 'shoppingSessionId',
				value: this.startTime.toString()
			})

			await this.page.setCookie({
				name: 'lastVisitedFragment',
				value: `products/${this.productId}/${this.styleId}`
			});
			
			this.setStatus('Adding to Cart', 'WARNING');

			this.cartForm = {
				size: this.sizeId,
				style: this.styleId,
				qty: 1
			}
			
			let body = await this._request(`${this.productUrl}/add.json`, {
				method: "POST",
				credentials: 'include',
				headers: {
					"accept": "application/json",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
					"content-type": "application/x-www-form-urlencoded",
					"x-requested-with": "XMLHttpRequest"
				},
				body: querystring.stringify(this.cartForm)
			})
			if (
				(body.hasOwnProperty('length') && body.length < 1) ||
				(body.hasOwnProperty('success') && !body.success) ||
				(body.hasOwnProperty('length') && !body[0].in_stock)
			) {
				throw new Error('OOS');
			}
			
			let cookies = await this.page.cookies();

			let pureCart = cookies.filter(cookie => cookie.name === 'pure_cart');
			if (pureCart.length > 0) {
				let cookieValue = JSON.parse(decodeURIComponent(pureCart[0].value));
				delete cookieValue.cookie;
				this.cookieSub = encodeURIComponent(JSON.stringify(cookieValue));
				this.setStatus('Added to Cart!', 'SUCCESS');
				console.log('cookie_sub:', this.cookieSub)
			resolve();
			}
			
		})
	}

	_checkout() {
		return new Promise(async resolve => {
			await this.page.setCookie({
				name: 'lastVisitedFragment',
				value: `checkout`
			});
			this.setStatus('Parsing Checkout Form', 'WARNING');
			let checkoutTemplate = await this.page.$eval("#checkoutViewTemplate", (e) => e.innerHTML);
			this.formElements = this._parseCheckoutForm(checkoutTemplate);

			if (this.hasCaptcha) {
				this.setStatus('Waiting for Captcha', 'WARNING');
				await this.requestCaptcha();
			}

			this.setStatus('Submitting Checkout', 'WARNING');

			this.checkoutForm = this._form('parsed-checkout')
			let options = {
				method: "POST",
				credentials: 'include',
				body: querystring.stringify(this.checkoutForm),
				headers: {
					"accept": "application/json",
					"accept-encoding": "gzip, deflate, br",
					"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
					"content-type": "application/x-www-form-urlencoded",
					"x-requested-with": "XMLHttpRequest"
				}
			}
			
			this.checkoutData = await this._request(`${this.baseUrl}/checkout.json`, options)
			resolve();
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

	async _request(url, options) {
		console.log(arguments)
		try {
			return await this.page.evaluate(async (url, options) => (
				(await window.fetch(url, options)).json()
			), url, options);
		}
		catch(error) {
			console.log(error)
		}
		
	}
}

module.exports = SupremeHybrid; 