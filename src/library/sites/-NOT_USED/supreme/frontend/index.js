const puppeteer = require('puppeteer');

const os = require('os');
// const app = require('electron').remote.app;
const path = require('path')
exports.init = function() {
	const billingInfo = this.profile.billing;
	let userAgents = {
		desktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
		mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) CriOS/63.0.3239.73 Mobile/15B202 Safari/604.1'
	}
	return new Promise(async (resolve) => {
		let windowSize = this.taskMode === 'browser-mobile' ? '500,800' : '900,750';
		this.browser = await puppeteer.launch({
			headless: this.taskData.additional.headlessMode,
			executablePath: this.executablePath,

			args: [
				`--window-size=${windowSize}`,
				'--disable-infobars'
				// '--no-sandbox', 
				// '--disable-setuid-sandbox'
			]
		});
		this.page = (await this.browser.pages())[0];
		this.page.emulate({
			viewport: {
				width: parseInt(windowSize.split(',')[0]),
				height: parseInt(windowSize.split(',')[1]),
				isMobile: this.taskData.mode === 'browser-mobile',
				hasTouch: this.taskData.mode === 'browser-mobile',
				isLandscape: false
			},
			userAgent: this.taskData.mode === 'browser-mobile' ? userAgents.mobile : userAgents.desktop
		})
		//await this.page.goto(`https://www.${this.baseUrl}/mobile`);
		let addressCookieName = this.taskData.mode === 'browser-mobile' ? 'js-address' : 'address'
		let addressValueDesktop = encodeURIComponent([`${billingInfo.first} ${billingInfo.last}`, `${billingInfo.address1}`, `${billingInfo.address2}`, `${billingInfo.address3}`, billingInfo.city, '', billingInfo.zip, 'DE', billingInfo.email, billingInfo.telephone].join('|'));
		if (this.taskData.mode === 'browser-mobile') {
			await this.page.setCookie({
				"domain": "www.supremenewyork.com",
				"httpOnly": false,
				"name": 'address-js',
				"path": "/",
				"secure": false,
				"value": `${encodeURIComponent(billingInfo.first)} ${encodeURIComponent(billingInfo.last)}|${encodeURIComponent(billingInfo.email)}|${encodeURIComponent(billingInfo.telephone)}|${encodeURIComponent(billingInfo.address1)}|${encodeURIComponent(billingInfo.address2)}|${encodeURIComponent(billingInfo.city)}||${encodeURIComponent(billingInfo.zip)}|DE|${encodeURIComponent(billingInfo.address3)}`,
			})
		}
		else {
			await this.page.setCookie({
				"domain": "www.supremenewyork.com",
				"httpOnly": false,
				"name": 'address',
				"path": "/",
				"secure": false,
				"value": addressValueDesktop,
			})
		}


		this.page.on('close', () => {
			if (this.shouldStop === false) {
				this.setStatus('ERROR: BROWSER CLOSED.', 'ERROR');
			}
		});
		this.browser.on('disconnected', () => {
			if (this.shouldStop === false) {
				this.setStatus('ERROR: BROWSER DISCONNECTED.', 'ERROR');
			}
		})

		resolve();
	})
}
exports.cart = require('./cart')
exports.checkout = require('./checkout');
exports.session = require('./session');