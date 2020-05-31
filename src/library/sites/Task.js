const electron = require('electron')
const ipcWorker = electron.ipcRenderer;
const request = require("request");
const settings = require('electron-settings');
const { discord, sites } = require('../configuration');
const { logger, utilities } = require('../other');
require('dotenv').config()


class Task {
	constructor(_taskData = {}, _id) {
		this.taskData = _taskData;
		this.baseUrl = sites.default[_taskData.site].baseUrl;
		this.products = _taskData.products;
		this._profileId = _taskData.setup.profile;
		this.profile = settings.get(`profiles.${this._profileId}`);
		this.profileName = this.profile.profileName;
		
		this.id = _id;

		this.isActive = true;
		this.isMonitoring = false;
		this.shouldStop = false;
		this.successful = false;		

	

		this._productUrl = null;
		this._productImageUrl = null;
		this._productName = null;
		this._productStyleName = null;
		this._productSizeName = null;

		this.orderNumber = null;
		
		this.hasCaptcha = _taskData.additional.skipCaptcha ? false : true;
		this._proxyList = _taskData.additional.proxyList || null;
		this.captchaResponse = '';
		this.captchaTime = 0;
		this.captchaTS = null;
		
		this.startTime = 0;
		this.checkoutTime = 0;
		
			
		if (this._proxyList && this._proxyList !== "" && !global.activeProxyLists.hasOwnProperty(this._proxyList)) {
			let proxies = settings.has('proxies') ? settings.get('proxies') : {}; 
			if (proxies.hasOwnProperty(this._proxyList)) {
				global.activeProxyLists[this._proxyList] = Object.values(proxies[this._proxyList]);
			}
		}

		if (!this._proxyList) {
			this._proxy = null;
		}
		else if (global.activeProxyLists[this._proxyList].length < 1) {
			this._proxy = null;
		}
		else {
			this._proxy = global.activeProxyLists[this._proxyList][0]
			global.activeProxyLists[this._proxyList].push(global.activeProxyLists[this._proxyList].shift());
		}
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
	
	callStop() {
		if (this.isActive) {
			logger.warn(`[T:${this.id}] Stopping Task.`);
			this._setStatus('Stopping.', 'WARNING');
			this.shouldStop = true;
			if (this.isMonitoringKW) {
				try { global.monitors.supreme.kw.remove(this.id); 
					this._stop();} 
				
				catch(err) { console.log(err) }
			}
		}
		else console.log('TASK INACTIVE');
		
	}


	_stop() {	
		console.log('RUNNING STOP()')
		if (this.isMonitoring) {
			
			try { global.monitors.supreme.url[this._productUrl].remove(this.id); } 
			catch(err) { console.log(err) }

			

		}
		if (this.browser) {
			logger.info(`[${this.id}] Closing Browser`)
			this.browser.close();
		}

		this.productName = this.taskData.products[0].searchInput;
		this.sizeName = this.taskData.products[0].size;

		this._setStatus('Stopped.', 'ERROR');
		logger.error(`[T:${this.id}] Stopped Task.`);
		if (activeTasks[this.id]) delete activeTasks[this.id];
		
		delete activeTasks[this.id];		
		delete this;
	}

	_setStatus(message, type) {
		let colors = {
			DEFAULT: '#8c8f93',
			INFO: '#4286f4',
			ERROR: '#f44253',
			WARNING: '#f48641',
			SUCCESS: '#2ed347'
		}
		//log.debug(`[ ${this.id} ] [ ${type} ] ${message}`);
		ipcWorker.send('task.setStatus', {
			id: this.id,
			message: message,
			color: colors[type]
		})
	}
	
	_requestCaptcha() {
		return new Promise((resolve) => {
			this.captchaTS = Date.now();
			this._setStatus('Waiting for Captcha.', 'WARNING');
			ipcWorker.send('captcha.request', {
				id: this.id,
				type: sites.default[this.taskData.site].type
			});
			logger.debug('Requested Captcha Token.')
			//memory leak
			this.continue = resolve;
			ipcWorker.on('captcha response', (event, args) => {
				if (args.id === this.id) {
					this.captchaResponse = args.token;
					this.captchaTime = Date.now() - this.captchaTS;
					logger.debug(`Received Captcha Token.\n${this.captchaResponse} (${this.captchaTime}ms)`)
					resolve();	
				}		
			})
		})
	}

	_postPublicWebhook(additonalFields = []) {
		request({
			url: process.env.SUCCESS_WEBHOOK_URL,
			method: 'POST',
			json: true,
			body: discord.publicWebhook.bind(this)(additonalFields)
		}, (error, response, body) => {	
			if (error) {
				console.log(error)
			}
			else {
				switch (response.statusMessage) {
					case "NO CONTENT":
						console.log('Sent Webhook.');
						console.log('Remaining Requests:', response.headers['x-ratelimit-remaining'])
						break;

					case "TOO MANY REQUESTS":
						console.log('Reached Rate Limit.');
						return setTimeout(this._postPrivateWebhook.bind(this, additonalFields), 2500)
						break;

					case "BAD REQUEST":
						console.log('Format Error')
						console.log(JSON.stringify(response.body));
						break;
					
					default:
						console.log(response.statusCode, response.statusMessage)
				}
			}
		})
	}
 
	_postPrivateWebhook(additonalFields = []) {
		if (settings.has('discord')) {
			const webhookUrl = settings.get('discord');
			request({
				url: webhookUrl,
				method: 'POST',
				json: true,
				body: discord.privateWebhook.bind(this)(additonalFields)
			}, (error, response, body) => {	
				if (error) {
					console.log(error)
				}
				else {
					switch (response.statusMessage) {
						case "NO CONTENT":
							console.log('Sent Webhook.');
							console.log('Remaining Requests:', response.headers['x-ratelimit-remaining'])
							break;

						case "TOO MANY REQUESTS":
							console.log('Reached Rate Limit.');
							return setTimeout(this._postPrivateWebhook.bind(this, additonalFields), 2500)
							break;

						case "BAD REQUEST":
							console.log('Format Error')
							console.log(JSON.stringify(response.body));
							break;
						
						default:
							console.log(response.statusCode, response.statusMessage)
					}
				}
			})
		}
	}

	_addToAnalystics() {
		let exportData = {
			date: new Date().toLocaleString(),
			site: sites.default[this.taskData.site].label,
			product: this.productName,
			orderNumber: this.orderNumber
		}
		let currentOrders = settings.get('orders') || [];
		currentOrders.push(exportData);
		settings.set('orders', currentOrders, {prettify:true});
		ipcWorker.send('sync settings', 'orders')
	}

	_setTimer() {
		return new Promise((resolve) => {
			let timerInput = this.taskData.additional.timer
			if ((timerInput !== ' ' || '' || null || undefined)) {
				let dateInput = timerInput.split(' ')[0];
				let timeInput = timerInput.split(' ')[1];
				let scheduledTime = new Date();
				scheduledTime.setFullYear(dateInput.split('-')[0], dateInput.split('-')[1] - 1, dateInput.split('-')[2])
				scheduledTime.setHours(timeInput.split(':')[0]);
				scheduledTime.setMinutes(timeInput.split(':')[1]);
				scheduledTime.setSeconds(timeInput.split(':')[2]);
				let remainingTime = scheduledTime.getTime() - Date.now();
				setTimeout(resolve, remainingTime);
				this._setStatus("Timer Set.", "INFO");
			}
			else {
				resolve();
			}
		});
	}

	_sleep(delay) {
		return new Promise((resolve) => {
			setTimeout(resolve, delay);
		})
	}

	_parseKeywords(input) {
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

	_keywordsMatch(productName, keywordSet) {
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

module.exports = Task;