import { ipcRenderer as ipcWorker } from 'electron';
import request from 'request';
import settings from 'electron-settings';

import { Worker } from '../../Worker';
import {default as config} from '../configuration';
import { logger, utilities } from '../other';
import { SupremeRequest, SupremeSafe } from './supreme';
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
	baseUrl: string;
	products: Array<productProps>;
	_profileId: string;
	_profile: any;
	profileName: string;
	id: string;
	_proxyList: string;
	_proxy: string | null;
	browser: any;
	isActive: boolean;
	isMonitoring: boolean;
	isMonitoringKW:boolean;
	shouldStop: boolean;
	successful: boolean;
	
	hasCaptcha: boolean;
	captchaResponse: string;
	
	captchaTime: number;
	captchaTS: number;
	startTime: number;
	checkoutTime: number;

	_productUrl: string ;
	_productImageUrl: string;
	_productName: string;
	_productStyleName: string;
	_productSizeName: string;
	orderNumber: string;

	constructor(taskData:taskDataProps, _id:string) {
		this._taskData = taskData;
		this.baseUrl = config.sites.def[taskData.site].baseUrl;
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
			let proxies:any = settings.has('proxies') ? settings.get('proxies') : {}; 
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

	

	set productName(value:string) {
		ipcWorker.send('task.setProductName', {
			id: this.id,
			name: value
		});
		this._productName = value;
	}

	get productName():string {
		return this._productName;
	}

	set sizeName(value:string) {
		ipcWorker.send('task.setSizeName', {
			id: this.id,
			name: value
		});
		this._productSizeName = value;
	}

	get sizeName():string {
		return this._productSizeName;
	}

	get proxy():string {
		return utilities.formatProxy(this._proxy);
	}
	
	callStop():void {
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


	_stop():void {	
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

	setStatus(message:any, type:any):void {
		let color: string; 
		switch (type.toLowerCase()) {
			case 'info': color = '#4286f4'; break;
			case 'error': color = '#f44253'; break;
			case 'warning': color = '#f48641'; break;
			case 'success': color = '#2ed347'; break;
			default: color = '#8c8f93';
		}
		//log.debug(`[ ${this.id} ] [ ${type} ] ${message}`);
		ipcWorker.send('task.setStatus', {
			id: this.id,
			message: message,
			color
		});
	}
	
	_requestCaptcha():Promise<any> {
		return new Promise((resolve) => {
			this.captchaTS = Date.now();
			this.setStatus('Waiting for Captcha.', 'WARNING');
			ipcWorker.send('captcha.request', {
				id: this.id,
				type: config.sites.def[this.taskData.site].type
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



	_addToAnalystics():void {
		let exportData = {
			date: new Date().toLocaleString(),
			site: config.sites.def[this.taskData.site].label,
			product: this.productName,
			orderNumber: this.orderNumber
		};
		let currentOrders:Array<any> = settings.has('orders') ? (<Array<any>>settings.get('orders')) : [];
		currentOrders.push(exportData);
		settings.set('orders', currentOrders, {prettify:true});
		ipcWorker.send('sync settings', 'orders');
	}

	_setTimer():Promise<void> {
		return new Promise((resolve: Function) => {
			let timerInput:string = this.taskData.additional.timer;
			console.log(timerInput);
			if (timerInput !== ' ') {
				console.log('setting time');
				let dateInput:string = timerInput.split(' ')[0];
				let timeInput:string = timerInput.split(' ')[1];
				let scheduledTime = new Date();

				let year:number = parseInt(dateInput.split('-')[0]);
				let month:number = parseInt(dateInput.split('-')[1]);
				let day:number = parseInt(dateInput.split('-')[2]);
				let hour:number = parseInt(timeInput.split(':')[0]);
				let minute:number = parseInt(timeInput.split(':')[1]);
				let second:number = parseInt(timeInput.split(':')[2]);

				console.log({
					year, month, day, hour, minute, second
				});
				scheduledTime.setFullYear(year, month - 1, day);
				scheduledTime.setHours(hour);
				scheduledTime.setMinutes(minute);
				scheduledTime.setSeconds(second);

				let remainingTime:number = (scheduledTime.getTime() - Date.now());
				console.log(scheduledTime);
				setTimeout(resolve, remainingTime);
				this.setStatus('Timer Set.', 'INFO');
			}
			else {
				console.log('not setting timer');
				resolve();
			}
		});
	}

	_sleep(delay:any):Promise<any> {
		return new Promise((resolve) => {
			setTimeout(resolve, delay);
		});
	}

	_parseKeywords(input:any):any {
		//if(!input) return '';
		if (input === '') return 'ANY';
		else {
			let output:any = {
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

	_keywordsMatch(productName:any, keywordSet:any):boolean {
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