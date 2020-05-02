const Task = require('../../tasks/base');
const logic = require('./logic');
const { utilities } = require('../../other');
const { KWMonitor, URLMonitor } = require('../../monitors/supreme');
const request = require('request');
class SupremeBrowser extends Task {
	constructor(_taskData, _id) {
		super(_taskData, _id);
		this.region = 'EU';
		this.foundProduct = false;
		this.monitor = null;
		this.browser;
		this.page;
		this.executablePath;
		this.checkoutAttempts = 0;
		this.slug;
		this.restockMode = false;
		this.request = request.defaults({
			gzip: true,
			timeout: parseInt(this.taskData.delays.timeout) > 0 ? parseInt(this.taskData.delays.timeout) : 30000,
		});
		this.times = {
			foundProduct: 0,
			fetchedProductData: 0,
			cart: 0,
			checkout: 0,
			processing: 0
		}
		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
	}

	async run() {
		try {
			await this.init();
			await logic.init.bind(this)();
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
			} 
			if (!global.monitors.supreme.kw) {
				global.monitors.supreme.kw = new KWMonitor({
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
			if (this.successful === true) {
				this.setStatus('SUCCESSFULLY CHECKED OUT', 'SUCCESS');
				await this.postToDiscord();
			}

		}
		catch (err) {
			if (err && err.code) {
				switch (err.code) {
					case 'STOP':
						this.stop();
						this.isActive = false;
						break;
					case 'FAILED':
						this.isActive = false;
						break;

					
					case 'NO TASK MODE':
						this.stop();
						this.isActive = false;
						alert('INVALID TASK MODE');
					default: console.log(err)
				}
			}
			console.log(err)
		}
	}
}

module.exports = SupremeBrowser; 