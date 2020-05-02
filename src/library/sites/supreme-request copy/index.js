const Task = require('../../tasks/base');
const ipcWorker = require('electron').ipcRenderer;
const { utilities, logger } = require('../../other');
const { KWMonitor, URLMonitor } = require('../../monitors/supreme');
const logic = require('./logic');
const request = require('request');

class SupremeRequest extends Task {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.nextCardinalStage = 'init_jwt'
		this.cardinalId = '';
		this.cardinalTid = '';
		this.cardinalServerJWT = '';
		this.cardinalClientJWT = ''
		this.cardinalConsumerData;
		//this.DeviceFingerprintingURL = '';
		//this.authPollUrl = '';
		//this.needsManualAuth = false;
		this.transactionId = '';
		this.transactionToken = '';
		this.cardinalResponsePayload;
		this.checkoutAttempts = 0;
		this.checkoutData = {};
		this.cookieJar = request.jar();
		this.cookieSub = '';
		this.formElements = [];
		this.foundProduct = false;
		this.productUrl = null;
		this.slug;
		this.region;
		this.request = request.defaults({
			gzip: true,
			timeout: parseInt(this.taskData.delays.timeout) > 0 ? parseInt(this.taskData.delays.timeout) : 30000,
		});
		this.restockMode = false;
		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
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
				logger.info('Starting Supreme KW Monitor.')
				console.log(this.baseUrl)
				global.monitors.supreme.kw = new KWMonitor({
					proxy: this.taskData.additional.proxy,
					timeout: this.taskData.additional.timeout,
					baseUrl: this.baseUrl
				});
			}

			if (!global.monitors.supreme.url) {
				logger.info('Starting Supreme URL Monitor.')
				global.monitors.supreme.url = new URLMonitor({
					proxy: this.taskData.additional.proxy,
					timeout: this.taskData.additional.timeout,
					baseUrl: this.baseUrl
				});
			}
			await utilities.setTimer.bind(this)();
			this.setStatus('Starting Task.', 'WARNING');
			await logic.findProduct.bind(this)();
			await logic.getProductData.bind(this)();
			await logic.cartProduct.bind(this)();
			await logic.checkoutProduct.bind(this)();
			await logic.processStatus.bind(this)();
			
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

			if (this.checkoutData && this.checkoutData.status) {
				let field = {
					name: "Status:",
					value: this.checkoutData.status.capitalise(),
					inline: true
				}
				privateFields.push(field)
			}

			if (this.cardinalId) {
				let field = {
					name: "Transaction ID:",
					value: "||" + this.cardinalId + "||",
					inline: true
				}
				privateFields.push(field);
			}

			this.postPublicWebhook(publicFields);
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
				default: console.log(err)
			}
		}
	}
}

module.exports = SupremeRequest;