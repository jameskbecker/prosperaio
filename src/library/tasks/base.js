const electron = require('electron')
const ipcWorker = electron.ipcRenderer;
const request = require("request");
const isDev = require('electron-is-dev')
const settings = require('electron-settings');
const { discord, sites } = require('../configuration');
const { logger } = require('../other');

class Task {
	constructor(_taskData = {}, id) {
		this.taskData = _taskData;
		this.site = _taskData.site;
		this.baseUrl = sites.default[_taskData.site].baseUrl;
		this.products = _taskData.products;
		this.profileName = _taskData.setup.profile;
		this.profile;
		this.id = id;

		this.isActive = false;
		this.isMonitoring = false;
		this.shouldStop = false;
		this.proxyList = [];

		this.productData = {};
		this.productImageUrl = null;
		this.productName = null;
		this.productColour = null;
		this.productSizeName = null;
		this.orderNumber = null;
		
		this.hasCaptcha = true;
		this.captchaAccount = '';
		this.captchaResponse = '';
		this.captchaTime = 0;
		this.captchaTS = null;
		
		this.startTime = 0;
		this.checkoutTime = 0;
	}

	init() {
		return new Promise((resolve) => {
			this.setStatus('Initialising.', 'INFO');
			logger.info(`[T:${this.id}] Initialising.`)
			this.isActive = true;
		
			let proxyLists = settings.has('proxies') ? settings.get('proxies') : {};
			let listName = this.taskData.additional.proxyList;
			let proxyData = proxyLists.hasOwnProperty(listName) ? proxyLists[listName] : {};
			this.buildProxyList(proxyData)
			
			this.profile = settings.get(`profiles.${this.profileName}`);
			this.hasCaptcha = this.taskData.additional.skipCaptcha ? false : true;
			resolve();
		})
	}

	buildProxyList(data = {}) {
		let output = [];
		for (let i = 0; i < Object.keys(data).length; i++) {
			let proxyId = Object.keys(data)[i];
			output.push(data[proxyId])
		}
		this.proxyList = output;
	}
	
	callStop() {
		logger.warn(`[T:${this.id}] Stopping Task.`);
		this.setStatus('Stopping.', 'WARNING');
		if (this.isMonitoring) {
			try { global.monitors.supreme.kw.remove(this.id); } 
			catch(err) { }
			try { global.monitors.supreme.url[this.productUrl].remove(this.id); } 
			catch(err) { }

			this.stop();

		}
		else { this.shouldStop = true; }
	}

	stop() {	
		if (this.browser) {
			logger.info(`[${this.id}] Closing Browser`)
			this.browser.close();
		}
		this.setStatus('Stopped.', 'ERROR');
		logger.error(`[T:${this.id}] Stopped Task.`);
		if (activeTasks[this.id]) delete activeTasks[this.id];
		
		delete activeTasks[this.id];		
		delete this;
	}

	setProductName() {
		ipcWorker.send('task.setProductName', {
			id: this.id,
			name: this.productName
		})
	}

	setSizeName() {
		ipcWorker.send('task.setSizeName', {
			id: this.id,
			name: this.productSizeName
		})
	}

	setStatus(message, type) {
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
	
	requestCaptcha() {
		return new Promise((resolve) => {
			this.captchaTS = Date.now();
			this.setStatus('Waiting for Captcha.', 'WARNING');
			ipcWorker.send('captcha.request', {
				id: this.id,
				type: sites.default[this.site].type
			});
			logger.debug('Requested Captcha Token.')
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

	postPublicWebhook(additonalFields = []) {
		const webhookUrl = !isDev ? settings.get('discord') : 'https://discordapp.com/api/webhooks/502032689138892800/mP-ufXie1I0TecSAcbY98dPw88G9RxTBpbkWvZ8Nz1LHuf2-cLm-yVJkg2Sc_UM1GN6l';
		request({
			url: webhookUrl,
			method: 'POST',
			json: true,
			body: discord.public.bind(this)(additonalFields)
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
						return setTimeout(this.postPrivateWebhook.bind(this, additonalFields), 2500)
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
 
	postPrivateWebhook(additonalFields = []) {
		if (settings.has('discord')) {
			const webhookUrl = settings.get('discord');
			request({
				url: webhookUrl,
				method: 'POST',
				json: true,
				body: discord.private.bind(this)(additonalFields)
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
							return setTimeout(this.postPrivateWebhook.bind(this, additonalFields), 2500)
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

	addToAnalystics() {
		let exportData = {
			date: new Date().toLocaleString(),
			site: sites.default[this.site].label,
			product: this.productName,
			orderNumber: this.orderNumber
		}
		let currentOrders = settings.get('orders') || [];
		currentOrders.push(exportData);
		settings.set('orders', currentOrders, {prettify:true});
		ipcWorker.send('sync settings', {type: 'orders'})
	}
} 
module.exports = Task;