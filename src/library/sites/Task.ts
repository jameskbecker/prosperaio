import { ipcRenderer as ipcWorker } from 'electron';
import * as request from 'request';
import * as settings from 'electron-settings';

import Worker from '../../Worker';
import { discord, sites } from '../configuration';
import { logger, utilities } from '../other';
import { SupremeSafe, SupremeRequest } from './supreme';
require('dotenv').config();


interface setupProps {
	profile: string;
	mode: string;
	restockMode: string;
	checkoutAttempts: number;
}

interface delayProps {
	cart: number;
	checkout: number;
}

interface additionalProps {
	proxyList: string;
	maxPrice: number;
	timer: string;
	monitorRestocks: boolean;
	skipCaptcha: boolean;
	enableThreeDS: boolean;
}

interface productProps {
	searchInput: string;
	category: string;
	size: string;
	style: string;
	productQty: string;
}

interface taskDataProps {
	setup: setupProps;
	site: string;
	delays: delayProps;
	additional: additionalProps;
	products: Array<productProps>;
}


class Task {
	private _taskData: taskDataProps;
	public baseUrl: string;
	public products: Array<productProps>;
	public _profileId: string;
	public _profile: any;
	public profileName: string;
	public id: string;
	public _proxyList: string;
	public _proxy: string | null;
	public browser: any;
	public isActive: boolean;
	public isMonitoring: boolean;
	public isMonitoringKW:boolean;
	public shouldStop: boolean;
	public successful: boolean;
	
	public hasCaptcha: boolean;
	public captchaResponse: string;
	
	public captchaTime: number;
	public captchaTS: number;
	public startTime: number;
	public checkoutTime: number;

	public _productUrl: string ;
	public _productImageUrl: string;
	public _productName: string;
	public _productStyleName: string;
	public _productSizeName: string;
	public orderNumber: string;

	constructor(taskData:taskDataProps, _id:string) {
		this._taskData = taskData;
		this.baseUrl = sites.def[taskData.site].baseUrl;
		this.products = taskData.products;
		this._profileId = taskData.setup.profile;
		this._profile = settings.get(`profiles.${this._profileId}`);
		this.profileName = this.profile.profileName;
		
		this.id = _id;

		this.isActive = true;
		this.isMonitoring = false;
		this.isMonitoringKW = false;
		this.shouldStop = false;
		this.successful = false;		

	

		this._productUrl = '';
		this._productImageUrl = '';
		this._productName = '';
		this._productStyleName = '';
		this._productSizeName = '';

		this.orderNumber = null;
		
		this.hasCaptcha = taskData.additional.skipCaptcha ? false : true;
		this._proxyList = taskData.additional.proxyList || null;
		this.captchaResponse = '';
		this.captchaTime = 0;
		this.captchaTS = null;
		
		this.startTime = 0;
		this.checkoutTime = 0;
		
			
		if (this._proxyList && this._proxyList !== '' && !Worker.activeProxyLists.hasOwnProperty(this._proxyList)) {
			let proxies = settings.has('proxies') ? settings.get('proxies') : {}; 
			if (proxies.hasOwnProperty(this._proxyList)) {
				Worker.activeProxyLists[this._proxyList] = Object.values(proxies[this._proxyList]);
			}
		}

		if (!this._proxyList) {
			this._proxy = null;
		}
		else if (Worker.activeProxyLists[this._proxyList].length < 1) {
			this._proxy = null;
		}
		else {
			this._proxy = Worker.activeProxyLists[this._proxyList][0];
			Worker.activeProxyLists[this._proxyList].push(Worker.activeProxyLists[this._proxyList].shift());
		}
	}

	get taskData():taskDataProps {
		return this._taskData;
	}

	get profile():any {
		return this._profile;
	}

	

	set productName(value) {
		ipcWorker.send('task.setProductName', {
			id: this.id,
			name: value
		});
		this._productName = value;
	}

	get productName() {
		return this._productName;
	}

	set sizeName(value) {
		ipcWorker.send('task.setSizeName', {
			id: this.id,
			name: value
		});
		this._productSizeName = value;
	}

	get sizeName() {
		return this._productSizeName;
	}

	get proxy() {
		return utilities.formatProxy(this._proxy);
	}
	
	public callStop() {
		if (this.isActive) {
			logger.warn(`[T:${this.id}] Stopping Task.`);
			this.setStatus('Stopping.', 'WARNING');
			this.shouldStop = true;
			if (this.isMonitoringKW) {
				try { Worker.monitors.supreme.kw.remove(this.id); 
					this._stop();} 
				
				catch(err) { console.log(err); }
			}
		}
		else console.log('TASK INACTIVE');
		
	}


