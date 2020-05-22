const Task = require('../../tasks/base');
const settings = require('electron-settings');
const { utilities, logger } = require('../../other');
const { KWMonitor, URLMonitor } = require('../../monitors/supreme');
const logic = require('./logic');
const request = require('request-promise-native');

class SupremeRequest extends Task {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.cardinal = {
			id: '',
			tid: '',
			transactionId: '',
			transactionToken: '',
			serverJWT: '',
			responsePayload: '',
			consumerData: {},
			authentication: {
				url: '',
				payload: ''
			}
		};
		this.region = '';
		this.slug = '';
		this.formElements = [];
		this.cookieSub = '';

		this.checkoutAttempts = 0;
		this.checkoutData = {};

		this.productUrl = null;

		this.cookieJar = request.jar();
		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Safari/604.1';
		this.request = request.defaults({
			gzip: true,
			jar: this.cookieJar,
			resolveWithFullResponse: true,
			timeout: settings.get('globalTimeoutDelay') || 5000
		});
		this.restockMode = false;
		this.hasSubmittedCheckout = false;
	}
	set checkoutDelay(delay) {
		if (delay <= 0) {
			this.checkoutDelay = 0;
		}
		else {
			this.checkoutDelay = delay;
		}
	}

	async run() {
		try {
			await this.init();
			switch (this.taskData.site) {
				case 'supreme-eu':
				case 'supreme-local':
					this.region = 'eu';
					break;
				case 'supreme-us':
					this.region = 'us';
					break;
				case 'supreme-jp':
					this.region = 'jp';
					break;
			}

			if (!global.monitors.supreme.kw) {
				global.monitors.supreme.kw = new KWMonitor({
					baseUrl: this.baseUrl,
					proxyList: this._proxyList
				});
			}
			global.monitors.supreme.kw._shouldStop = false;

			await utilities.setTimer.bind(this)();
			this.setStatus('Starting Task.', 'WARNING');
			logger.warn(`[Task ${this.id}] Starting.`);
			await logic.findProduct.bind(this)();
			await logic.getProductData.bind(this)();
			await logic.cartProduct.bind(this)();
			await logic.checkoutProduct.bind(this)();
			await logic.processStatus.bind(this)();

			if (this.successful) {
				this.setStatus('Success.', 'SUCCESS');
				let privateFields = [];
				let publicFields = [];
				if (this.productColour) {
					let field = {
						name: "Colour:",
						value: this.productColour,
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

				if (this.cardinal.id) {
					let field = {
						name: "Transaction ID:",
						value: '||' + this.cardinal.id + '||',
						inline: true
					}
					privateFields.push(field);
				}
				this.postPublicWebhook(publicFields);
				this.postPrivateWebhook(privateFields);
				this.addToAnalystics();
			}
			else {
				console.log('failed')
			}
			this.isActive = false;

		}
		catch (error) {
			switch (error.code) {
				case 'FAILED':
					return this.isActive = false;

				case 'RETRY':
					return this.retryCheckout();

				case 'NO TASK MODE':
					this.isActive = false;
					alert('INVALID TASK MODE');
					this.stop();
					break;
				default: console.log(error)
			}
		}
	}

	async retryCheckout() {
		try {
			await logic.checkoutProduct.bind(this)();
			await logic.processStatus.bind(this)();
		}
		catch (error) {
			switch (error.code) {
				case 'FAILED':
					this.isActive = false;
					break;
				default: console.log(error)
			}
		}
	}
}

module.exports = SupremeRequest;