const Supreme = require('./SupremeBase')
const settings = require('electron-settings');
const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth")
const querystring = require('querystring');


class SupremeSafe extends Supreme {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.config = {
			launch: {
				headless: true,
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
			this._setStatus('Initialising.', 'INFO')
			await this._setup();
			await this._setTimer(); 
			this._setStatus('Starting Task.', 'WARNING');
			await this._fetchStockData();
			await this._fetchProductData();
			await this._atcProcess();
			await this._checkoutProcess();
			await this._processStatus();

			if (this.successful) {
				this._setStatus('Success.', 'SUCCESS');
				let privateFields = [];
				let publicFields = [];
				if (this._productStyleName) {
					let field = {
						name: "Style:",
						value: this._productStyleName,
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

				this._postPublicWebhook(publicFields);
				this._postPrivateWebhook(privateFields);
				this._addToAnalystics();
			}
			else { console.log('failed') }
			this.isActive = false;
		}
		catch (error) {
			console.log(error);
		}
	}

	_setup() {
		return new Promise(async (resolve) => {
			if (this.proxy) {
				let splitProxy = this.proxy.replace('http://', '').split('@');
				let host = splitProxy[1].split(':')[0];
				let port = splitProxy[1].split(':')[1];
				this.config.launch.args.push(`--proxy-server=http://${host}:${port}`);
	
				if (splitProxy.length === 2) {
					let username = splitProxy[0].split(':')[0];
					let password = splitProxy[0].split(':')[1] ;
					this.config.auth = {username, password }
					
				}
			}
			try {
				puppeteer.use(pluginStealth());
			} catch(e) {}
			
			this.browser = await puppeteer.launch(this.config.launch);
			this.page = await this.browser.newPage();

			await this.page.emulate(this.config.emulate);
			await this.page.authenticate(this.config.auth);
			await this.page.goto(this.baseUrl)
			resolve();
		})


	}

	_atcProcess() {
		return new Promise(async function runProcess (resolve) {
			try {
				this.startTime = (new Date).getTime();
				if (this.shouldStop) return this.stop();
				await this.page.setCookie({
					name: 'shoppingSessionId',
					value: this.startTime.toString()
				})
				if (this.shouldStop) return this.stop();
				await this.page.setCookie({
					name: 'lastVisitedFragment',
					value: `products/${this.productId}/${this.styleId}`
				});
				
				this._setStatus('Adding to Cart', 'WARNING');

				this.cartForm = {
					size: this.sizeId,
					style: this.styleId,
					qty: 1
				}
				if (this.shouldStop) return this.stop();
				let body = await this._request(`${this._productUrl}/add.json`, {
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
					this._setStatus('Added to Cart!', 'SUCCESS');
					console.log('cookie_sub:', this.cookieSub)
				resolve();
				}
			}
			catch(error) {
				this._setStatus('ATC Error', 'ERROR');
				console.log(error);
				let errorDelay = settings.has('globalErrorDelay') ? settings.get('globalErrorDelay') : 1000
				return setTimeout(runProcess.bind(this, resolve), errorDelay);
			}
				
			
		}.bind(this))
	}

	_checkoutProcess() {
		return new Promise(async function runProcess (resolve) {
			try {
				await this.page.setCookie({
					name: 'lastVisitedFragment',
					value: `checkout`
				});
				if (this.shouldStop) return this.stop();
				this._setStatus('Parsing Checkout Form', 'WARNING');
				let checkoutTemplate = await this.page.$eval("#checkoutViewTemplate", (e) => e.innerHTML);
				this.formElements = this._parseCheckoutForm(checkoutTemplate);
				if (this.shouldStop) return this.stop();
				if (this.hasCaptcha) {
					this._setStatus('Waiting for Captcha', 'WARNING');
					await this._requestCaptcha();
				}
				if (this.shouldStop) return this.stop();
				this._setStatus('Submitting Checkout', 'WARNING');
	
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
			}
			catch(error) {
				this._setStatus('Checkout Error', 'ERROR');
				console.log(error);
				let errorDelay = settings.has('globalErrorDelay') ? settings.get('globalErrorDelay') : 1000
				return setTimeout(runProcess.bind(this, resolve), errorDelay);
			}
			
		}.bind(this))
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
		try {
			return await this.page.evaluate(async (url, options) => (
				(await window.fetch(url, options)).json()
			), url, options);
		}
		catch(error) {
			return setTimeout(this._request.bind(this,url,options), 1000)
		}
		
	}
}

module.exports = SupremeSafe; 