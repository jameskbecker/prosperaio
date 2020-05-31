var request = require('request-promise-native');
var settings = require('electron-settings');
var ipcWorker = require('electron').ipcRenderer;
var _a = require('../../other'), logger = _a.logger, utilities = _a.utilities;
var SupremeUrlMonitor = (function () {
    function SupremeUrlMonitor(_productUrl, proxyList) {
        logger.info('[Monitor] [' + proxyList + '] Inititalising Url Monitor.');
        this._productUrl = _productUrl;
        this._proxyList = proxyList;
        if (this._proxyList && this._proxyList !== "" && !global.activeProxyLists.hasOwnProperty(this._proxyList)) {
            var proxies = settings.has('proxies') ? settings.get('proxies') : {};
            if (proxies.hasOwnProperty(this._proxyList)) {
                global.activeProxyLists[this._proxyList] = Object.values(proxies[this._proxyList]);
            }
        }
        this.callbacks = {};
        this._monitorDelay = 1000;
        this._timeoutDelay = 30000;
        this._isRunning = false;
    }
    Object.defineProperty(SupremeUrlMonitor.prototype, "monitorDelay", {
        get: function () {
            return this._monitorDelay;
        },
        set: function (delay) {
            if (delay < 0) {
                this._monitorDelay = 1000;
            }
            else {
                this._monitorDelay = delay;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SupremeUrlMonitor.prototype, "timeoutDelay", {
        get: function () {
            return this._timeoutDelay;
        },
        set: function (delay) {
            this._timeoutDelay = delay;
        },
        enumerable: false,
        configurable: true
    });
    SupremeUrlMonitor.prototype.run = function () {
        if (!this.isRunning && Object.keys(this.callbacks).length > 0) {
            this.isRunning = true;
            setTimeout(this._fetchProductData.bind(this), this.monitorDelay);
        }
    };
    SupremeUrlMonitor.prototype.add = function (id, callback) {
        this.callbacks[id] = callback;
        this.run();
    };
    SupremeUrlMonitor.prototype.remove = function (id) {
        delete this.callbacks[id];
    };
    SupremeUrlMonitor.prototype._getProxy = function () {
        if (!this._proxyList) {
            return null;
        }
        else if (global.activeProxyLists[this._proxyList].length < 1) {
            return null;
        }
        var proxy = global.activeProxyLists[this._proxyList][0];
        global.activeProxyLists[this._proxyList].push(global.activeProxyLists[this._proxyList].shift());
        return proxy;
    };
    SupremeUrlMonitor.prototype._setStatus = function (message, type, ids) {
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
    SupremeUrlMonitor.prototype._fetchProductData = function () {
        var _this = this;
        this._setStatus('Fetching Product Data', 'WARNING', Object.keys(this.callbacks));
        logger.info("[Monitor] [" + this._productUrl + "] Fetching Product Data.");
        var options = {
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
            .then(function (response) {
            if (!response.body.hasOwnProperty('styles')) {
                logger.error("[Monitor] [" + _this._productUrl + "] No Style Data.");
                var monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
                return _this.run();
            }
            _this._returnData(response.body.styles);
        })
            .catch(function (error) {
            logger.error("[Monitor1] [" + _this._productUrl + "] " + error.message + ".");
            _this._setStatus('Error', 'ERROR', Object.keys(_this.callbacks));
            _this.isRunning = false;
            return _this.run();
        });
    };
    SupremeUrlMonitor.prototype._returnData = function (styles) {
        for (var i = 0; i < Object.keys(this.callbacks).length; i++) {
            var id = Object.keys(this.callbacks)[i];
            this.callbacks[id](styles);
        }
        this.isRunning = false;
        this.run();
    };
    return SupremeUrlMonitor;
}());
module.exports = SupremeUrlMonitor;
//# sourceMappingURL=SupremeUrlMonitor.js.map