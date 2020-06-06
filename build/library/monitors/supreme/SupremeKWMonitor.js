"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Worker_1 = require("../../../Worker");
var request = require('request-promise-native');
var settings = require('electron-settings');
var ipcWorker = require('electron').ipcRenderer;
var _a = require('../../other'), logger = _a.logger, utilities = _a.utilities;
var SupremeKWMonitor = (function () {
    function SupremeKWMonitor(_options) {
        if (_options === void 0) { _options = {}; }
        logger.info('[Monitor] [' + _options.proxyList + '] Inititalising KW Monitor.');
        this.baseUrl = _options.baseUrl;
        this._proxyList = _options.proxyList;
        if (this._proxyList && this._proxyList !== '' && !Worker_1.Worker.activeProxyLists.hasOwnProperty(this._proxyList)) {
            var proxies = settings.has('proxies') ? settings.get('proxies') : {};
            if (proxies.hasOwnProperty(this._proxyList)) {
                Worker_1.Worker.activeProxyLists[this._proxyList] = Object.values(proxies[this._proxyList]);
            }
        }
        this.inputData = {};
        this._isRunning = false;
        this._shouldStop = false;
        this.timeout;
        this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
    }
    SupremeKWMonitor.prototype.run = function () {
        if (!this._isRunning && !this._shouldStop) {
            this._isRunning = true;
            this._fetchStockData('shop');
        }
    };
    SupremeKWMonitor.prototype.add = function (taskId, name, category, callback) {
        if (name === void 0) { name = ''; }
        if (category === void 0) { category = ''; }
        var input;
        if (typeof callback !== 'function') {
            return console.log('No Callback Given.');
        }
        if (this.inputData.hasOwnProperty(name + "_" + category)) {
            input = this.inputData[name + "_" + category];
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
        var nameKWs = name.split(',');
        for (var i = 0; i < nameKWs.length; i++) {
            if (nameKWs[i].includes('+'))
                input['NAME_POS'].push(nameKWs[i].trim().substr(1).toLowerCase());
            if (nameKWs[i].includes('-'))
                input['NAME_NEG'].push(nameKWs[i].trim().substr(1).toLowerCase());
        }
        input['CALLBACKS'].push(callback);
        input['IDS'].push(taskId);
        this.inputData[name + "_" + category] = input;
        this.run();
    };
    SupremeKWMonitor.prototype.remove = function (id) {
        console.log('REMOVING FROM KW MONITOR');
        for (var i = 0; i < Object.keys(this.inputData).length; i++) {
            var property = Object.keys(this.inputData)[i];
            console.log("if this.inputData[" + property + "]['IDS'] includes " + id);
            if (this.inputData[property]['IDS'].includes(id)) {
                this.inputData[property]['IDS'].splice(this.inputData[property]['IDS'].indexOf(id), 1);
                console.log('Removed:', id);
                if (this.inputData[property]['IDS'].length < 1)
                    delete this.inputData[property];
                if (Object.keys(this.inputData).length === 0) {
                    console.log('STOPPING MONITOR');
                    this._shouldStop = true;
                }
                else {
                    console.log('NOT STOPPING MONITOR');
                }
            }
        }
    };
    SupremeKWMonitor.prototype._getProxy = function () {
        if (!this._proxyList) {
            return null;
        }
        else if (Worker_1.Worker.activeProxyLists[this._proxyList].length < 1) {
            return null;
        }
        var proxy = Worker_1.Worker.activeProxyLists[this._proxyList][0];
        Worker_1.Worker.activeProxyLists[this._proxyList].push(Worker_1.Worker.activeProxyLists[this._proxyList].shift());
        return proxy;
    };
    SupremeKWMonitor.prototype._hasMatchingsKeywords = function (data, positive, negative) {
        for (var i = 0; i < positive.length; i++) {
            if (!data.toLowerCase().includes(positive[i].toLowerCase())) {
                return false;
            }
        }
        for (var i = 0; i < negative.length; i++) {
            if (data.toLowerCase().includes(negative[i].toLowerCase())) {
                return false;
            }
        }
        return true;
    };
    SupremeKWMonitor.prototype._parseCategory = function (key) {
        return key;
    };
    SupremeKWMonitor.prototype.setStatus = function (message, type, ids) {
        var colors = {
            DEFAULT: '#8c8f93',
            INFO: '#4286f4',
            ERROR: '#f44253',
            WARNING: '#f48641',
            SUCCESS: '#2ed347'
        };
        if (!ids) {
            for (var i = 0; i < Object.keys(this.inputData).length; i++) {
                for (var j = 0; j < this.inputData[Object.keys(this.inputData)[i]]['IDS'].length; j++) {
                    ipcWorker.send('task.setStatus', {
                        id: this.inputData[Object.keys(this.inputData)[i]]['IDS'][j],
                        message: message,
                        color: colors[type]
                    });
                }
            }
        }
        else {
            for (var i = 0; i < ids.length; i++) {
                ipcWorker.send('task.setStatus', {
                    id: ids[i],
                    message: message,
                    color: colors[type]
                });
            }
        }
    };
    SupremeKWMonitor.prototype._fetchStockData = function (endpoint) {
        var _this = this;
        logger.info('[Monitor] [' + endpoint + '] Polling Supreme Stock Data.');
        this.setStatus('Searching for Product.', 'WARNING');
        var options = {
            url: this.baseUrl + '/' + endpoint + '.json',
            method: 'GET',
            proxy: utilities.formatProxy(this._getProxy()),
            json: true,
            gzip: true,
            time: true,
            resolveWithFullResponse: true,
            timeout: settings.has('globalTimeoutDelay') ? parseInt(settings.get('globalTimeoutDelay')) : 5000,
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
            .then(function (response) {
            var body = response.body;
            console.log(Object.keys(body));
            var categories = body.products_and_categories;
            if (Object.keys(categories).length === 0) {
                _this.setStatus('Webstore Closed.', 'ERROR');
                var monitorDelay = settings.has('globalMonitorDelay') ? parseInt(settings.get('globalMonitorDelay')) : 1000;
                _this._isRunning = false;
                return setTimeout(_this.run.bind(_this), monitorDelay);
            }
            Object.keys(_this.inputData).forEach(function (propName) {
                var data = _this.inputData[propName];
                _this.setStatus('Searching for Product.', 'WARNING', data['IDS']);
                var parsedCategory = _this._parseCategory(data['CATEGORY']);
                if (!categories.hasOwnProperty(parsedCategory)) {
                    logger.error('[Monitor] Category Not Found.');
                    _this.setStatus('Category Not Found.', 'ERROR');
                    var monitorDelay = settings.has('globalMonitorDelay') ? parseInt(settings.get('globalMonitorDelay')) : 1000;
                    _this._isRunning = false;
                    return setTimeout(_this.run.bind(_this), monitorDelay);
                }
                else {
                    logger.verbose("[Monitor] Matched Category: " + parsedCategory);
                    var products = categories[parsedCategory];
                    var productName = void 0;
                    var productId = void 0;
                    var productPrice = void 0;
                    for (var j = 0; j < products.length; j++) {
                        productName = products[j].name;
                        if (_this._hasMatchingsKeywords(productName, data['NAME_POS'], data['NAME_NEG'])) {
                            productId = products[j].id;
                            productPrice = products[j].price;
                            break;
                        }
                    }
                    if (!productId) {
                        logger.error('[Monitor] Product Not Found.');
                        _this.setStatus('Product Not Found.', 'ERROR', data['IDS']);
                        var monitorDelay = settings.has('globalMonitorDelay') ? parseInt(settings.get('globalMonitorDelay')) : 1000;
                        _this._isRunning = false;
                        return setTimeout(_this.run.bind(_this), monitorDelay);
                    }
                    else {
                        logger.verbose("[Monitor] [" + endpoint + "] Matched Product: " + productName + " (" + productId + ").");
                        _this._returnData(propName, productName, productId, productPrice);
                    }
                }
            });
        })
            .catch(function (error) {
            Object.keys(_this.inputData).forEach(function (propName) {
                var data = _this.inputData[propName];
                var message;
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
                logger.error("[Monitor] " + error.message + ".");
                _this.setStatus(message, 'ERROR', data['IDS']);
            });
            _this._isRunning = false;
            return setTimeout(_this.run.bind(_this), settings.has('globalErrorDelay') ? settings.get('globalErrorDelay') : 1000);
        });
    };
    SupremeKWMonitor.prototype._returnData = function (propName, name, id, price) {
        var callbacks = this.inputData[propName]['CALLBACKS'];
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](name, id, price);
        }
        delete this.inputData[propName];
        this._isRunning = false;
    };
    return SupremeKWMonitor;
}());
exports.default = SupremeKWMonitor;
//# sourceMappingURL=SupremeKWMonitor.js.map