	public _stop() {	
		console.log('RUNNING STOP()');
		if (this.isMonitoring) {
			
			try { Worker.monitors.supreme.url[this._productUrl].remove(this.id); } 
			catch(err) { console.log(err); }

			

		}
		if (this.hasOwnProperty('browser')) {
			logger.info(`[${this.id}] Closing Browser`);
			this.browser!.close();
		}

		this.productName = this.taskData.products[0].searchInput;
		this.sizeName = this.taskData.products[0].size;

		this.setStatus('Stopped.', 'ERROR');
		logger.error(`[T:${this.id}] Stopped Task.`);
		if (Worker.activeTasks[this.id]) delete Worker.activeTasks[this.id];
		
		delete Worker.activeTasks[this.id];
	}

	public setStatus(message, type) {
		let colors = {
			DEFAULT: '#8c8f93',
			INFO: '#4286f4',
			ERROR: '#f44253',
			WARNING: '#f48641',
			SUCCESS: '#2ed347'
		};
		//log.debug(`[ ${this.id} ] [ ${type} ] ${message}`);
		ipcWorker.send('task.setStatus', {
			id: this.id,
			message: message,
			color: colors[type]
		});
	}
	
	public _requestCaptcha() {
		return new Promise((resolve) => {
			this.captchaTS = Date.now();
			this.setStatus('Waiting for Captcha.', 'WARNING');
			ipcWorker.send('captcha.request', {
				id: this.id,
				type: sites.def[this.taskData.site].type
			});
			logger.debug('Requested Captcha Token.');
			//memory leak
			ipcWorker.on('captcha response', (event, args) => {
				if (args.id === this.id) {
					this.captchaResponse = args.token;
					this.captchaTime = Date.now() - this.captchaTS;
					logger.debug(`Received Captcha Token.\n${this.captchaResponse} (${this.captchaTime}ms)`);
					resolve();	
				}		
			});
		});
	}



	public _addToAnalystics() {
		let exportData = {
			date: new Date().toLocaleString(),
			site: sites.def[this.taskData.site].label,
			product: this.productName,
			orderNumber: this.orderNumber
		};
		let currentOrders:Array<any> = settings.has('orders') ? (<Array<any>>settings.get('orders')) : [];
		currentOrders.push(exportData);
		settings.set('orders', currentOrders, {prettify:true});
		ipcWorker.send('sync settings', 'orders');
	}

	public _setTimer() {
		return new Promise(( resolve) => {
			let timerInput:string = this.taskData.additional.timer;
			if ((timerInput !== ' ')) {
				let dateInput:string = timerInput.split(' ')[0];
				let timeInput:string = timerInput.split(' ')[1];
				let scheduledTime = new Date();
				scheduledTime.setFullYear(parseInt(dateInput.split('-')[0]), parseInt(dateInput.split('-')[1]), parseInt(dateInput.split('-')[2]));
				scheduledTime.setHours(parseInt(timeInput.split(':', 1)[0]));
				scheduledTime.setMinutes(parseInt(timeInput.split(':', 1)[1]));
				scheduledTime.setSeconds(parseInt(timeInput.split(':')[2]));
				let remainingTime = scheduledTime.getTime() - Date.now();
				setTimeout(resolve, remainingTime);
				this.setStatus('Timer Set.', 'INFO');
			}
			else {
				resolve();
			}
		});
	}

	public _sleep(delay) {
		return new Promise((resolve) => {
			setTimeout(resolve, delay);
		});
	}

	public _parseKeywords(input) {
		//if(!input) return '';
		if (input === '') return 'ANY';
		else {
			let output = {
				positive: [],
				negative: []
			};
				let indudvidalWords = input.split(',');
				for (let j = 0; j < indudvidalWords.length; j++) {
					if (indudvidalWords[j].includes('+')) {
						output.positive.push(indudvidalWords[j].trim().toLowerCase().substr(1));
					}
					if (indudvidalWords[j].includes('-')) {
						output.negative.push(indudvidalWords[j].trim().toLowerCase().substr(1));
					}
				}
		
			return output;
		}	
	}

	public _keywordsMatch(productName, keywordSet) {
		if (!productName || !keywordSet) {
			return false;
		}
		
		else if (keywordSet === 'ANY') {
			return true;
		}
		else {
			for (let i = 0; i < keywordSet.positive.length; i++) {
				if (!productName.includes(keywordSet.positive[i])) {
					return false;
				}
			}
			for (let i = 0; i < keywordSet.negative.length; i++) {
				if (productName.includes(keywordSet.negative[i])) {
					return false;
				}
			}
			return true;
		}
	}
}

export default Task;