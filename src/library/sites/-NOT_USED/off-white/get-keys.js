const puppeteer = require('puppeteer');

exports.init = function() {
	return new Promise(async (resolve) => {
		this.browser = await puppeteer.launch({
			headless: true,
			executablePath: this.executablePath,
			args: [
				'--window-size=500,800',
				'--disable-infobars'
			]
		});
		this.page = (await this.browser.pages())[0];
		this.page.emulate({
			viewport: {
				width: 500,
				height: 800,
				isMobile: true,
				hasTouch: true,
				isLandscape: false
			},
			userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_1_2 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) CriOS/63.0.3239.73 Mobile/15B202 Safari/604.1'
		})
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

exports.generate = function() {
	return new Promise(async (resolve) => {
		await this.page.goto(`${this.taskData.searchInput}.json`, {waitUntil: 'networkidle0'});
		console.log(this.page.url())
	})
}