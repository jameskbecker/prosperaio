import { Worker } from '../../../Worker';
import { RequestPromiseAPI } from 'request-promise-native';
import request from 'request-promise-native';
import settings from 'electron-settings';
import {ipcRenderer as ipcWorker } from 'electron';
import { logger, utilities } from '../../other';

class SupremeKWMonitor {
	baseUrl: string;
	inputData: {
		[key: string]: {
			NAME_POS: string[],
			NAME_NEG: string[],
			CATEGORY: string;
			CALLBACKS: Function[];
			IDS: string[];
		}
	};
	userAgent: string;
	timeout: number;
	_isRunning: boolean;
	_shouldStop: boolean;
	proxy: string;

	constructor(_options: any = {}) {
		logger.info('[Monitor] ['+_options.proxyList+'] Inititalising KW Monitor.');
		this.baseUrl = _options.baseUrl;
		this.proxy = _options.proxy ? _options.proxy : null;
		this.inputData = {};
		this._isRunning = false;
		this._shouldStop = false;
		this.timeout;

		this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

	}

	run(): void {
		if (!this._isRunning && !this._shouldStop) {
			this._isRunning = true;
			this._fetchStockData('shop');
			 //this._fetchStockData('mobile_stock');
			// this._fetchStockData('mobile/products');
		}
	}

	add(taskId: string, name: string = '', category: string = '', callback: Function): void {
		let input: any;
		if (typeof callback !== 'function') {
			return console.log('No Callback Given.');
		}
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
		const nameKWs: string[] = name.split(',');
		for (let i: number = 0; i < nameKWs.length; i++) {
			if (nameKWs[i].includes('+')) input['NAME_POS'].push(nameKWs[i].trim().substr(1).toLowerCase());
			if (nameKWs[i].includes('-')) input['NAME_NEG'].push(nameKWs[i].trim().substr(1).toLowerCase());
		}

		input['CALLBACKS'].push(callback);
		input['IDS'].push(taskId);
		this.inputData[`${name}_${category}`] = input;
		this.run();
	}

	remove(id: string): void {
		console.log('REMOVING FROM KW MONITOR');
		for (let i: number = 0; i < Object.keys(this.inputData).length; i++) {
			let property: string = Object.keys(this.inputData)[i];
			console.log(`if this.inputData[${property}]['IDS'] includes ${id}`);
			if (this.inputData[property]['IDS'].includes(id)) {
				this.inputData[property]['IDS'].splice(this.inputData[property]['IDS'].indexOf(id), 1);
				console.log('Removed:', id);
				if (this.inputData[property]['IDS'].length < 1) delete this.inputData[property];
				if (Object.keys(this.inputData).length === 0) {
					console.log('STOPPING MONITOR');
					this._shouldStop = true;
				}
				else {
					console.log('NOT STOPPING MONITOR');
				}
			}
		}

	} 

	_hasMatchingsKeywords(data: string, positive: string[], negative: string[]): boolean {
		for (let i: number = 0; i < positive.length; i++) {
			if (!data.toLowerCase().includes(positive[i].toLowerCase())) {
				return false;
			}
		}
		for (let i: number = 0; i < negative.length; i++) {
			if (data.toLowerCase().includes(negative[i].toLowerCase())) {
				return false;
			}
		}
		return true;
	}

	_parseCategory(key: any): string {
		return key;
		// const categories = {
		// 	"new": "New",
		// 	't_shirts': 'T-Shirts',
		// 	'tops_sweaters': 'Tops/Sweaters',
		// 	'bags': 'Bags',
		// 	'hats': 'Hats',
		// 	'pants': 'Pants',
		// 	'sweatshirts': 'Sweatshirts',
		// 	'shirts': 'Shirts',
		// 	'accessories': 'Accessories',
		// 	'skate': 'Skate',
		// 	'jackets': 'Jackets',
		// 	'shorts': 'Shorts',
		// 	'shoes': 'Shoes'
		// }
		// return categories[key];
	}

	setStatus(message: string, type: string, ids?: string[]): void {
		let color: string; 
		switch (type.toLowerCase()) {
			case 'info': color = '#4286f4'; break;
			case 'error': color = '#f44253'; break;
			case 'warning': color = '#f48641'; break;
			case 'success': color = '#2ed347'; break;
			default: color = '#8c8f93';
		}
		if (!ids) {
			for (let i: number = 0; i < Object.keys(this.inputData).length; i++) {
				for (let j: number = 0; j < this.inputData[Object.keys(this.inputData)[i]]['IDS'].length; j++) {
					ipcWorker.send('task.setStatus', {
						id: this.inputData[Object.keys(this.inputData)[i]]['IDS'][j],
						message: message,
						color
					});
				}
			}
		}
		else {
			for (let i: number = 0; i < ids.length; i++) {
				ipcWorker.send('task.setStatus', {
					id: ids[i],
					message: message,
					color
				});
			}
		}
	}

