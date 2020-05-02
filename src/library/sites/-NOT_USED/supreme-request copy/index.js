const Task = require('../../tasks/base');
const ipcWorker = require('electron').ipcRenderer;
const { utilities } = require('../../other');
//const { SupremeMonitor } = require('../../monitors');
const logic = require('./logic');
const request = require('request');
const settings = require('./')
class SupremeRequest extends Task {
	constructor(_taskData) {
		super(_taskData);
		this.cardinalId = '';
		this.cardinalJWT = '';
		this.checkoutAttempts = 0;
		this.cookieJar = request.jar();
		this.cookieSub = '';
		this.foundProduct = false;
		this.monitor = null;
		this.slug;
		this.region;
		this.request = request.defaults({
			gzip: true,
			timeout: parseInt(this.taskData.delays.timeout) > 0 ? parseInt(this.taskData.delays.timeout) : 20000,
		});
		this.restockMode = false;
		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
	}

	async run() {
		try {
			await this.init();
			switch (this.taskData.site.id) {
				case 'supreme-eu':
					this.region = 'EU';
					break;
				case 'supreme-us':
					this.region = 'US';
					break;
				case 'supreme-jp':
					this.region = 'JP';
					break;
				default: 'EU'
			}
			if (!this.Monitor) this.Monitor = new SupremeMonitor({
				proxy: this.taskData.additional.proxy,
				category: this.products[0].category,
				searchInput: this.products[0].searchInput,
				styleInput: this.products[0].style,
				size: this.products[0].size
			});
			await utilities.setTimer.bind(this)();
			this.setStatus('STARTING TASK', 'WARNING');
			await logic.findProduct.bind(this)();
			await logic.getProductData.bind(this)();
			await logic.cartProduct.bind(this)();
			await logic.checkoutProduct.bind(this)();
			if (this.slug) await logic.pollStatus.bind(this)();
			if (this.successful) {
				this.setStatus('Checked Out.', 'SUCCESS');
				this.postSuccess();
				this.postCustomWebhook();
			}

		}
		catch (err) {
			console.log(err)
			if (err && err.code) {
				switch (err.code) {
					case 'STOP':
						this.stop();
						this.isActive = false;
						break;
					case 'FAILED':

					
						//ipcWorker.send('notify', `[${this.taskData.id}] Payment Declined.`, this.productData.productName)
						this.isActive = false;
						break;
					case 'NO TASK MODE':
						this.stop();
						this.isActive = false;
						alert('INVALID TASK MODE');
						break;
					default: console.log(err)
				}
			}
		}
	}
}



module.exports = SupremeRequest;

