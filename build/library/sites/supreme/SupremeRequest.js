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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var SupremeBase = require('./SupremeBase');
var _a = require('../../other'), utilities = _a.utilities, logger = _a.logger;
var cheerio = require('cheerio');
var ipcWorker = require('electron').ipcRenderer;
var settings = require('electron-settings');
var SupremeRequest = (function (_super) {
    __extends(SupremeRequest, _super);
    function SupremeRequest(_taskData, _id) {
        var _this = _super.call(this, _taskData, _id) || this;
        _this.cardinal = {
            id: '',
            tid: '',
            transactionId: '',
            transactionToken: '',
            serverJWT: '',
            responsePayload: '',
            consumerData: {},
            authentication: {
                url: '',
                payload: ''
            }
        };
        _this.ticket = '';
        return _this;
    }
    SupremeRequest.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var privateFields, publicFields, field, field, field, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4, this._setTimer()];
                    case 1:
                        _a.sent();
                        this._setStatus('Starting Task.', 'WARNING');
                        logger.warn("[Task " + this.id + "] Starting.");
                        console.log(this.profile);
                        return [4, this._fetchStockData()];
                    case 2:
                        _a.sent();
                        if (this.shouldStop)
                            return [2, this._stop()];
                        return [4, this._fetchProductData()];
                    case 3:
                        _a.sent();
                        if (this.shouldStop)
                            return [2, this._stop()];
                        return [4, this._atcProcess()];
                    case 4:
                        _a.sent();
                        if (this.shouldStop)
                            return [2, this._stop()];
                        return [4, this._checkoutProcess()];
                    case 5:
                        _a.sent();
                        return [4, this._processStatus()];
                    case 6:
                        _a.sent();
                        if (this.successful) {
                            this._setStatus('Success.', 'SUCCESS');
                            privateFields = [];
                            publicFields = [];
                            if (this._productStyleName) {
                                field = {
                                    name: "Colour:",
                                    value: this._productStyleName,
                                    inline: true
                                };
                                privateFields.push(field);
                                publicFields.push(field);
                            }
                            if (this.checkoutData.hasOwnProperty("status")) {
                                field = {
                                    name: "Status:",
                                    value: this.checkoutData.status.capitalise(),
                                    inline: true
                                };
                                privateFields.push(field);
                            }
                            if (this.cardinal.id) {
                                field = {
                                    name: "Transaction ID:",
                                    value: '||' + this.cardinal.id + '||',
                                    inline: true
                                };
                                privateFields.push(field);
                            }
                            this._postPublicWebhook(publicFields);
                            this._postPrivateWebhook(privateFields);
                            this._addToAnalystics();
                        }
                        else {
                            console.log('failed');
                        }
                        this.isActive = false;
                        return [3, 8];
                    case 7:
                        error_1 = _a.sent();
                        switch (error_1.code) {
                            case 'NO TASK MODE':
                                this.isActive = false;
                                alert('INVALID TASK MODE');
                                return [2, this._stop()];
                            default:
                                console.log(error_1);
                        }
                        return [3, 8];
                    case 8: return [2];
                }
            });
        });
    };
    SupremeRequest.prototype._atcProcess = function () {
        return new Promise(function runStage(resolve, reject) {
            return __awaiter(this, void 0, void 0, function () {
                var cartDelay, response, body, pureCart, ticket, cookieValue, error_2, errorDelay;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            cartDelay = !this.restockMode ? this.taskData.delays.cart : 0;
                            this._setCookie('shoppingSessionId', (new Date().getTime()).toString());
                            if (!!this.restockMode) return [3, 2];
                            this._setStatus('Delaying ATC.', 'WARNING');
                            return [4, this._sleep(cartDelay)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if (this.shouldStop)
                                return [2, this._stop()];
                            this._setStatus('Adding to Cart.', 'WARNING');
                            logger.warn("[T:" + this.id + "] Adding " + this.productId + " to Cart.");
                            this._setCookie('lastVisitedFragment', "products/" + this.productId + "/" + this.styleId);
                            this._setCookie('_ticket', this._generateTicket(1) || '');
                            return [4, this._addToCart()];
                        case 3:
                            response = _a.sent();
                            console.log('atc response', response);
                            body = response.body;
                            logger.info("[T:" + this.id + "] Cart Response:\n" + JSON.stringify(body));
                            if ((body.hasOwnProperty('length') && !body.length > 0) ||
                                (body.hasOwnProperty('success') && !body.success) ||
                                (body.hasOwnProperty('length') && !body[0].in_stock)) {
                                throw new Error('OOS');
                            }
                            pureCart = this._getCookie('pure_cart') || null;
                            ticket = this._getCookie('ticket') || '';
                            if (ticket) {
                                logger.debug("Ticket: " + ticket);
                                this.ticket = ticket;
                            }
                            if (!pureCart) {
                                throw new Error('NO PURE CART');
                            }
                            cookieValue = JSON.parse(decodeURIComponent(pureCart));
                            delete cookieValue.cookie;
                            this.cookieSub = encodeURIComponent(JSON.stringify(cookieValue));
                            this._setStatus('Added to Cart!', 'SUCCESS');
                            resolve();
                            return [3, 5];
                        case 4:
                            error_2 = _a.sent();
                            switch (error_2.message) {
                                case 'OOS':
                                    this._setStatus('Out of Stock.', 'ERROR');
                                    logger.error('OOS');
                                    this.restockMode = true;
                                    break;
                                default:
                                    this._setStatus('ATC Error', 'ERROR');
                                    console.error(error_2);
                            }
                            errorDelay = settings.has('globalErrorDelay') ? settings.get('globalErrorDelay') : 1000;
                            return [2, setTimeout(runStage.bind(this, resolve, reject), errorDelay)];
                        case 5: return [2];
                    }
                });
            });
        }.bind(this));
    };
    SupremeRequest.prototype._checkoutProcess = function () {
        return new Promise(function runStage(resolve, reject) {
            return __awaiter(this, void 0, void 0, function () {
                var body, $, checkoutTemplate, $_1, serverJWT, orderTotal, _a, checkoutDelay, checkoutResponse, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 10, , 11]);
                            this._setCookie('lastVisitedFragment', 'checkout');
                            this._setStatus("Parsing Checkout Form.", 'WARNING');
                            return [4, this._fetchMobile()];
                        case 1:
                            body = (_b.sent()).body;
                            $ = cheerio.load(body);
                            checkoutTemplate = $("#checkoutViewTemplate").html();
                            this.formElements = this._parseCheckoutForm(checkoutTemplate);
                            if (this.shouldStop)
                                return [2, this._stop()];
                            if (!(this.region === 'EU' && !this.taskData.additional.enableThreeDS)) return [3, 4];
                            this._setStatus('Initialising 3DS.', 'WARNING');
                            logger.debug("[T:" + this.id + "] Fetching Mobile Totals.");
                            return [4, this._fetchMobileTotals()];
                        case 2:
                            body = (_b.sent()).body;
                            $_1 = cheerio.load(body);
                            serverJWT = $_1('#jwt_cardinal').val();
                            orderTotal = $_1('#total').text();
                            if (orderTotal) {
                                logger.info("Order Total:\n" + this.orderTotal);
                                this.orderTotal = orderTotal;
                            }
                            if (serverJWT) {
                                logger.info("Initial JWT:\n" + this.cardinal.serverJWT);
                                this.cardinal.serverJWT = serverJWT;
                            }
                            _a = this.cardinal;
                            return [4, this._setupThreeDS()];
                        case 3:
                            _a.id = _b.sent();
                            _b.label = 4;
                        case 4:
                            if (this.shouldStop)
                                return [2, this._stop()];
                            if (!this.hasCaptcha) return [3, 6];
                            return [4, this._requestCaptcha()];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            if (this.shouldStop)
                                return [2, this._stop()];
                            if (!!this.restockMode) return [3, 8];
                            this._setStatus('Delaying Checkout.', 'WARNING');
                            checkoutDelay = void 0;
                            if (!this.captchaTime) {
                                checkoutDelay = this.taskData.delays.checkout;
                            }
                            else {
                                checkoutDelay = this.taskData.delays.checkout - this.captchaTime;
                            }
                            if (checkoutDelay < 0) {
                                checkoutDelay = 0;
                            }
                            return [4, this._sleep(checkoutDelay)];
                        case 7:
                            _b.sent();
                            _b.label = 8;
                        case 8:
                            if (this.shouldStop)
                                return [2, this._stop()];
                            logger.warn('Submitting Checkout.');
                            this._setStatus('Submitting Checkout.', 'WARNING');
                            this.checkoutAttempts++;
                            this.checkoutTS = Date.now();
                            this.checkoutTime = this.checkoutTS - this.startTS;
                            this._setCookie('_ticket', this._generateTicket(2) || '');
                            return [4, this._submitCheckout()];
                        case 9:
                            checkoutResponse = _b.sent();
                            body = checkoutResponse.body;
                            this.checkoutData = body;
                            resolve();
                            return [3, 11];
                        case 10:
                            error_3 = _b.sent();
                            switch (error_3.message) {
                                default:
                                    this._setStatus('Error Checking Out', 'ERROR');
                                    console.log(error_3);
                            }
                            return [2, setTimeout(runStage.bind(this), 1000)];
                        case 11: return [2];
                    }
                });
            });
        }.bind(this));
    };
    SupremeRequest.prototype._addToCart = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                if (!this.atcForm) {
                    this.atcForm = this._form('cart-add');
                }
                options = {
                    url: this.baseUrl + "/shop/" + this.productId + "/add.json",
                    method: 'POST',
                    proxy: this.proxy,
                    form: this.atcForm,
                    timeout: 6000,
                    jar: this.cookieJar,
                    json: true,
                    headers: {
                        "accept": "application/json",
                        "accept-encoding": "gzip, deflate, br",
                        "content-type": "application/x-www-form-urlencoded",
                        "origin": this.baseUrl,
                        "referer": this.baseUrl + "/mobile/",
                        "user-agent": this.userAgent,
                        "x-requested-with": "XMLHttpRequest"
                    }
                };
                return [2, this.request(options)];
            });
        });
    };
    SupremeRequest.prototype._fetchMobile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                options = {
                    url: this.baseUrl + "/mobile",
                    method: 'GET',
                    proxy: this.proxy,
                    jar: this.cookieJar,
                    headers: {
                        "Upgrade-Insecure-Requests": "1",
                        "User-Agent": this.userAgent
                    }
                };
                return [2, this.request(options)];
            });
        });
    };
    SupremeRequest.prototype._fetchMobileTotals = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                options = {
                    url: this.baseUrl + "/checkout/totals_mobile.js",
                    method: 'GET',
                    proxy: this.proxy,
                    jar: this.cookieJar,
                    qs: this._form('mobile-totals')
                };
                return [2, this.request(options)];
            });
        });
    };
    SupremeRequest.prototype._submitCheckout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                options = {
                    url: this.baseUrl + '/checkout.json',
                    method: 'POST',
                    proxy: this.proxy,
                    json: true,
                    timeout: 7000,
                    form: this._form('parsed-checkout'),
                    jar: this.cookieJar,
                    headers: {
                        "Accept": "application/json",
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Origin': this.baseUrl,
                        'Referer': this.baseUrl + '/mobile',
                        'User-Agent': this.userAgent
                    }
                };
                return [2, this.request(options)];
            });
        });
    };
    SupremeRequest.prototype._setupThreeDS = function () {
        var _this = this;
        return new Promise(function (resolve) {
            logger.debug('Submitting Initial JWT.');
            ipcWorker.send('cardinal.setup', {
                jwt: _this.cardinal.serverJWT,
                profile: _this.profileName,
                taskId: _this.id
            });
            ipcWorker.once("cardinal.setupComplete(" + _this.id + ")", function (event, args) {
                resolve(args.cardinalId);
            });
        });
    };
    SupremeRequest.prototype._generateTicket = function (type) {
        var randomHex = __spreadArrays(Array(128)).map(function () { return Math.floor(Math.random() * 16).toString(16); }).join('');
        var timeStamp = Math.floor(Date.now() / 1000);
        switch (type) {
            case 1:
                return "" + randomHex + timeStamp;
            case 2:
                return "" + this.ticket + randomHex + timeStamp;
        }
    };
    return SupremeRequest;
}(SupremeBase));
module.exports = SupremeRequest;
//# sourceMappingURL=SupremeRequest.js.map