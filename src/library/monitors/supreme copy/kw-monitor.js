const request = require('request');
const settings = require('electron-settings');
const ipcWorker = require('electron').ipcRenderer;
const { logger } = require('../../other')
class SupremeKWMonitor {
	constructor(_options = {}) {
		//{proxy: "", timeout: undefined}
		this.baseUrl = _options.baseUrl;
		this.inputData = {};
		this._isRunning = false;
		this._shouldStop = false;
		this.timeout

		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
		
	}

	run() { 
		if (!this._isRunning && !this._shouldStop) {
			this._isRunning = true;
			this._fetchStockData('mobile_stock');
		}
	}

	add(taskId, name = '', category = '', callback) {
		let input;
		if (typeof callback !== 'function') return console.log('No Callback Given.')
		if (this.inputData.hasOwnProperty(`${name}_${category}`)) {
			input = this.inputData[`${name}_${category}`];
		}
		else {
			input = {
				'NAME_POS': [],
				'NAME_NEG': [],
				'CATEGORY': category,
				'CALLBACKS': [],
				'IDS': []
			};
		}
		const nameKWs = name.split(',');
		for (let i = 0; i < nameKWs.length; i++) {
			if (nameKWs[i].includes('+')) input['NAME_POS'].push(nameKWs[i].trim().toLowerCase().substr(1));
			if (nameKWs[i].includes('-')) input['NAME_NEG'].push(nameKWs[i].trim().toLowerCase().substr(1));
		}

		input['CALLBACKS'].push(callback);
		input['IDS'].push(taskId);
		this.inputData[`${name}_${category}`] = input;
		this.run();
	}

	remove(id) {	
		for (let i = 0; i < Object.keys(this.inputData).length; i++) {
			let property = Object.keys(this.inputData)[i];
			if (this.inputData[property]['IDS'].includes(id)) {
				this.inputData[property]['IDS'].splice(this.inputData[property]['IDS'].indexOf(id), 1);
				console.log('Removed:', id);
				if (this.inputData[property]['IDS'].length < 1) delete this.inputData[property];
				if (Object.keys(this.inputData).length === 0) {
					console.log('STOPPING MONITOR')
					this._shouldStop = true;
				}
				else {
					console.log('NOT STOPPING MONITOR')
				}
			}
		}
		
	}

	_hasMatchingsKeywords(data, positive, negative) {
		for (let i = 0; i < positive.length; i++) {
			if (!data.toLowerCase().includes(positive[i].toLowerCase())) {
				return false;
			}
		}
		for (let i = 0; i < negative.length; i++) {
			if (data.toLowerCase().includes(negative[i].toLowerCase())) {
				return false;
			}
		}
		return true;
	}


	_parseCategory(key) {
		const categories = {
			"new": "New",
			't_shirts': 'T-Shirts',
			'tops_sweaters': 'Tops/Sweaters',
			'bags': 'Bags',
			'hats': 'Hats',
			'pants': 'Pants',
			'sweatshirts': 'Sweatshirts',
			'shirts': 'Shirts',
			'accessories': 'Accessories',
			'skate': 'Skate',
			'jackets': 'Jackets',
			'shorts': 'Shorts',
			'shoes': 'Shoes'
		}
		return categories[key];
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
						id: this.inputData[Object.keys(this.inputData)[i]]['IDS']		[j],
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

	_fetchStockData(endpoint) {
		logger.debug('Polling Supreme Stock Data.');
		this._setStatus('Searching for Product.', 'WARNING');
		request({
			url: this.baseUrl + '/' + endpoint + '.json',
			method: 'GET',
			json: true,
			gzip: true,
			time: true,
			timeout: settings.has('globalTimeoutDelay') ? parseInt(settings.get('globalTimeoutDelay')) : 5000,
			headers: {
				'accept': 'application/json',
				'accept-encoding': 'br, gzip, deflate',
				'accept-language': 'en-us',
				'user-agent': this.userAgent,
				'x-requested-with': 'XMLHttpRequest'
			}
		}, (error, response, body) => {
			if (error) {
				Object.keys(this.inputData).forEach(propName => {
					let data = this.inputData[propName];
					let message;
					switch (error.code) {
						case 'ESOCKETTIMEDOUT':
						case 'ETIMEDOUT':
							message = 'Timed Out.';
							logger.error('Timed Out.');
							break;
						default:
							message = 'Connection Error.';
							logger.error(`'Unable to Poll Stock Data.' (${error.code}).`);
					}
					this._setStatus(message, 'ERROR', data['IDS'])
				});
				this._isRunning = false;
				return setTimeout(this.run.bind(this), settings.has('globalErrorDelay') ? settings.get('globalErrorDelay') : 1000);
			}
			else if (response.statusCode !== 200) {
				logger.error(`[${response.statusCode}] Unable to Fetch Stock Data.`);
				let monitorDelay = settings.has('globalMonitorDelay') ? parseInt(settings.get('globalMonitorDelay')) : 1000;
				this._isRunning = false;
				return setTimeout(this.run.bind(this), monitorDelay)
			}
			else {
				let categories = body.products_and_categories;
				if (Object.keys(categories).length === 0) {
					this._setStatus('Webstore Closed.', 'ERROR');
					let monitorDelay = settings.has('globalMonitorDelay') ? parseInt(settings.get('globalMonitorDelay')) : 1000;
					this._isRunning = false;
					return setTimeout(this.run.bind(this), monitorDelay)
				}
				Object.keys(this.inputData).forEach(propName => {
					let data = this.inputData[propName];
					this._setStatus('Searching for Product.', 'WARNING', data['IDS'])
					let parsedCategory = this._parseCategory(data['CATEGORY'])
					if (!categories.hasOwnProperty(parsedCategory)) {
						logger.error('Category Not Found.');
						this._setStatus('Category Not Found.', 'ERROR');
						let monitorDelay = settings.has('globalMonitorDelay') ? parseInt(settings.get('globalMonitorDelay')) : 1000;
						this._isRunning = false;
						return setTimeout(this.run.bind(this), monitorDelay)
					}
					else {
						logger.verbose(`Matched Category: ${parsedCategory}`)
						let products = categories[parsedCategory];
						let productName;
						let productId;
						let productPrice;
						for (let j = 0; j < products.length; j++) {
							productName = products[j].name;
							if (this._hasMatchingsKeywords(productName, data['NAME_POS'], data['NAME_NEG'])) {
								productId = products[j].id;
								productPrice = products[j].price;
								break;
							}
						}
						if (!productId) {
							logger.error('Product Not Found.');
							this._setStatus('Product Not Found.', 'ERROR', data['IDS']);
							let monitorDelay = settings.has('globalMonitorDelay') ? parseInt(settings.get('globalMonitorDelay')) : 1000;
							this._isRunning = false;
							return setTimeout(this.run.bind(this), monitorDelay)
						}
						else {
							logger.verbose(`Matched Product: ${productName} - ${productId}`)
							this._returnData(propName, productName, productId, productPrice);
							
						}
					}
				})


			}
		})
	}

	_returnData(propName, name, id, price) {
		let callbacks = this.inputData[propName]['CALLBACKS'];
		for (let i = 0; i < callbacks.length; i++) {
			callbacks[i](name, id, price);
		}
		delete this.inputData[propName];
		this._isRunning = false;
	}
}

module.exports = SupremeKWMonitor;