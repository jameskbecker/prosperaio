"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SupremeBase_1 = __importDefault(require("./SupremeBase"));
const electron_settings_1 = __importDefault(require("electron-settings"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const cheerio_1 = __importDefault(require("cheerio"));
const other_1 = require("../../other");
const querystring_1 = __importDefault(require("querystring"));
class SupremeSafe extends SupremeBase_1.default {
    constructor(_taskData, _id) {
        super(_taskData, _id);
        this.config = {
            launch: {
                headless: false,
                executablePath: electron_settings_1.default.has('browser-path') ? electron_settings_1.default.get('browser-path') : null,
                args: [
                    '--no-sandbox',
                    '--disable-gpu',
                    `--window-size=500,800`
                ]
            },
            emulate: {
                userAgent: this.userAgent,
                viewport: {
                    width: 500, height: 800,
                    isMobile: true,
                    hasTouch: true
                }
            },
            auth: null
        };
    }
    async run() {
        try {
            this.setStatus('Initialising.', 'INFO');
            await this._setup();
            await this._setTimer();
            this.setStatus('Starting Task.', 'WARNING');
            await this._fetchStockData();
            await this._fetchProductData();
            await this._atcProcess();
            await this._checkoutProcess();
            await this._processStatus();
            if (this.successful) {
                this.setStatus('Success.', 'SUCCESS');
                let privateFields = [];
                let publicFields = [];
                if (this._productStyleName) {
                    let field = {
                        name: 'Style:',
                        value: this._productStyleName,
                        inline: true
                    };
                    privateFields.push(field);
                    publicFields.push(field);
                }
                if (this.checkoutData.hasOwnProperty('status')) {
                    let field = {
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
                this.setStatus('Checkout Failed.', 'ERROR');
            }
            this.isActive = false;
        }
        catch (error) {
            console.log(error);
        }
    }
    async _setup() {
        if (this.proxy) {
            let splitProxy = this.proxy.replace('http://', '').split('@');
            console.log(splitProxy);
            let host = splitProxy[1].split(':')[0];
            let port = splitProxy[1].split(':')[1];
            this.config.launch.args.push(`--proxy-server=http://${host}:${port}`);
            if (splitProxy.length === 2) {
                let username = splitProxy[0].split(':')[0];
                let password = splitProxy[0].split(':')[1];
                console.log({ username, password });
                this.config.auth = { username, password };
            }
        }
        this.browser = await puppeteer_core_1.default.launch(this.config.launch);
        this.page = await this.browser.newPage();
        await this.page.emulate(this.config.emulate);
        await this.page.authenticate(this.config.auth);
        await this.page.goto(this.baseUrl);
    }
    _atcProcess() {
        return new Promise(async function runProcess(resolve) {
            try {
                if (this.shouldStop)
                    throw new Error('STOP');
                this.startTime = (new Date).getTime();
                await this.page.setCookie({
                    name: 'shoppingSessionId',
                    value: this.startTime.toString()
                });
                if (this.shouldStop)
                    throw new Error('STOP');
                await this.page.setCookie({
                    name: 'lastVisitedFragment',
                    value: `products/${this.productId}/${this.styleId}`
                });
                if (this._taskData.delays.cart) {
                    this.setStatus('Delaying Cart', 'WARNING');
                    await this._sleep(this._taskData.delays.cart);
                }
                if (this.shouldStop)
                    throw new Error('STOP');
                this.setStatus('Adding to Cart', 'WARNING');
                this.cartForm = this._form('cart-add');
                let options = {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'accept': 'application/json',
                        'accept-encoding': 'gzip, deflate, br',
                        'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
                        'content-type': 'application/x-www-form-urlencoded',
                        'x-requested-with': 'XMLHttpRequest'
                    },
                    body: querystring_1.default.stringify(this.cartForm)
                };
                let body = await this._request(`${this._productUrl}/add.json`, options, 'json');
                if ((body.hasOwnProperty('length') && body.length < 1) ||
                    (body.hasOwnProperty('success') && !body.success) ||
                    (body.hasOwnProperty('length') && !body[0].in_stock)) {
                    throw new Error('OOS');
                }
                let cookies = await this.page.cookies();
                let pureCart = cookies.filter((cookie) => cookie.name === 'pure_cart');
                if (pureCart.length > 0) {
                    let cookieValue = JSON.parse(decodeURIComponent(pureCart[0].value));
                    delete cookieValue.cookie;
                    this.cookieSub = encodeURIComponent(JSON.stringify(cookieValue));
                    this.setStatus('Added to Cart!', 'SUCCESS');
                    console.log('cookie_sub:', this.cookieSub);
                    let mobileTotalsOptions = {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                            'accept-encoding': 'gzip, deflate, br',
                            'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
                            'content-type': 'application/x-www-form-urlencoded',
                            'x-requested-with': 'XMLHttpRequest'
                        },
                    };
                    let mobileTotalsResponse = await this._request(`${this.baseUrl}/checkout/totals_mobile.js?${querystring_1.default.stringify(this._form('mobile-totals'))}`, mobileTotalsOptions, 'text');
                    let $ = cheerio_1.default.load(mobileTotalsResponse);
                    let orderTotal = $('#total').text();
                    if (orderTotal) {
                        this.orderTotal = orderTotal;
                        other_1.logger.info(`Order Total:\n${this.orderTotal}`);
                    }
                    if (this.region !== 'EU' && this.taskData.additional.enableThreeDS) {
                        resolve();
                        return;
                    }
                    let serverJWT = $('#jwt_cardinal').val();
                    if (serverJWT) {
                        this.cardinal.serverJWT = serverJWT;
                        other_1.logger.info(`Initial JWT:\n${this.cardinal.serverJWT}`);
                        this.cardinal.id = await this._setupThreeDS();
                        other_1.logger.info(`Cardinal ID:\n${this.cardinal.id}`);
                    }
                    resolve();
                }
            }
            catch (error) {
                switch (error.message) {
                    case 'STOP':
                        this._stop();
                        return;
                    case 'OOS':
                        this.setStatus('Out of Stock', 'ERROR');
                        break;
                    default:
                        this.setStatus('ATC Error', 'ERROR');
                        console.log(error);
                }
                let errorDelay = electron_settings_1.default.has('globalErrorDelay') ? parseInt(electron_settings_1.default.get('globalErrorDelay')) : 1000;
                setTimeout(runProcess.bind(this, resolve), errorDelay);
                return;
            }
        }.bind(this));
    }
    _checkoutProcess() {
        return new Promise(async function runProcess(resolve) {
            try {
                await this.page.setCookie({
                    name: 'lastVisitedFragment',
                    value: 'checkout'
                });
                if (this.shouldStop)
                    throw new Error('STOP');
                this.setStatus('Parsing Checkout Form', 'WARNING');
                let checkoutTemplate = await this.page.$eval('#checkoutViewTemplate', (e) => e.innerHTML);
                this.formElements = this._parseCheckoutForm(checkoutTemplate);
                if (this.shouldStop)
                    throw new Error('STOP');
                if (this.hasCaptcha) {
                    this.setStatus('Waiting for Captcha', 'WARNING');
                    await this._requestCaptcha();
                }
                if (this.shouldStop)
                    throw new Error('STOP');
                this.setStatus('Submitting Checkout', 'WARNING');
                if (!this.restockMode) {
                    this.setStatus('Delaying Checkout.', 'WARNING');
                    let checkoutDelay;
                    if (!this.captchaTime) {
                        checkoutDelay = this.taskData.delays.checkout;
                    }
                    else {
                        console.log(this.captchaTime);
                        checkoutDelay = this.taskData.delays.checkout - this.captchaTime;
                    }
                    if (checkoutDelay < 0) {
                        checkoutDelay = 0;
                    }
                    await this._sleep(checkoutDelay);
                }
                console.log(this.checkoutForm);
                let r = await this._submitCheckout('checkout.json');
                this.checkoutData = r.body;
                resolve();
            }
            catch (error) {
                switch (error.message) {
                    case 'STOP':
                        this._stop();
                        return;
                }
                this.setStatus('Checkout Error', 'ERROR');
                console.log(error);
                let errorDelay = electron_settings_1.default.has('globalErrorDelay') ? parseInt(electron_settings_1.default.get('globalErrorDelay')) : 1000;
                setTimeout(runProcess.bind(this, resolve), errorDelay);
                return;
            }
        }.bind(this));
    }
    async _submitCheckout(endpoint) {
        this.checkoutForm = this._form('parsed-checkout');
        let options = {
            method: 'POST',
            credentials: 'include',
            body: querystring_1.default.stringify(this.checkoutForm),
            headers: {
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7',
                'content-type': 'application/x-www-form-urlencoded',
                'x-requested-with': 'XMLHttpRequest'
            }
        };
        return { body: (await this._request(this.baseUrl + '/' + endpoint, options, 'json')) };
    }
    _buildJSAddress() {
        let rememberedFields = [];
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
    }
    async _request(url, options, type) {
        try {
            return await this.page.evaluate(async (url, options, type) => {
                try {
                    console.log(`await window.fetch(${url}, ${JSON.stringify(options)}`);
                    switch (type) {
                        case 'text':
                            return (await window.fetch(url, options)).text();
                        case 'json':
                            return (await window.fetch(url, options)).json();
                    }
                }
                catch (error) {
                    return Promise.reject(error);
                }
            }, url, options, type);
        }
        catch (error) {
            console.log(error);
            setTimeout(this._request.bind(this, url, options), 1000);
        }
    }
}
exports.default = SupremeSafe;
//# sourceMappingURL=SupremeSafe.js.map