const request = require('request');
const settings = require('electron-settings');
const { logger } = require('../../other');
class SupremeUrlMonitor {
	constructor(_options) {
		this.inputData = {};
		this.isRunning = false;
		this.monitorDelay = 1000;
		this.errorDelay = 1000;
		this.timeoutDelay = 5000;
		this.baseUrl = _options.baseUrl;
		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
	}

	run() {
		if (!this.isRunning) {	
			console.log(this.inputData)
			this.isRunning = true;
			Object.keys(this.inputData).forEach(productUrl => {
				this._fetchProductData(productUrl);
			})
		}
		else {
			//logger.info('Supreme URL Monitor Already Running.')
		}
	}

	add(id, url, callback) {
		let input;
		if (!this.inputData[url]) input = {};
		else input = this.inputData[url];
		input[id] = callback;
		this.inputData[url] = input;
		
		this.run();
	}

	remove(id, url) {
		for (let i = 0; i < Object.keys(this.inputData[url]).length; i++) {
			let id = Object.keys(this.inputData[url])[i];
			delete this.inputData[url][id];
			if (Object.keys(this.inputData[url]).length < 1) {
				delete this.inputData[url];
			}
			if (Object.keys(this.inputData).length < 1) {
				this.isRunning = false;
			}
		}
	}

	_fetchProductData(productUrl) {
		logger.debug(`Fetching Data for: ${productUrl}`);
		request({
			url: productUrl + '.json',
			method: 'GET',
			json: true,
			gzip: true,
			timeout: settings.has('globalTimeoutDelay') ? parseInt(settings.get('globalTimeoutDelay')) : 5000,
			headers: {
				'accept': 'application/json',
				'accept-encoding': 'gzip, deflate, br',
				'accept-language': 'en-us',
				'user-agent': this.userAgent,
				'x-requested-with': 'XMLHttpRequest'
			}
		}, (error, response, body) => {
			if (error) {
				logger.error(`Error Fetching Product Data (${error.code}).`);
				let errorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
				return setTimeout(this._fetchProductData.bind(this, productUrl), errorDelay);
			}
			else if (response.statusCode !== 200) {
				switch (response.statusCode) {
					default:
						logger.error(`[${response.statusCode}] Unable to Fetch Product Data.`);
						let errorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
						return setTimeout(this._fetchProductData.bind(this, productUrl), errorDelay);
				}
			}
			else {
				if (!body.hasOwnProperty('styles')) { 
					logger.error(`No Style Data.`);
					let errorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
					return setTimeout(this._fetchProductData.bind(this, productUrl), errorDelay);
				}
				else {
					let styles = body.styles;
					this._returnData(productUrl, styles)
				}
			}
		})
	}

	_returnData(url, styles) {
		for (let i = 0; i < Object.keys(this.inputData[url]).length; i++) {
			let id = Object.keys(this.inputData[url])[i];
			this.inputData[url][id](styles);
		} 
		delete this.inputData[url];
		if (Object.keys(this.inputData).length < 1) {
			this.isRunning = false;
		}
	}
}

module.exports = SupremeUrlMonitor;