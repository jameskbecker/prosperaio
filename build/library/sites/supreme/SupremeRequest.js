"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SupremeBase_1 = __importDefault(require("./SupremeBase"));
const other_1 = require("../../other");
const cheerio_1 = __importDefault(require("cheerio"));
const electron_1 = require("electron");
const electron_settings_1 = __importDefault(require("electron-settings"));
class SupremeRequest extends SupremeBase_1.default {
    constructor(_taskData, _id) {
        super(_taskData, _id);
        this.ticket = '';
    }
    async run() {
        try {
            await this._setTimer();
            this.setStatus('Starting Task.', 'WARNING');
            other_1.logger.warn(`[Task ${this.id}] Starting.`);
            console.log(this.profile);
            await this._fetchStockData();
            if (this.shouldStop)
                return this._stop();
            await this._fetchProductData();
            if (this.shouldStop)
                return this._stop();
            await this._atcProcess();
            if (this.shouldStop)
                return this._stop();
            await this._checkoutProcess();
            await this._processStatus();
            if (this.successful) {
                this.setStatus('Success.', 'SUCCESS');
                let privateFields = [];
                let publicFields = [];
                if (this._productStyleName) {
                    let field = {
                        name: 'Colour:',
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
                if (this.cardinal.id) {
                    let field = {
                        name: 'Transaction ID:',
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
        }
        catch (error) {
            switch (error.code) {
                case 'NO TASK MODE':
                    this.isActive = false;
                    alert('INVALID TASK MODE');
                    return this._stop();
                default:
                    console.log(error);
            }
        }
    }
    _atcProcess() {
        return new Promise(async function runStage(resolve, reject) {
            try {
                let cartDelay = !this.restockMode ? this.taskData.delays.cart : 0;
                this._setCookie('shoppingSessionId', (new Date().getTime()).toString());
                if (!this.restockMode) {
                    this.setStatus('Delaying ATC.', 'WARNING');
                    await this._sleep(cartDelay);
                }
                if (this.shouldStop)
                    return this._stop();
                this.setStatus('Adding to Cart.', 'WARNING');
                other_1.logger.warn(`[T:${this.id}] Adding ${this.productId} to Cart.`);
                this._setCookie('lastVisitedFragment', `products/${this.productId}/${this.styleId}`);
                this._setCookie('_ticket', this._generateTicket(1) || '');
                let response = await this._addToCart();
                console.log('atc response', response);
                let body = response.body;
                other_1.logger.info(`[T:${this.id}] Cart Response:\n${JSON.stringify(body)}`);
                if ((body.hasOwnProperty('length') && body.length < 1) ||
                    (body.hasOwnProperty('success') && !body.success) ||
                    (body.hasOwnProperty('length') && !body[0].in_stock)) {
                    throw new Error('OOS');
                }
                let pureCart = this._getCookie('pure_cart') || null;
                let ticket = this._getCookie('ticket') || '';
                if (ticket) {
                    other_1.logger.debug(`Ticket: ${ticket}`);
                    this.ticket = ticket;
                }
                if (!pureCart) {
                    throw new Error('NO PURE CART');
                }
                let cookieValue = JSON.parse(decodeURIComponent(pureCart));
                delete cookieValue.cookie;
                this.cookieSub = encodeURIComponent(JSON.stringify(cookieValue));
                this.setStatus('Added to Cart!', 'SUCCESS');
                resolve();
            }
            catch (error) {
                switch (error.message) {
                    case 'OOS':
                        this.setStatus('Out of Stock.', 'ERROR');
                        other_1.logger.error('OOS');
                        this.restockMode = true;
                        break;
                    default:
                        this.setStatus('ATC Error', 'ERROR');
                        console.error(error);
                }
                let errorDelay = electron_settings_1.default.has('globalErrorDelay') ? parseInt(electron_settings_1.default.get('globalErrorDelay')) : 1000;
                return setTimeout(runStage.bind(this, resolve, reject), errorDelay);
            }
        }.bind(this));
    }
    _checkoutProcess() {
        return new Promise(async function runStage(resolve) {
            try {
                this._setCookie('lastVisitedFragment', 'checkout');
                this.setStatus('Parsing Checkout Form.', 'WARNING');
                let body = (await this._fetchMobile()).body;
                let $ = cheerio_1.default.load(body);
                let checkoutTemplate = $('#checkoutViewTemplate').html();
                this.formElements = this._parseCheckoutForm(checkoutTemplate);
                if (this.shouldStop)
                    return this._stop();
                if (this.region === 'EU' && !this.taskData.additional.enableThreeDS) {
                    this.setStatus('Initialising 3DS.', 'WARNING');
                    other_1.logger.debug(`[T:${this.id}] Fetching Mobile Totals.`);
                    body = (await this._fetchMobileTotals()).body;
                    let $ = cheerio_1.default.load(body);
                    let serverJWT = $('#jwt_cardinal').val();
                    let orderTotal = $('#total').text();
                    if (orderTotal) {
                        other_1.logger.info(`Order Total:\n${this.orderTotal}`);
                        this.orderTotal = orderTotal;
                    }
                    if (serverJWT) {
                        other_1.logger.info(`Initial JWT:\n${this.cardinal.serverJWT}`);
                        this.cardinal.serverJWT = serverJWT;
                    }
                    this.cardinal.id = await this._setupThreeDS();
                }
                if (this.shouldStop)
                    return this._stop();
                if (this.hasCaptcha) {
                    await this._requestCaptcha();
                }
                if (this.shouldStop)
                    return this._stop();
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
                if (this.shouldStop)
                    return this._stop();
                other_1.logger.warn('Submitting Checkout.');
                this.setStatus('Submitting Checkout.', 'WARNING');
                this.checkoutAttempts++;
                this.checkoutTS = Date.now();
                this.checkoutTime = this.checkoutTS - this.startTS;
                this._setCookie('_ticket', this._generateTicket(2) || '');
                let checkoutResponse = await this._submitCheckout();
                body = checkoutResponse.body;
                this.checkoutData = body;
                resolve();
            }
            catch (error) {
                switch (error.message) {
                    default:
                        this.setStatus('Error Checking Out', 'ERROR');
                        console.log(error);
                }
                return setTimeout(runStage.bind(this), 1000);
            }
        }.bind(this));
    }
    async _addToCart() {
        if (!this.atcForm) {
            this.atcForm = this._form('cart-add');
        }
        let options = {
            url: `${this.baseUrl}/shop/${this.productId}/add.json`,
            method: 'POST',
            proxy: this.proxy,
            form: this.atcForm,
            timeout: 6000,
            jar: this.cookieJar,
            json: true,
            headers: {
                'accept': 'application/json',
                'accept-encoding': 'gzip, deflate, br',
                'content-type': 'application/x-www-form-urlencoded',
                'origin': this.baseUrl,
                'referer': `${this.baseUrl}/mobile/`,
                'user-agent': this.userAgent,
                'x-requested-with': 'XMLHttpRequest'
            }
        };
        return this.request(options);
    }
    async _fetchMobile() {
        let options = {
            url: `${this.baseUrl}/mobile`,
            method: 'GET',
            proxy: this.proxy,
            jar: this.cookieJar,
            headers: {
                'Upgrade-Insecure-Requests': '1',
                'User-Agent': this.userAgent
            }
        };
        return this.request(options);
    }
    async _fetchMobileTotals() {
        let options = {
            url: `${this.baseUrl}/checkout/totals_mobile.js`,
            method: 'GET',
            proxy: this.proxy,
            jar: this.cookieJar,
            qs: this._form('mobile-totals')
        };
        return this.request(options);
    }
    async _submitCheckout(endpoint) {
        let options = {
            url: this.baseUrl + '/checkout.json',
            method: 'POST',
            proxy: this.proxy,
            json: true,
            timeout: 7000,
            form: this._form('parsed-checkout'),
            jar: this.cookieJar,
            headers: {
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip, deflate, br',
                'Origin': this.baseUrl,
                'Referer': this.baseUrl + '/mobile',
                'User-Agent': this.userAgent
            }
        };
        return this.request(options);
    }
    _setupThreeDS() {
        return new Promise(resolve => {
            other_1.logger.debug('Submitting Initial JWT.');
            electron_1.ipcRenderer.send('cardinal.setup', {
                jwt: this.cardinal.serverJWT,
                profile: this.profileName,
                taskId: this.id
            });
            electron_1.ipcRenderer.once(`cardinal.setupComplete(${this.id})`, (event, args) => {
                resolve(args.cardinalId);
            });
        });
    }
    _generateTicket(type) {
        let randomHex = [...Array(128)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        let timeStamp = Math.floor(Date.now() / 1000);
        switch (type) {
            case 1:
                return `${randomHex}${timeStamp}`;
            case 2:
                return `${this.ticket}${randomHex}${timeStamp}`;
        }
    }
}
exports.default = SupremeRequest;
//# sourceMappingURL=SupremeRequest.js.map