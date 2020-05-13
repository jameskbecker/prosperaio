const Task = require('../../tasks/base');
const logic = require('./logic');
const { utilities } = require('../../other');
const { KWMonitor, URLMonitor } = require('../../monitors/supreme');
const request = require('request-promise-native');
const settings = require('electron-settings');

class SupremeBrowser extends Task {
	constructor(_taskData, _id) {
		super(_taskData, _id);


		this.region = 'EU';
		this.browser;
		this.page;
		this.executablePath = settings.get('browser-path');
		this.slug;
		this.restockMode = false;
		this.request = request.defaults({
			gzip: true,
			timeout: parseInt(this.taskData.delays.timeout) > 0 ? parseInt(this.taskData.delays.timeout) : 30000,
			resolveWithFullResponse: true
		});
		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
	}

	async run() {
		try {
			await this.init();
			await logic.setupBrowser.bind(this)();
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
			await logic.fetchStockData.bind(this)();
			await logic.fetchProductData.bind(this)();	
			await logic.cartProduct.bind(this)();

			await logic.checkoutProduct.bind(this)();
			await logic.processStatus.bind(this)();


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