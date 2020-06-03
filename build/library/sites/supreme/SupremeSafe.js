"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var SupremeBase_1 = __importDefault(require("./SupremeBase"));
var settings = __importStar(require("electron-settings"));
var puppeteer = __importStar(require("puppeteer"));
var querystring = __importStar(require("querystring"));
var SupremeSafe = (function (_super) {
    __extends(SupremeSafe, _super);
    function SupremeSafe(_taskData, _id) {
        var _this = _super.call(this, _taskData, _id) || this;
        _this.config = {
            launch: {
                headless: true,
                executablePath: settings.has('browser-path') ? settings.get('browser-path') : null,
                args: [
                    '--no-sandbox',
                    '--disable-gpu',
                    "--window-size=500,800"
                ]
            },
            emulate: {
                userAgent: _this.userAgent,
                viewport: {
                    width: 500, height: 800,
                    isMobile: true,
                    hasTouch: true
                }
            },
            auth: null
        };
        _this.browser;
        _this.page;
        return _this;
    }
    SupremeSafe.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var privateFields, publicFields, field, field, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        this.setStatus('Initialising.', 'INFO');
                        return [4, this._setup()];
                    case 1:
                        _a.sent();
                        return [4, this._setTimer()];
                    case 2:
                        _a.sent();
                        this.setStatus('Starting Task.', 'WARNING');
                        return [4, this._fetchStockData()];
                    case 3:
                        _a.sent();
                        return [4, this._fetchProductData()];
                    case 4:
                        _a.sent();
                        return [4, this._atcProcess()];
                    case 5:
                        _a.sent();
                        return [4, this._checkoutProcess()];
                    case 6:
                        _a.sent();
                        return [4, this._processStatus()];
                    case 7:
                        _a.sent();
                        if (this.successful) {
                            this.setStatus('Success.', 'SUCCESS');
                            privateFields = [];
                            publicFields = [];
                            if (this._productStyleName) {
                                field = {
                                    name: 'Style:',
                                    value: this._productStyleName,
                                    inline: true
                                };
                                privateFields.push(field);
                                publicFields.push(field);
                            }
                            if (this.checkoutData.hasOwnProperty('status')) {
                                field = {
                                    name: 'Status:',
                                    value: this.checkoutData.status.capitalise(),
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
                        return [3, 9];
                    case 8:
                        error_1 = _a.sent();
                        console.log(error_1);
                        return [3, 9];
                    case 9: return [2];
                }
            });
        });
    };
    SupremeSafe.prototype._setup = function () {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var splitProxy, host, port, username, password, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.proxy) {
                            splitProxy = this.proxy.replace('http://', '').split('@');
                            host = splitProxy[1].split(':')[0];
                            port = splitProxy[1].split(':')[1];
                            this.config.launch.args.push("--proxy-server=http://" + host + ":" + port);
                            if (splitProxy.length === 2) {
                                username = splitProxy[0].split(':')[0];
                                password = splitProxy[0].split(':')[1];
                                this.config.auth = { username: username, password: password };
                            }
                        }
                        try {
                        }
                        catch (e) { }
                        _a = this;
                        return [4, puppeteer.launch(this.config.launch)];
                    case 1:
                        _a.browser = _c.sent();
                        _b = this;
                        return [4, this.browser.newPage()];
                    case 2:
                        _b.page = _c.sent();
                        return [4, this.page.emulate(this.config.emulate)];
                    case 3:
                        _c.sent();
                        return [4, this.page.authenticate(this.config.auth)];
                    case 4:
                        _c.sent();
                        return [4, this.page.goto(this.baseUrl)];
                    case 5:
                        _c.sent();
                        resolve();
                        return [2];
                }
            });
        }); });
    };
    SupremeSafe.prototype._atcProcess = function () {
        return new Promise(function runProcess(resolve) {
            return __awaiter(this, void 0, void 0, function () {
                var body, cookies, pureCart, cookieValue, error_2, errorDelay;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            this.startTime = (new Date).getTime();
                            if (this.shouldStop)
                                return [2, this.stop()];
                            return [4, this.page.setCookie({
                                    name: 'shoppingSessionId',
                                    value: this.startTime.toString()
                                })];
                        case 1:
                            _a.sent();
                            if (this.shouldStop)
                                return [2, this.stop()];
                            return [4, this.page.setCookie({
                                    name: 'lastVisitedFragment',
                                    value: "products/" + this.productId + "/" + this.styleId
                                })];
                        case 2:
                            _a.sent();
                            this.setStatus('Adding to Cart', 'WARNING');
                            this.cartForm = {
                                size: this.sizeId,
                                style: this.styleId,
                                qty: 1
                            };
                            if (this.shouldStop)
                                return [2, this.stop()];
                            return [4, this._request(this._productUrl + "/add.json", {
                                    method: 'POST',
                                    credentials: 'include',
                                    headers: {
                                        'accept': 'application/json',
                                        'accept-encoding': 'gzip, deflate, br',
                                        'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
                                        'content-type': 'application/x-www-form-urlencoded',
                                        'x-requested-with': 'XMLHttpRequest'
                                    },
                                    body: querystring.stringify(this.cartForm)
                                })];
                        case 3:
                            body = _a.sent();
                            if ((body.hasOwnProperty('length') && body.length < 1) ||
                                (body.hasOwnProperty('success') && !body.success) ||
                                (body.hasOwnProperty('length') && !body[0].in_stock)) {
                                throw new Error('OOS');
                            }
                            return [4, this.page.cookies()];
                        case 4:
                            cookies = _a.sent();
                            pureCart = cookies.filter(function (cookie) { return cookie.name === 'pure_cart'; });
                            if (pureCart.length > 0) {
                                cookieValue = JSON.parse(decodeURIComponent(pureCart[0].value));
                                delete cookieValue.cookie;
                                this.cookieSub = encodeURIComponent(JSON.stringify(cookieValue));
                                this.setStatus('Added to Cart!', 'SUCCESS');
                                console.log('cookie_sub:', this.cookieSub);
                                resolve();
                            }
                            return [3, 6];
                        case 5:
                            error_2 = _a.sent();
                            this.setStatus('ATC Error', 'ERROR');
                            console.log(error_2);
                            errorDelay = settings.has('globalErrorDelay') ? parseInt(settings.get('globalErrorDelay')) : 1000;
                            return [2, setTimeout(runProcess.bind(this, resolve), errorDelay)];
                        case 6: return [2];
                    }
                });
            });
        }.bind(this));
    };
    SupremeSafe.prototype._checkoutProcess = function () {
        return new Promise(function runProcess(resolve) {
            return __awaiter(this, void 0, void 0, function () {
                var checkoutTemplate, options, _a, error_3, errorDelay;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 6, , 7]);
                            return [4, this.page.setCookie({
                                    name: 'lastVisitedFragment',
                                    value: "checkout"
                                })];
                        case 1:
                            _b.sent();
                            if (this.shouldStop)
                                return [2, this.stop()];
                            this.setStatus('Parsing Checkout Form', 'WARNING');
                            return [4, this.page.$eval('#checkoutViewTemplate', function (e) { return e.innerHTML; })];
                        case 2:
                            checkoutTemplate = _b.sent();
                            this.formElements = this._parseCheckoutForm(checkoutTemplate);
                            if (this.shouldStop)
                                return [2, this.stop()];
                            if (!this.hasCaptcha) return [3, 4];
                            this.setStatus('Waiting for Captcha', 'WARNING');
                            return [4, this._requestCaptcha()];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            if (this.shouldStop)
                                return [2, this.stop()];
                            this.setStatus('Submitting Checkout', 'WARNING');
                            this.checkoutForm = this._form('parsed-checkout');
                            options = {
                                method: 'POST',
                                credentials: 'include',
                                body: querystring.stringify(this.checkoutForm),
                                headers: {
                                    'accept': 'application/json',
                                    'accept-encoding': 'gzip, deflate, br',
                                    'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
                                    'content-type': 'application/x-www-form-urlencoded',
                                    'x-requested-with': 'XMLHttpRequest'
                                }
                            };
                            _a = this;
                            return [4, this._request(this.baseUrl + "/checkout.json", options)];
                        case 5:
                            _a.checkoutData = _b.sent();
                            resolve();
                            return [3, 7];
                        case 6:
                            error_3 = _b.sent();
                            this.setStatus('Checkout Error', 'ERROR');
                            console.log(error_3);
                            errorDelay = settings.has('globalErrorDelay') ? parseInt(settings.get('globalErrorDelay')) : 1000;
                            return [2, setTimeout(runProcess.bind(this, resolve), errorDelay)];
                        case 7: return [2];
                    }
                });
            });
        }.bind(this));
    };
    SupremeSafe.prototype._buildJSAddress = function () {
        var rememberedFields = [];
        switch (this.region) {
            case 'JP':
                rememberedFields = [
                    '#order_billing_name',
                    '#order_billing_last_name',
                    '#order_email',
                    '#order_tel',
                    '#order_billing_address',
                    '#order_billing_city',
                    '#order_billing_state',
                    '#order_billing_zip'
                ];
            case 'EU':
                rememberedFields = [
                    this.profile.billing.first + ' ' + this.profile.billing.last,
                    this.profile.billing.email,
                    this.profile.billing.telephone,
                    this.profile.billing.address1,
                    this.profile.billing.address2,
                    this.profile.billing.city,
                    null,
                    this.profile.billing.zip,
                    this.profile.billing.country,
                    ''
                ];
                break;
            case 'US':
                rememberedFields = [
                    this.profile.billing.first + ' ' + this.profile.billing.last,
                    this.profile.billing.email,
                    this.profile.billing.telephone,
                    this.profile.billing.address1,
                    this.profile.billing.city,
                    this.profile.billing.state,
                    this.profile.billing.zip
                ];
        }
        return encodeURIComponent(rememberedFields.join('|'));
    };
    SupremeSafe.prototype._request = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4, this.page.evaluate(function (url, options) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, window.fetch(url, options)];
                                        case 1: return [2, ((_a.sent()).json())];
                                    }
                                });
                            }); }, url, options)];
                    case 1: return [2, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        return [2, setTimeout(this._request.bind(this, url, options), 1000)];
                    case 3: return [2];
                }
            });
        });
    };
    return SupremeSafe;
}(SupremeBase_1.default));
exports.default = SupremeSafe;
//# sourceMappingURL=SupremeSafe.js.map