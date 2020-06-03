import Worker from '../../../Worker';
const request = require('request-promise-native');
const settings = require('electron-settings');
const ipcWorker = require('electron').ipcRenderer;
const { logger, utilities } = require('../../other');

class SupremeUrlMonitor {
	private _productUrl: string;
	private _proxyList: string;
	private _monitorDelay: number;
	private _timeoutDelay: number;
	private _isRunning: boolean;
	private inputData: any;
	private callbacks: any;
	

	constructor(_productUrl:string, proxyList:string) {
		logger.info('[Monitor] ['+proxyList+'] Inititalising Url Monitor.');
		this._productUrl = _productUrl;
		this._proxyList = proxyList;
		if (this._proxyList && this._proxyList !== '' && !Worker.activeProxyLists.hasOwnProperty(this._proxyList)) {
			let proxies = settings.has('proxies') ? settings.get('proxies') : {}; 
			if (proxies.hasOwnProperty(this._proxyList)) {
				Worker.activeProxyLists[this._proxyList] = Object.values(proxies[this._proxyList]);
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

	public run() {
		if (!this._isRunning && Object.keys(this.callbacks).length > 0) {	
			this._isRunning = true;
			setTimeout(this._fetchProductData.bind(this), this.monitorDelay);
		}
	}

	public add(id, callback) {
		this.callbacks[id] = callback;
		this.run();
	}

	public remove(id) {
		delete this.callbacks[id];
	}

	private _getProxy() {
		if (!this._proxyList) {
			return null;
		}
		else if (Worker.activeProxyLists[this._proxyList].length < 1) {
			return null;
		}
		let proxy = Worker.activeProxyLists[this._proxyList][0];
		Worker.activeProxyLists[this._proxyList].push(Worker.activeProxyLists[this._proxyList].shift());
		return proxy;
	}

	private setStatus(message, type, ids) {
		let colors = {
			DEFAULT: '#8c8f93',
			INFO: '#4286f4',
			ERROR: '#f44253',
			WARNING: '#f48641',
			SUCCESS: '#2ed347'
		};
		if (!ids) {
			for (let i = 0; i < Object.keys(this.inputData).length; i++) {
				for (let j = 0; j < this.inputData[Object.keys(this.inputData)[i]]['IDS'].length; j++) {
					ipcWorker.send('task.setStatus', {
						id: this.inputData[Object.keys(this.inputData)[i]]['IDS'][j],
						message: message,
						color: colors[type]
					});
				}
			}
		}
		else {
			for (let i = 0; i < ids.length; i++) {
				ipcWorker.send('task.setStatus', {
					id: ids[i],
					message: message,
					color: colors[type]
				});
			}
		}
	}

	private _fetchProductData() {
		this.setStatus('Fetching Product Data', 'WARNING', Object.keys(this.callbacks));
		logger.info(`[Monitor] [${this._productUrl}] Fetching Product Data.`);
		let options = {
			url: this._productUrl + '.json',
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
		};
		console.log({ proxy: options.proxy });
		request(options)
		.then(response => {
			if (!response.body.hasOwnProperty('styles')) { 
				logger.error(`[Monitor] [${this._productUrl}] No Style Data.`);
				let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
				return this.run();
			}
	
			this._returnData(response.body.styles);
		})
		.catch(error => {
			logger.error(`[Monitor1] [${this._productUrl}] ${error.message}.`);
			this.setStatus('Error', 'ERROR', Object.keys(this.callbacks));
			this._isRunning = false;
			return this.run();
		});
	}

	private _returnData(styles) {
		for (let i = 0; i < Object.keys(this.callbacks).length; i++) {
			let id = Object.keys(this.callbacks)[i];
			this.callbacks[id](styles);
		} 
		this._isRunning = false;
		this.run();
	}
}

export default SupremeUrlMonitor;