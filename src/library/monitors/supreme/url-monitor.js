const request = require('request-promise-native');
const settings = require('electron-settings');
const { logger } = require('../../other');

class SupremeUrlMonitor {
	constructor(_productUrl) {
		logger.info('[Monitor] Inititalising Url Monitor.');
		this.productUrl = _productUrl;
		this.callbacks = {};
		this._monitorDelay = 1000;
		this._timeoutDelay = 30000;
		this._isRunning = false;
	}

	get monitorDelay() {
		return this._monitorDelay;
	}
	
	set monitorDelay(delay) {
		if (delay < 0) {
			this._monitorDelay = 1000;
		}
		else {
			this._monitorDelay = delay;
		}
	}

	get timeoutDelay() {
		return this._timeoutDelay;
	}

	set timeoutDelay(delay) {
		this._timeoutDelay = delay;
	}

	run() {
		if (!this.isRunning && Object.keys(this.callbacks).length > 0) {	
			this.isRunning = true;
			setTimeout(this._fetchProductData.bind(this), this.monitorDelay);
		}
	}

	add(id, callback) {
		this.callbacks[id] = callback;
		this.run();
	}

	remove(id) {
		delete this.callbacks[id];
	}

	_fetchProductData() {
		logger.info(`[Monitor] [${this.productUrl}] Fetching Product Data.`);
		request({
			url: this.productUrl + '.json',
			method: 'GET',
			json: true,
			gzip: true,
			resolveWithFullResponse: true,
			timeout: settings.has('globalTimeoutDelay') ? parseInt(settings.get('globalTimeoutDelay')) : 5000,
			headers: {
				'accept': 'application/json',
				'accept-encoding': 'gzip, deflate, br',
				'accept-language': 'en-us',
				'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
				'x-requested-with': 'XMLHttpRequest'
			}
		})
		.then(response => {
			if (!response.body.hasOwnProperty('styles')) { 
				logger.error(`[Monitor] [${this.productUrl}] No Style Data.`);
				let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
				return this.run();
			}
			this._returnData(response.body.styles)
		})
		.catch(error => {
			logger.error(`[Monitor] [${this.productUrl}] ${error.message}.`);
			this.isRunning = false;
			return this.run();
		})
	}

	_returnData(styles) {
		for (let i = 0; i < Object.keys(this.callbacks).length; i++) {
			let id = Object.keys(this.callbacks)[i];
			this.callbacks[id](styles);
		} 
		this.isRunning = false;
		this.run();
	}
}

module.exports = SupremeUrlMonitor;