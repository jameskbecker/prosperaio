"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var settings = __importStar(require("electron-settings"));
var Worker_1 = __importDefault(require("../../Worker"));
var configuration_1 = require("../configuration");
var other_1 = require("../other");
require('dotenv').config();
var Task = (function () {
    function Task(taskData, _id) {
        this._taskData = taskData;
        this.baseUrl = configuration_1.sites.def[taskData.site].baseUrl;
        this.products = taskData.products;
        this._profileId = taskData.setup.profile;
        this._profile = settings.get("profiles." + this._profileId);
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
        if (this._proxyList && this._proxyList !== '' && !Worker_1.default.activeProxyLists.hasOwnProperty(this._proxyList)) {
            var proxies = settings.has('proxies') ? settings.get('proxies') : {};
            if (proxies.hasOwnProperty(this._proxyList)) {
                Worker_1.default.activeProxyLists[this._proxyList] = Object.values(proxies[this._proxyList]);
            }
        }
        if (!this._proxyList) {
            this._proxy = null;
        }
        else if (Worker_1.default.activeProxyLists[this._proxyList].length < 1) {
            this._proxy = null;
        }
        else {
            this._proxy = Worker_1.default.activeProxyLists[this._proxyList][0];
            Worker_1.default.activeProxyLists[this._proxyList].push(Worker_1.default.activeProxyLists[this._proxyList].shift());
        }
    }
    Object.defineProperty(Task.prototype, "taskData", {
        get: function () {
            return this._taskData;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "profile", {
        get: function () {
            return this._profile;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "productName", {
        get: function () {
            return this._productName;
        },
        set: function (value) {
            electron_1.ipcRenderer.send('task.setProductName', {
                id: this.id,
                name: value
            });
            this._productName = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "sizeName", {
        get: function () {
            return this._productSizeName;
        },
        set: function (value) {
            electron_1.ipcRenderer.send('task.setSizeName', {
                id: this.id,
                name: value
            });
            this._productSizeName = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "proxy", {
        get: function () {
            return other_1.utilities.formatProxy(this._proxy);
        },
        enumerable: false,
        configurable: true
    });
    Task.prototype.callStop = function () {
        if (this.isActive) {
            other_1.logger.warn("[T:" + this.id + "] Stopping Task.");
            this.setStatus('Stopping.', 'WARNING');
            this.shouldStop = true;
            if (this.isMonitoringKW) {
                try {
                    Worker_1.default.monitors.supreme.kw.remove(this.id);
                    this._stop();
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
        else
            console.log('TASK INACTIVE');
    };
    Task.prototype._stop = function () {
        console.log('RUNNING STOP()');
        if (this.isMonitoring) {
            try {
                Worker_1.default.monitors.supreme.url[this._productUrl].remove(this.id);
            }
            catch (err) {
                console.log(err);
            }
        }
        if (this.hasOwnProperty('browser')) {
            other_1.logger.info("[" + this.id + "] Closing Browser");
            this.browser.close();
        }
        this.productName = this.taskData.products[0].searchInput;
        this.sizeName = this.taskData.products[0].size;
        this.setStatus('Stopped.', 'ERROR');
        other_1.logger.error("[T:" + this.id + "] Stopped Task.");
        if (Worker_1.default.activeTasks[this.id])
            delete Worker_1.default.activeTasks[this.id];
        delete Worker_1.default.activeTasks[this.id];
    };
    Task.prototype.setStatus = function (message, type) {
        var colors = {
            DEFAULT: '#8c8f93',
            INFO: '#4286f4',
            ERROR: '#f44253',
            WARNING: '#f48641',
            SUCCESS: '#2ed347'
        };
        electron_1.ipcRenderer.send('task.setStatus', {
            id: this.id,
            message: message,
            color: colors[type]
        });
    };
    Task.prototype._requestCaptcha = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.captchaTS = Date.now();
            _this.setStatus('Waiting for Captcha.', 'WARNING');
            electron_1.ipcRenderer.send('captcha.request', {
                id: _this.id,
                type: configuration_1.sites.def[_this.taskData.site].type
            });
            other_1.logger.debug('Requested Captcha Token.');
            electron_1.ipcRenderer.on('captcha response', function (event, args) {
                if (args.id === _this.id) {
                    _this.captchaResponse = args.token;
                    _this.captchaTime = Date.now() - _this.captchaTS;
                    other_1.logger.debug("Received Captcha Token.\n" + _this.captchaResponse + " (" + _this.captchaTime + "ms)");
                    resolve();
                }
            });
        });
    };
    Task.prototype._addToAnalystics = function () {
        var exportData = {
            date: new Date().toLocaleString(),
            site: configuration_1.sites.def[this.taskData.site].label,
            product: this.productName,
            orderNumber: this.orderNumber
        };
        var currentOrders = settings.has('orders') ? settings.get('orders') : [];
        currentOrders.push(exportData);
        settings.set('orders', currentOrders, { prettify: true });
        electron_1.ipcRenderer.send('sync settings', 'orders');
    };
    Task.prototype._setTimer = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var timerInput = _this.taskData.additional.timer;
            if ((timerInput !== ' ')) {
                var dateInput = timerInput.split(' ')[0];
                var timeInput = timerInput.split(' ')[1];
                var scheduledTime = new Date();
                scheduledTime.setFullYear(parseInt(dateInput.split('-')[0]), parseInt(dateInput.split('-')[1]), parseInt(dateInput.split('-')[2]));
                scheduledTime.setHours(parseInt(timeInput.split(':', 1)[0]));
                scheduledTime.setMinutes(parseInt(timeInput.split(':', 1)[1]));
                scheduledTime.setSeconds(parseInt(timeInput.split(':')[2]));
                var remainingTime = scheduledTime.getTime() - Date.now();
                setTimeout(resolve, remainingTime);
                _this.setStatus('Timer Set.', 'INFO');
            }
            else {
                resolve();
            }
        });
    };
    Task.prototype._sleep = function (delay) {
        return new Promise(function (resolve) {
            setTimeout(resolve, delay);
        });
    };
    Task.prototype._parseKeywords = function (input) {
        if (input === '')
            return 'ANY';
        else {
            var output = {
                positive: [],
                negative: []
            };
            var indudvidalWords = input.split(',');
            for (var j = 0; j < indudvidalWords.length; j++) {
                if (indudvidalWords[j].includes('+')) {
                    output.positive.push(indudvidalWords[j].trim().toLowerCase().substr(1));
                }
                if (indudvidalWords[j].includes('-')) {
                    output.negative.push(indudvidalWords[j].trim().toLowerCase().substr(1));
                }
            }
            return output;
        }
    };
    Task.prototype._keywordsMatch = function (productName, keywordSet) {
        if (!productName || !keywordSet) {
            return false;
        }
        else if (keywordSet === 'ANY') {
            return true;
        }
        else {
            for (var i = 0; i < keywordSet.positive.length; i++) {
                if (!productName.includes(keywordSet.positive[i])) {
                    return false;
                }
            }
            for (var i = 0; i < keywordSet.negative.length; i++) {
                if (productName.includes(keywordSet.negative[i])) {
                    return false;
                }
            }
            return true;
        }
    };
    return Task;
}());
exports.default = Task;
//# sourceMappingURL=Task.js.map