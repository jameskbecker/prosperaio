const request = require('request-promise-native');
const settings = require('electron-settings');
const ipcWorker = require('electron').ipcRenderer;
const { logger, utilities } = require('../../other');

class SupremeUrlMonitor {
	constructor(_productUrl, proxyList) {
		logger.info('[Monitor] ['+proxyList+'] Inititalising Url Monitor.');
		this.productUrl = _productUrl;
		this._proxyList = proxyList;
		if (this._proxyList && this._proxyList !== "" && !global.activeProxyLists.hasOwnProperty(this._proxyList)) {
			let proxies = settings.has('proxies') ? settings.get('proxies') : {}; 
			if (proxies.hasOwnProperty(this._proxyList)) {
				global.activeProxyLists[this._proxyList] = Object.values(proxies[this._proxyList]);
			}
		}
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

	_getProxy() {
		if (!this._proxyList) {
			return null;
		}
		else if (global.activeProxyLists[this._proxyList].length < 1) {
			return null;
		}
		let proxy = global.activeProxyLists[this._proxyList][0]
		global.activeProxyLists[this._proxyList].push(global.activeProxyLists[this._proxyList].shift());
		return proxy;
	}

	_setStatus(message, type, ids) {
		let colors = {
			DEFAULT: '#8c8f93',
			INFO: '#4286f4',
			ERROR: '#f44253',
			WARNING: '#f48641',
			SUCCESS: '#2ed347'
		}
		if (!ids) {
			for (let i = 0; i < Object.keys(this.inputData).length; i++) {
				for (let j = 0; j < this.inputData[Object.keys(this.inputData)[i]]['IDS'].length; j++) {
					ipcWorker.send('task.setStatus', {
						id: this.inputData[Object.keys(this.inputData)[i]]['IDS'][j],
						message: message,
						color: colors[type]
					})
				}
			}
		}
		else {
			for (let i = 0; i < ids.length; i++) {
				ipcWorker.send('task.setStatus', {
					id: ids[i],
					message: message,
					color: colors[type]
				})
			}
		}
	}

	_fetchProductData() {
		this._setStatus('Fetching Product Data', 'WARNING', Object.keys(this.callbacks))
		logger.info(`[Monitor] [${this.productUrl}] Fetching Product Data.`);
		let options = {
			url: this.productUrl + '.json',
			method: 'GET',
			proxy: utilities.formatProxy(this._getProxy()),
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
		}
		console.log({ proxy: options.proxy })
		request(options)
		.then(response => {
			if (!response.body.hasOwnProperty('styles')) { 
				logger.error(`[Monitor] [${this.productUrl}] No Style Data.`);
				let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
				return this.run();
			}
	
			this._returnData(response.body.styles)
		})
		.catch(error => {
			logger.error(`[Monitor1] [${this.productUrl}] ${error.message}.`);
			this._setStatus('Error', 'ERROR', Object.keys(this.callbacks))
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