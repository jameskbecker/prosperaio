"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_settings_1 = __importDefault(require("electron-settings"));
const Worker_1 = require("../../Worker");
const configuration_1 = __importDefault(require("../configuration"));
const other_1 = require("../other");
require('dotenv').config();
class Task {
    constructor(taskData, _id) {
        this._taskData = taskData;
        this.baseUrl = configuration_1.default.sites.def[taskData.site].baseUrl;
        this.products = taskData.products;
        this._profileId = taskData.setup.profile;
        this._profile = electron_settings_1.default.get(`profiles.${this._profileId}`);
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
        if (this._proxyList && this._proxyList !== '' && !Worker_1.Worker.activeProxyLists.hasOwnProperty(this._proxyList)) {
            let proxies = electron_settings_1.default.has('proxies') ? electron_settings_1.default.get('proxies') : {};
            if (proxies.hasOwnProperty(this._proxyList)) {
                Worker_1.Worker.activeProxyLists[this._proxyList] = Object.values(proxies[this._proxyList]);
            }
        }
        if (!this._proxyList) {
            this._proxy = null;
        }
        else if (Worker_1.Worker.activeProxyLists[this._proxyList].length < 1) {
            this._proxy = null;
        }
        else {
            this._proxy = Worker_1.Worker.activeProxyLists[this._proxyList][0];
            Worker_1.Worker.activeProxyLists[this._proxyList].push(Worker_1.Worker.activeProxyLists[this._proxyList].shift());
        }
    }
    get taskData() {
        return this._taskData;
    }
    get profile() {
        return this._profile;
    }
    set productName(value) {
        electron_1.ipcRenderer.send('task.setProductName', {
            id: this.id,
            name: value
        });
        this._productName = value;
    }
    get productName() {
        return this._productName;
    }
    set sizeName(value) {
        electron_1.ipcRenderer.send('task.setSizeName', {
            id: this.id,
            name: value
        });
        this._productSizeName = value;
    }
    get sizeName() {
        return this._productSizeName;
    }
    get proxy() {
        return other_1.utilities.formatProxy(this._proxy);
    }
    callStop() {
        if (this.isActive) {
            other_1.logger.warn(`[T:${this.id}] Stopping Task.`);
            this.setStatus('Stopping.', 'WARNING');
            this.shouldStop = true;
            if (this.isMonitoringKW) {
                try {
                    Worker_1.Worker.monitors.supreme.kw.remove(this.id);
                    this._stop();
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
        else
            console.log('TASK INACTIVE');
    }
    _stop() {
        console.log('RUNNING STOP()');
        if (this.isMonitoring) {
            try {
                Worker_1.Worker.monitors.supreme.url[this._productUrl].remove(this.id);
            }
            catch (err) {
                console.log(err);
            }
        }
        if (this.hasOwnProperty('browser')) {
            other_1.logger.info(`[${this.id}] Closing Browser`);
            this.browser.close();
        }
        this.productName = this.taskData.products[0].searchInput;
        this.sizeName = this.taskData.products[0].size;
        this.setStatus('Stopped.', 'ERROR');
        other_1.logger.error(`[T:${this.id}] Stopped Task.`);
        if (Worker_1.Worker.activeTasks[this.id])
            delete Worker_1.Worker.activeTasks[this.id];
        delete Worker_1.Worker.activeTasks[this.id];
    }
    setStatus(message, type) {
        let color;
        switch (type.toLowerCase()) {
            case 'info':
                color = '#4286f4';
                break;
            case 'error':
                color = '#f44253';
                break;
            case 'warning':
                color = '#f48641';
                break;
            case 'success':
                color = '#2ed347';
                break;
            default: color = '#8c8f93';
        }
        electron_1.ipcRenderer.send('task.setStatus', {
            id: this.id,
            message: message,
            color
        });
    }
    _requestCaptcha() {
        return new Promise((resolve) => {
            this.captchaTS = Date.now();
            this.setStatus('Waiting for Captcha.', 'WARNING');
            electron_1.ipcRenderer.send('captcha.request', {
                id: this.id,
                type: configuration_1.default.sites.def[this.taskData.site].type
            });
            other_1.logger.debug('Requested Captcha Token.');
            electron_1.ipcRenderer.on('captcha response', (event, args) => {
                if (args.id === this.id) {
                    this.captchaResponse = args.token;
                    this.captchaTime = Date.now() - this.captchaTS;
                    other_1.logger.debug(`Received Captcha Token.\n${this.captchaResponse} (${this.captchaTime}ms)`);
                    resolve();
                }
            });
        });
    }
    _addToAnalystics() {
        let exportData = {
            date: new Date().toLocaleString(),
            site: configuration_1.default.sites.def[this.taskData.site].label,
            product: this.productName,
            orderNumber: this.orderNumber
        };
        let currentOrders = electron_settings_1.default.has('orders') ? electron_settings_1.default.get('orders') : [];
        currentOrders.push(exportData);
        electron_settings_1.default.set('orders', currentOrders, { prettify: true });
        electron_1.ipcRenderer.send('sync settings', 'orders');
    }
    _setTimer() {
        return new Promise((resolve) => {
            let timerInput = this.taskData.additional.timer;
            console.log(timerInput);
            if (timerInput !== ' ') {
                console.log('setting time');
                let dateInput = timerInput.split(' ')[0];
                let timeInput = timerInput.split(' ')[1];
                let scheduledTime = new Date();
                let year = parseInt(dateInput.split('-')[0]);
                let month = parseInt(dateInput.split('-')[1]);
                let day = parseInt(dateInput.split('-')[2]);
                let hour = parseInt(timeInput.split(':')[0]);
                let minute = parseInt(timeInput.split(':')[1]);
                let second = parseInt(timeInput.split(':')[2]);
                console.log({
                    year, month, day, hour, minute, second
                });
                scheduledTime.setFullYear(year, month - 1, day);
                scheduledTime.setHours(hour);
                scheduledTime.setMinutes(minute);
                scheduledTime.setSeconds(second);
                let remainingTime = (scheduledTime.getTime() - Date.now());
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
    _sleep(delay) {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }
    _parseKeywords(input) {
        if (input === '')
            return 'ANY';
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
exports.default = Task;
//# sourceMappingURL=Task.js.map