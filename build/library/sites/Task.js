var electron = require('electron');
var ipcWorker = electron.ipcRenderer;
var request = require("request");
var settings = require('electron-settings');
var _a = require('../configuration'), discord = _a.discord, sites = _a.sites;
var _b = require('../other'), logger = _b.logger, utilities = _b.utilities;
require('dotenv').config();
var Task = (function () {
    function Task(_taskData, _id) {
        if (_taskData === void 0) { _taskData = {}; }
        this.taskData = _taskData;
        this.baseUrl = sites.default[_taskData.site].baseUrl;
        this.products = _taskData.products;
        this._profileId = _taskData.setup.profile;
        this.profile = settings.get("profiles." + this._profileId);
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
            var proxies = settings.has('proxies') ? settings.get('proxies') : {};
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
            this._proxy = global.activeProxyLists[this._proxyList][0];
            global.activeProxyLists[this._proxyList].push(global.activeProxyLists[this._proxyList].shift());
        }
    }
    Object.defineProperty(Task.prototype, "productName", {
        get: function () {
            return this._productName;
        },
        set: function (value) {
            ipcWorker.send('task.setProductName', {
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
            ipcWorker.send('task.setSizeName', {
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
            return utilities.formatProxy(this._proxy);
        },
        enumerable: false,
        configurable: true
    });
    Task.prototype.callStop = function () {
        if (this.isActive) {
            logger.warn("[T:" + this.id + "] Stopping Task.");
            this._setStatus('Stopping.', 'WARNING');
            this.shouldStop = true;
            if (this.isMonitoringKW) {
                try {
                    global.monitors.supreme.kw.remove(this.id);
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
                global.monitors.supreme.url[this._productUrl].remove(this.id);
            }
            catch (err) {
                console.log(err);
            }
        }
        if (this.browser) {
            logger.info("[" + this.id + "] Closing Browser");
            this.browser.close();
        }
        this.productName = this.taskData.products[0].searchInput;
        this.sizeName = this.taskData.products[0].size;
        this._setStatus('Stopped.', 'ERROR');
        logger.error("[T:" + this.id + "] Stopped Task.");
        if (activeTasks[this.id])
            delete activeTasks[this.id];
        delete activeTasks[this.id];
        delete this;
    };
    Task.prototype._setStatus = function (message, type) {
        var colors = {
            DEFAULT: '#8c8f93',
            INFO: '#4286f4',
            ERROR: '#f44253',
            WARNING: '#f48641',
            SUCCESS: '#2ed347'
        };
        ipcWorker.send('task.setStatus', {
            id: this.id,
            message: message,
            color: colors[type]
        });
    };
    Task.prototype._requestCaptcha = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.captchaTS = Date.now();
            _this._setStatus('Waiting for Captcha.', 'WARNING');
            ipcWorker.send('captcha.request', {
                id: _this.id,
                type: sites.default[_this.taskData.site].type
            });
            logger.debug('Requested Captcha Token.');
            _this.continue = resolve;
            ipcWorker.on('captcha response', function (event, args) {
                if (args.id === _this.id) {
                    _this.captchaResponse = args.token;
                    _this.captchaTime = Date.now() - _this.captchaTS;
                    logger.debug("Received Captcha Token.\n" + _this.captchaResponse + " (" + _this.captchaTime + "ms)");
                    resolve();
                }
            });
        });
    };
    Task.prototype._postPublicWebhook = function (additonalFields) {
        var _this = this;
        if (additonalFields === void 0) { additonalFields = []; }
        request({
            url: process.env.SUCCESS_WEBHOOK_URL,
            method: 'POST',
            json: true,
            body: discord.publicWebhook.bind(this)(additonalFields)
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
            else {
                switch (response.statusMessage) {
                    case "NO CONTENT":
                        console.log('Sent Webhook.');
                        console.log('Remaining Requests:', response.headers['x-ratelimit-remaining']);
                        break;
                    case "TOO MANY REQUESTS":
                        console.log('Reached Rate Limit.');
                        return setTimeout(_this._postPrivateWebhook.bind(_this, additonalFields), 2500);
                        break;
                    case "BAD REQUEST":
                        console.log('Format Error');
                        console.log(JSON.stringify(response.body));
                        break;
                    default:
                        console.log(response.statusCode, response.statusMessage);
                }
            }
        });
    };
    Task.prototype._postPrivateWebhook = function (additonalFields) {
        var _this = this;
        if (additonalFields === void 0) { additonalFields = []; }
        if (settings.has('discord')) {
            var webhookUrl = settings.get('discord');
            request({
                url: webhookUrl,
                method: 'POST',
                json: true,
                body: discord.privateWebhook.bind(this)(additonalFields)
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                }
                else {
                    switch (response.statusMessage) {
                        case "NO CONTENT":
                            console.log('Sent Webhook.');
                            console.log('Remaining Requests:', response.headers['x-ratelimit-remaining']);
                            break;
                        case "TOO MANY REQUESTS":
                            console.log('Reached Rate Limit.');
                            return setTimeout(_this._postPrivateWebhook.bind(_this, additonalFields), 2500);
                            break;
                        case "BAD REQUEST":
                            console.log('Format Error');
                            console.log(JSON.stringify(response.body));
                            break;
                        default:
                            console.log(response.statusCode, response.statusMessage);
                    }
                }
            });
        }
    };
    Task.prototype._addToAnalystics = function () {
        var exportData = {
            date: new Date().toLocaleString(),
            site: sites.default[this.taskData.site].label,
            product: this.productName,
            orderNumber: this.orderNumber
        };
        var currentOrders = settings.get('orders') || [];
        currentOrders.push(exportData);
        settings.set('orders', currentOrders, { prettify: true });
        ipcWorker.send('sync settings', 'orders');
    };
    Task.prototype._setTimer = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var timerInput = _this.taskData.additional.timer;
            if ((timerInput !== ' ' || '' || null || undefined)) {
                var dateInput = timerInput.split(' ')[0];
                var timeInput = timerInput.split(' ')[1];
                var scheduledTime = new Date();
                scheduledTime.setFullYear(dateInput.split('-')[0], dateInput.split('-')[1] - 1, dateInput.split('-')[2]);
                scheduledTime.setHours(timeInput.split(':')[0]);
                scheduledTime.setMinutes(timeInput.split(':')[1]);
                scheduledTime.setSeconds(timeInput.split(':')[2]);
                var remainingTime = scheduledTime.getTime() - Date.now();
                setTimeout(resolve, remainingTime);
                _this._setStatus("Timer Set.", "INFO");
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
module.exports = Task;
//# sourceMappingURL=Task.js.map