	_fetchStockData(endpoint: string): void {
		logger.info('[Monitor] ['+endpoint+'] Polling Supreme Stock Data.');
		this.setStatus('Searching for Product.', 'WARNING');
		let options: any = {
			url: this.baseUrl + '/' + endpoint + '.json',
			method: 'GET',
			proxy: this.proxy,
			json: true,
			gzip: true,
			time: true,
			resolveWithFullResponse: true,
			timeout: settings.has('globalTimeoutDelay') ? parseInt(<string>settings.get('globalTimeoutDelay')) : 5000,
			headers: {
				'accept': 'application/json',
				'accept-encoding': 'br, gzip, deflate',
				'accept-language': 'en-us',
				'user-agent': this.userAgent,
				'upgrade-insecure-requests': '1',
				'x-requested-with': 'XMLHttpRequest'
			}
		};
		console.log(options);
		request(options)
		.then((response: any): void => {
			let body: any = response.body;
			console.log(Object.keys(body));
			let categories: any = body.products_and_categories;
			if (Object.keys(categories).length === 0) {
				this.setStatus('Webstore Closed.', 'ERROR');
				let monitorDelay: number = settings.has('globalMonitorDelay') ? parseInt(<string>settings.get('globalMonitorDelay')) : 1000;
				this._isRunning = false;
				setTimeout(this.run.bind(this), monitorDelay);
				return;
			}
			Object.keys(this.inputData).forEach((propName: string): void => {
				let data: any = this.inputData[propName];
				this.setStatus('Searching for Product.', 'WARNING', data['IDS']);
				let parsedCategory: string = this._parseCategory(data['CATEGORY']);
				if (!categories.hasOwnProperty(parsedCategory)) {
					logger.error('[Monitor] Category Not Found.');
					this.setStatus('Category Not Found.', 'ERROR');
					let monitorDelay: number = settings.has('globalMonitorDelay') ? parseInt(<string>settings.get('globalMonitorDelay')) : 1000;
					this._isRunning = false;
					setTimeout(this.run.bind(this), monitorDelay);
					return;
				}
				else {
					logger.verbose(`[Monitor] Matched Category: ${parsedCategory}`);
					let products: any = categories[parsedCategory];
					let productName: string;
					let productId: number;
					let productPrice: number;
					for (let j: number = 0; j < products.length; j++) {
						productName = products[j].name;
						if (this._hasMatchingsKeywords(productName, data['NAME_POS'], data['NAME_NEG'])) {
							productId = products[j].id;
							productPrice = products[j].price;
							break;
						}
					}
					if (!productId) {
						logger.error('[Monitor] Product Not Found.');
						this.setStatus('Product Not Found.', 'ERROR', data['IDS']);
						let monitorDelay: number = settings.has('globalMonitorDelay') ? parseInt(<string>settings.get('globalMonitorDelay')) : 1000;
						this._isRunning = false;
						setTimeout(this.run.bind(this), monitorDelay);
						return;
					}
					else {
						logger.verbose(`[Monitor] [${endpoint}] Matched Product: ${productName} (${productId}).`);
						this._returnData(propName, productName, productId, productPrice);

					}
				}
			});
		})
		.catch((error: any): void => {
			Object.keys(this.inputData).forEach((propName: string): void => {
				let data: any = this.inputData[propName];
				let message: string;
				if (error && error.error) {
					switch (error.error.code) {
						case 'ESOCKETTIMEDOUT':
						case 'ETIMEDOUT':
							message = 'Timed Out.';
							break;
						default:
							message = 'Connection Error.';				
					}
				}
				
				logger.error(`[Monitor] ${error.message}.`);
				this.setStatus(message, 'ERROR', data['IDS']);
			});
			this._isRunning = false;
			let errorDelay: number = settings.has('globalErrorDelay') ? parseInt(<string>settings.get('globalErrorDelay')) : 1000;
			setTimeout(this.run.bind(this), errorDelay);
			return;
		});
	}

	_returnData(propName: string, name: string, id: number, price: number): void {
		let callbacks: Function[] = this.inputData[propName]['CALLBACKS'];
		for (let i: number = 0; i < callbacks.length; i++) {
			callbacks[i](name, id, price);
		}
		delete this.inputData[propName];
		this._isRunning = false;
	}
}

export default SupremeKWMonitor;