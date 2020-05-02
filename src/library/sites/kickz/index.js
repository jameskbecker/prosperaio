const Task = require('../../tasks/base');
const logic = require('./logic');
const request = require('request-promise-native');
const settings = require('electron-settings');
const { utilities, convertSize } = require('../../other');
const buildForm = require('./form-builder')
class Kickz extends Task {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.ccTypeCode = '';
		this.ccUrl;
		this.ccTimestamp = 0;
		this.cookieJar = request.jar();
		this.dataUrl = '' //Safer Pay Data Url
		this.paymentMethod = '';
		this.paymentEndpoint = '';
		this.paypalUrl;
		this.region = 'de';
		this.sameShippingAddress = true;
		this.searchMethod;
		this.sizeCode = convertSize('kickz', _taskData.products[0].size);
	
		this.request = request.defaults({
			gzip: true,
			timeout: 10000,
			resolveWithFullResponse: true,
			jar: this.cookieJar
		})
		this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36';
		
		
		this.cartToken = null;
		this.orderNumber = null;
		this.productUrl = null;
		this.variantId = null;
		
	}

	async run() {
		this.setStatus('Initializing', 'INFO')
		this.init();
		try {
			switch (this.taskData.setup.mode) {
				case 'kickz-wire':
					this.paymentMethod = 'PREPAID';
					this.paymentEndpoint = 'prepaidSubmit';
					break;

				case 'kickz-paypal':
					this.paymentMethod = 'PAYPAL_DIRECT';
					this.paymentEndpoint = 'paypalDirectSubmit';
					break;

				case 'kickz-card':
					this.paymentMethod = 'CREDIT_CARD';
					this.paymentEndpoint = 'saferPaySubmit';
					break;
			}
			this.searchType = this.parseInput()
			switch (this.profile.billing.country) {
				case 'GB': this.region = 'uk'; break;
				case 'DE': this.region = 'de'; break;
				case 'US': this.region = 'us'; break;
			}
			await logic.generateCookies.bind(this)();
			await utilities.setTimer.bind(this)();
			this.setStatus('Starting Task.', 'WARNING');
			await logic.cart.bind(this)();
			await logic.reserve.bind(this)();
			await logic.checkout.bind(this)();
			if (this.taskData.setup.mode === 'kickz-paypal') await this.sendPaypalWebhook();
		}
		catch (err) {
			console.log(err);
		}
	}

	parseInput() {
		let input = this.taskData.products[0].searchInput;
		if (input.includes(this.baseUrl)) {
			this.productUrl = input;
			return 'URL';
		}
		else {
			this.variantId = input;
			return 'VARIANT'
		}
	}

	sendPaypalWebhook() {
		const webhookUrl = settings.get('discord');
		return new Promise((resolve, reject) => {
			request({
				url: webhookUrl,
				method: 'POST',
				json: true,
				body: buildForm.bind(this)('webhook')
			}, (error, response, body) => {
				if (error) {
					console.log(error);
				}
				else if (response.statusCode !== 204) {
					console.log(response.statusCode);
					console.log(response.statusMessage)
					console.log(body)
				}
				else {
					this.setStatus('Sent Webhook.', 'SUCCESS');
					resolve();
				}
			})
		})
	}


}

module.exports = Kickz;