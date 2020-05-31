var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Task = require('../Task');
var _a = require('../../other'), utilities = _a.utilities, logger = _a.logger;
var _b = require('../../monitors/supreme'), URLMonitor = _b.URLMonitor, KWMonitor = _b.KWMonitor;
var settings = require('electron-settings');
var request = require('request-promise-native');
var cheerio = require('cheerio');
var SupremeBase = (function (_super) {
    __extends(SupremeBase, _super);
    function SupremeBase(_taskData, _id) {
        var _this = _super.call(this, _taskData, _id) || this;
        _this.restockMode = false;
        _this.request = request.defaults({
            gzip: true,
            timeout: settings.has('globalTimeoutDelay') ? settings.get('globalTimeoutDelay') : 5000,
            resolveWithFullResponse: true
        });
        _this.cookieJar = _this.request.jar();
        _this.formElements = [];
        _this.cookieSub = '';
        _this.slug = '';
        _this.checkoutAttempts = 0;
        _this.checkoutData = {};
        _this.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.5 Mobile/15E148 Snapchat/10.77.0.54 (like Safari/604.1)';
        switch (_this.taskData.site) {
            case 'supreme-eu':
                _this.region = 'EU';
                break;
            case 'supreme-us':
                _this.region = 'US';
                break;
            case 'supreme-jp':
                _this.region = 'JP';
                break;
        }
        return _this;
    }
    Object.defineProperty(SupremeBase.prototype, "checkoutDelay", {
        set: function (delay) {
            if (delay <= 0)
                this.checkoutDelay = 0;
            else
                this.checkoutDelay = delay;
        },
        enumerable: false,
        configurable: true
    });
    SupremeBase.prototype._fetchStockData = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            function runStage() {
                return __awaiter(this, void 0, void 0, function () {
                    var searchInput, category, maxPrice;
                    var _this = this;
                    return __generator(this, function (_a) {
                        if (!global.monitors.supreme.kw) {
                            global.monitors.supreme.kw = new KWMonitor({
                                baseUrl: this.baseUrl,
                                proxyList: this._proxyList
                            });
                        }
                        searchInput = this.products[0].searchInput;
                        category = this.products[0].category;
                        maxPrice = this.taskData.additional.maxPrice;
                        if (!searchInput.includes('+') && !searchInput.includes('-')) {
                            this._setStatus('Invalid Search Input.', 'ERROR');
                            reject(new Error('INVALID INPUT'));
                            return [2];
                        }
                        logger.warn("[T:" + this.id + "] Adding Keywords to Monitor.");
                        this._setStatus('Fetching Stock Data.', 'WARNING');
                        this.isMonitoringKW = true;
                        if (this.shouldStop)
                            return [2, this._stop()];
                        global.monitors.supreme.kw.add(this.id, searchInput, category, function (name, id, price) {
                            _this.isMonitoringKW = false;
                            if (maxPrice > 0 && (price / 100) > maxPrice) {
                                _this._setStatus('Price Exceeds Limit.', 'ERROR');
                                reject(new Error('PRICE LIMIT'));
                                return;
                            }
                            _this.startTS = Date.now();
                            _this.productId = id;
                            _this.productName = name;
                            _this.mobileUrl = _this.baseUrl + '/mobile#products/' + _this.productId;
                            _this._productUrl = _this.baseUrl + '/shop/' + _this.productId;
                            resolve();
                            return;
                        });
                        return [2];
                    });
                });
            }
            runStage.bind(_this)();
        });
    };
    SupremeBase.prototype._fetchProductData = function () {
        return new Promise(function runStage(resolve, reject) {
            var _this = this;
            if (!global.monitors.supreme.url.hasOwnProperty(this._productUrl)) {
                global.monitors.supreme.url[this._productUrl] = new URLMonitor(this._productUrl, this._proxyList);
            }
            this.isMonitoring = true;
            if (this.shouldStop)
                return this._stop();
            this._setStatus('Fetching Product Data.', 'WARNING');
            var monitorDelay = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
            global.monitors.supreme.url[this._productUrl].monitorDelay = monitorDelay;
            global.monitors.supreme.url[this._productUrl].add(this.id, function (styles) {
                try {
                    if (_this.shouldStop)
                        return _this._stop();
                    var sizeData = void 0;
                    var styleName = void 0;
                    var styleId = void 0;
                    var imageUrl = void 0;
                    for (var i = 0; i < styles.length; i++) {
                        if (_this._keywordsMatch(styles[i].name.toLowerCase(), _this._parseKeywords(_this.products[0].style))) {
                            styleName = styles[i].name;
                            styleId = styles[i].id;
                            imageUrl = 'https:' + styles[i].image_url;
                            switch (_this.products[0].size) {
                                case "RANDOM":
                                    sizeData = styles[i].sizes[Math.floor(Math.random() * styles[i].sizes.length)];
                                    break;
                                case "SMALLEST":
                                    sizeData = styles[i].sizes[0];
                                    break;
                                case "LARGEST":
                                    sizeData = styles[i].sizes[styles[i].sizes.length - 1];
                                    break;
                                default:
                                    sizeData = styles[i].sizes.filter(function (size) { return size.name.toLowerCase().includes(_this.products[0].size); })[0] || null;
                            }
                            break;
                        }
                    }
                    if (!styleName) {
                        throw new Error('Style Not Found');
                    }
                    if (!sizeData) {
                        throw new Error('Size Not Found');
                    }
                    _this.sizeName = sizeData.name;
                    _this._productStyleName = styleName;
                    _this.sizeId = sizeData.id;
                    _this.styleId = styleId;
                    _this._productImageUrl = imageUrl;
                    logger.verbose("[T:" + _this.id + "] [" + _this.styleId + "] Matched Style: " + _this._productStyleName + ".");
                    logger.verbose("[T:" + _this.id + "] [" + _this.sizeId + "] Matched Size : " + _this.sizeName + ".");
                    if (_this.taskData.setup.restockMode === 'stock' && !sizeData.stock_level) {
                        _this.restockMode = true;
                        throw new Error('OOS');
                    }
                    global.monitors.supreme.url[_this._productUrl].remove(_this.id);
                    _this.isMonitoring = false;
                    resolve();
                }
                catch (error) {
                    switch (error.message) {
                        case 'OOS':
                            _this._setStatus('OOS. Retrying.', 'ERROR');
                            logger.error("[T:" + _this.id + "] [" + _this.productName + "] OOS");
                            break;
                        case 'Style Not Found':
                            _this._setStatus('Style Not Found', 'ERROR');
                            logger.error("[T:" + _this.id + "] Style Not Found");
                            break;
                        case 'Size Not Found':
                            _this._setStatus('Size Not Found', 'ERROR');
                            logger.error("[T:" + _this.id + "] [" + _this.productName + "] Size Not Found");
                            break;
                        default:
                            _this._setStatus('Error. Retrying', 'ERROR');
                            console.log(error);
                    }
                    var monitorDelay_1 = settings.has('globalMonitorDelay') ? settings.get('globalMonitorDelay') : 1000;
                    return setTimeout(runStage.bind(_this, resolve, reject), monitorDelay_1);
                }
            });
        }.bind(this));
    };
    SupremeBase.prototype._parseCheckoutForm = function (checkoutTemplate) {
        var formElements = [];
        var $ = cheerio.load(checkoutTemplate);
        var checkoutForm = $('form[action="https://www.supremenewyork.com/checkout.json"]').html();
        $ = cheerio.load(checkoutForm);
        $(':input[type!="submit"]').each(function () {
            var formElement = $(this)[0].attribs;
            var output = {};
            var attributes = ["name", "id", "placeholder", "value", "style"];
            attributes.forEach(function (attribute) {
                if (Object.hasOwnProperty.bind(formElement)(attribute)) {
                    output[attribute] = formElement[attribute];
                }
            });
            if (Object.keys(output).length > 0) {
                formElements.push(output);
            }
        });
        return formElements;
    };
    SupremeBase.prototype._pollStatus = function () {
        var options = {
            url: this.baseUrl + '/checkout/' + this.slug + '/status.json',
            method: 'GET',
            proxy: utilities.formatProxy(this._getProxy()),
            json: true,
            jar: this.cookieJar,
            headers: {
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'origin': this.baseUrl,
                'referer': this.baseUrl + '/mobile',
                'user-agent': this.userAgent
            }
        };
        return this.request(options);
    };
    SupremeBase.prototype._processStatus = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var requestedAuth = false;
            function runStage(isCheckoutResponse) {
                if (isCheckoutResponse === void 0) { isCheckoutResponse = false; }
                return __awaiter(this, void 0, void 0, function () {
                    function authHandler() {
                        var _this = this;
                        return new Promise(function (resolve, reject) {
                            ipcWorker.once("cardinal.validated(" + _this.id + ")", function (event, args) {
                                console.log('[IPC', "cardinal.validated(" + _this.id + ")\n", args);
                                if (args.responseJWT) {
                                    logger.debug('Payment Success');
                                    resolve();
                                }
                                else {
                                    logger.debug('Payment Failure');
                                    reject();
                                }
                            });
                            ipcWorker.send('cardinal.continue', {
                                taskId: _this.id,
                                cardData: {
                                    "AcsUrl": _this.cardinal.authentication.url,
                                    "Payload": _this.cardinal.authentication.payload,
                                },
                                cardOData: {
                                    "Consumer": _this.cardinal.consumerData,
                                    "OrderDetails": {
                                        TransactionId: _this.cardinal.transactionId
                                    }
                                }
                            });
                        });
                    }
                    var error, errorDelay, errorDelay, errorDelay;
                    var _this = this;
                    return __generator(this, function (_a) {
                        try {
                            if (!isCheckoutResponse) {
                                this._pollStatus()
                                    .then(function (response) {
                                    _this.checkoutData = response.body;
                                })
                                    .catch(function (error) {
                                    return setTimeout(runStage.bind(_this), 1000);
                                });
                            }
                            error = void 0;
                            logger.info("Checkout Status:\n" + JSON.stringify(this.checkoutData, null, ' '));
                            switch (this.checkoutData.status) {
                                case 'queued':
                                    this._setStatus('Processing...', 'WARNING');
                                    logger.warn(this.slug ? "[T." + this.id + "] Queued - " + this.slug + "." : "[T." + this.id + "] Queued.");
                                    if (this.checkoutData.hasOwnProperty('slug'))
                                        this.slug = this.checkoutData.slug;
                                    return [2, setTimeout(runStage.bind(this, false), 1000)];
                                case 'failed':
                                    if (this.checkoutData.hasOwnProperty('id'))
                                        this.orderNumber = this.checkoutData.id;
                                    if (this.checkoutData.errors) {
                                        this.setStatus('Billing Error', 'ERROR');
                                    }
                                    else if (this.checkoutData.page) {
                                        this.setStatus('High Traffic Decline');
                                        logger.error("[T." + this.id + "] Payment Failed.");
                                        if (this.checkoutAttempts < this.taskData.setup.checkoutAttempts) {
                                            errorDelay = settings.has('errorDelay') ? settings.get('errorDelay') : 1000;
                                            return [2, setTimeout(runStage.bind(this, isCheckoutResponse), errorDelay)];
                                        }
                                        else {
                                            error = new Error();
                                            error.code = 'FAILED';
                                            return [2, resolve()];
                                        }
                                    }
                                    else {
                                        this._setStatus('Payment Declined.', 'ERROR');
                                        logger.error("[T." + this.id + "] Payment Failed.");
                                        if (this.checkoutAttempts < this.taskData.setup.checkoutAttempts) {
                                            errorDelay = settings.has('errorDelay') ? settings.get('errorDelay') : 1000;
                                            setTimeout(runStage.bind(this, isCheckoutResponse), errorDelay);
                                        }
                                        else {
                                            error = new Error();
                                            error.code = 'FAILED';
                                            return [2, resolve()];
                                        }
                                    }
                                case 'cca':
                                    this._setStatus('CCA', 'WARNING');
                                    this.cardinal.tid = uuidv4();
                                    this.cardinal.transactionId = this.checkoutData.transaction_id;
                                    this.cardinal.authentication.url = this.checkoutData.acs_url;
                                    this.cardinal.authentication.payload = this.checkoutData.payload;
                                    this.cardinal.consumerData = this.checkoutData.consumer;
                                    authHandler.bind(this)()
                                        .then(function () {
                                        return checkout.submit.bind(_this)('cardinal');
                                    })
                                        .then(function (response) {
                                        console.log(response.body);
                                        _this.checkoutData = response.body;
                                        return Promise.resolve();
                                    })
                                        .then(function () {
                                        setTimeout(runStage.bind(_this, false), 1000);
                                        return Promise.resolve();
                                    })
                                        .catch(function (error) {
                                        console.log(error);
                                    });
                                    break;
                                case 'cardinal_queued':
                                    this._setStatus('Processing...', 'WARNING');
                                    logger.warn("[T." + this.id + "] Cardinal Queued.");
                                    return [2, setTimeout(runStage.bind(this, false), 1000)];
                                case 'paid':
                                    if (this.checkoutData.hasOwnProperty('id'))
                                        this.orderNumber = this.checkoutData.id;
                                    this.successful = true;
                                    resolve();
                                    return [2];
                                case 'dup':
                                    this._setStatus('Duplicate Order.', 'ERROR');
                                    error = new Error();
                                    error.code = 'FAILED';
                                    reject(error);
                                    return [2];
                                case 'canada':
                                    this._setStatus('Not Available in Canada.', 'ERROR');
                                    error = new Error();
                                    error.code = 'FAILED';
                                    reject(error);
                                    return [2];
                                case 'blocked_country':
                                    this._setStatus('N/A in Selected Country.', 'ERROR');
                                    error = new Error();
                                    error.code = 'FAILED';
                                    reject(error);
                                    return [2];
                                case 'blacklisted':
                                    this._setStatus('Blacklisted.', 'ERROR');
                                    error = new Error();
                                    error.code = 'FAILED';
                                    reject(error);
                                    return [2];
                                case 'outOfStock':
                                    this._setStatus('Out of Stock.', 'ERROR');
                                    if (this.taskData.additional.monitorRestocks) {
                                        this.restockMode = true;
                                        error = new Error();
                                        error.code = 'RESTOCKS';
                                    }
                                    else {
                                        error = new Error();
                                        error.code = 'FAILED';
                                    }
                                    reject(error);
                                    return [2];
                                case 'paypal':
                                    this._setStatus('Checkout Status: Paypal.', 'INFO');
                                    return [2];
                                default:
                                    console.log(this.checkoutData);
                                    this._setStatus('Unexpected Error', 'ERROR');
                                    error = new Error();
                                    error.code = 'UNEXPECTED';
                                    reject(error);
                            }
                        }
                        catch (error) {
                            switch (error.code) {
                                case 'UNEXPECTED':
                                default:
                                    console.log(error);
                                    this._setStatus('Error. Retrying.');
                                    errorDelay = settings.has('errorDelay') ? settings.get('errorDelay') : 1000;
                                    setTimeout(runStage.bind(this, isCheckoutResponse), errorDelay);
                            }
                        }
                        return [2];
                    });
                });
            }
            runStage.bind(_this)(true);
        });
    };
    SupremeBase.prototype._form = function (type) {
        var form;
        switch (type) {
            case 'cart-add':
                if (this.region === 'US') {
                    form = {
                        "s": this.sizeId + "",
                        "st": this.styleId + "",
                        "qty": this.products[0].productQty || 1
                    };
                }
                else {
                    form = {
                        "size": this.sizeId + "",
                        "style": this.styleId + "",
                        "qty": this.products[0].productQty || 1
                    };
                }
                break;
            case 'mobile-totals':
                form = {
                    "order[billing_country]": this.profile.billing.country,
                    "cookie-sub": this.cookieSub,
                    "mobile": true
                };
                break;
            case 'parsed-checkout':
                form = {
                    'g-recaptcha-response': this.captchaResponse
                };
                if (Math.floor(Math.random() * 2))
                    form['is_from_ios_native'] = '1';
                for (var i = 0; i < this.formElements.length; i++) {
                    var element = this.formElements[i];
                    if (element.hasOwnProperty('style') &&
                        element.style.includes('absolute')) {
                        var name_1 = element.name || element.id;
                        form[name_1] = element.value || '';
                    }
                    else if (element.placeholder) {
                        switch (element.placeholder) {
                            case 'full name':
                            case 'na‌me':
                                form[element.name] = this.profile.billing.first + " " + this.profile.billing.last || '';
                                break;
                            case 'email':
                                form[element.name] = this.profile.billing.email || '';
                                break;
                            case 'telephone':
                                form[element.name] = this.profile.billing.telephone || '';
                                break;
                            case 'address':
                                form[element.name] = this.profile.billing.address1 || '';
                                break;
                            case 'address 2':
                            case 'apt, unit, etc':
                                form[element.name] = this.profile.billing.address2 || '';
                                break;
                            case 'postcode':
                            case 'zip':
                                form[element.name] = this.profile.billing.zip || '';
                                break;
                            case 'city':
                                form[element.name] = this.profile.billing.city || '';
                                break;
                            case 'state':
                                form[element.name] = this.profile.billing.state || '';
                                break;
                            case 'credit card number':
                                form[element.name] = this.profile.payment.cardNumber || '';
                                break;
                            case 'cvv':
                                form[element.name] = this.profile.payment.cvv || '';
                                break;
                        }
                    }
                    else if (element.id && !element.value) {
                        switch (element.id) {
                            case 'store_credit_id':
                                form[element.name] = '';
                                break;
                            case 'cookie-sub':
                                form[element.name] = this.cookieSub || '';
                                break;
                            case 'order_billing_country':
                                form[element.name] = this.profile.billing.country || '';
                                break;
                            case 'credit_card_type':
                                form[element.name] = this.profile.payment.type || '';
                                break;
                            case 'credit_card_month':
                                form[element.name] = this.profile.payment.expiryMonth || '';
                                break;
                            case 'credit_card_year':
                                form[element.name] = this.profile.payment.expiryYear || '';
                                break;
                        }
                    }
                    else if (element.name !== 'store_address') {
                        form[element.name] = (element.hasOwnProperty('value') ? element.value : '');
                    }
                }
                if (this.region === 'EU') {
                    form['cardinal_id'] = this.cardinal && this.cardinal.id ? this.cardinal.id : '';
                }
                break;
        }
        logger.verbose(JSON.stringify(form, null, '\t'));
        return form;
    };
    SupremeBase.prototype._setCookie = function (name, value) {
        var url = this.baseUrl.replace('https://', '');
        try {
            if (this.cookieJar._jar.store.idx[url]) {
                delete this.cookieJar._jar.store.idx[url]['/']['' + name];
            }
        }
        catch (err) {
            console.log(err);
        }
        try {
            var cookie = name + "=" + value;
            this.cookieJar.setCookie(cookie, this.baseUrl);
        }
        catch (err) {
            console.log(err);
        }
    };
    ;
    SupremeBase.prototype._deleteCookie = function (name) {
        try {
            delete this.cookieJar._jar.store.idx['' + this.baseUrl.replace('https://', '')]['/']['' + name];
        }
        catch (err) {
            console.log(err);
        }
    };
    ;
    SupremeBase.prototype._getCookie = function (name) {
        try {
            return this.cookieJar._jar.store.idx['' + this.baseUrl.replace('https://', '')]['/'][name].value;
        }
        catch (err) {
            console.error(err);
        }
    };
    ;
    return SupremeBase;
}(Task));
module.exports = SupremeBase;
//# sourceMappingURL=SupremeBase.js.map