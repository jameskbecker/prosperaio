"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require('request-promise-native');
const settings = require('electron-settings');
const ipcWorker = require('electron').ipcRenderer;
const { logger, utilities } = require('../../other');
class SupremeUrlMonitor {
    constructor(_productUrl, proxy) {
        logger.info('[Monitor] [' + this.proxy + '] Inititalising Url Monitor.');
        this._productUrl = _productUrl;
        this.proxy = proxy ? proxy : '';
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
        if (!this._isRunning && Object.keys(this.callbacks).length > 0) {
            this._isRunning = true;
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
    setStatus(message, type, ids) {
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
        if (!ids) {
            for (let i = 0; i < Object.keys(this.inputData).length; i++) {
                for (let j = 0; j < this.inputData[Object.keys(this.inputData)[i]]['IDS'].length; j++) {
                    ipcWorker.send('task.setStatus', {
                        id: this.inputData[Object.keys(this.inputData)[i]]['IDS'][j],
                        message,
                        color
                    });
                }
            }
        }
        else {
            for (let i = 0; i < ids.length; i++) {
                ipcWorker.send('task.setStatus', {
                    id: ids[i],
                    message,
                    color
                });
            }
        }
    }
    _fetchProductData() {
        this.setStatus('Fetching Product Data', 'WARNING', Object.keys(this.callbacks));
        logger.info(`[Monitor] [${this._productUrl}] Fetching Product Data.`);
        let options = {
            url: this._productUrl + '.json',
            method: 'GET',
            proxy: this.proxy,
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
            .then((response) => {
            console.log(response);
            if (!response.body.hasOwnProperty('styles')) {
                logger.error(`[Monitor] [${this._productUrl}] No Style Data.`);
                let monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
                return this.run();
            }
            this._returnData(response.body.styles);
        })
            .catch((error) => {
            logger.error(`[Monitor1] [${this._productUrl}] ${error.message}.`);
            this.setStatus('Error', 'ERROR', Object.keys(this.callbacks));
            this._isRunning = false;
            return this.run();
        });
    }
    _returnData(styles) {
        for (let i = 0; i < Object.keys(this.callbacks).length; i++) {
            let id = Object.keys(this.callbacks)[i];
            this.callbacks[id](styles);
        }
        this._isRunning = false;
        this.run();
    }
}
exports.default = SupremeUrlMonitor;
//# sourceMappingURL=SupremeUrlMonitor.js.map