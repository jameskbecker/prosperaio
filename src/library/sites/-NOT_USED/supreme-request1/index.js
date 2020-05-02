const Task = require('../../tasks/base');
const ipcWorker = require('electron').ipcRenderer;
const { utilities } = require('../../other');
//const { SupremeMonitor } = require('../../monitors');
const logic = require('./logic');
const request = require('request');

class SupremeRequest extends Task {
	constructor(_taskData) {
		super(_taskData);
		this.cardinalId = '';
		this.cardinalJWT = '';
		this.checkoutAttempts = 0;
		this.checkoutData = {};
		this.cookieJar = request.jar();
		this.cookieSub = '';
		this.formElements = [];
		this.foundProduct = false;
		this.monitor = null;
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
			switch (this.taskData.site.id) {
				case 'supreme-eu': this.region = 'eu';
					break;
				case 'supreme-us': this.region = 'us';
					break;
				case 'supreme-jp': this.region = 'jp';
					break;
				default: this.region = 'eu'
			}

			if (!this.Monitor) this.Monitor = new SupremeMonitor({
				baseUrl: this.baseUrl,
				proxy: this.taskData.additional.proxy,
				category: this.products[0].category,
				searchInput: this.products[0].searchInput,
				styleInput: this.products[0].style,
				size: this.products[0].size
			});
			await utilities.setTimer.bind(this)();
			this.setStatus('Starting Task.', 'WARNING');
			await logic.findProduct.bind(this)();
			await logic.getProductData.bind(this)();
			await logic.cartProduct.bind(this)();
			await logic.checkoutProduct.bind(this)();
			await logic.processStatus.bind(this)();
			this.postCustomWebhook();
			this.postSuccess();
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
				default: console.log(err)
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

