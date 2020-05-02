const Task = require('../../../tasks/base');
const { utilities } = require('../../other');
//const { ShopifyMonitor } = require('../../monitors');
const request = require('request')
const logic = require('./logic');
const apiKeys = require('../../configuration/api-keys');

class ShopifyApi extends Task {
	constructor(_taskData) {
		super(_taskData);
		this.apiToken = null;
		this.checkoutToken = null;
		this.hasBypassedQueue = false;
		this.hasCartProperties;
		this.isQueued = false;
		this.Monitor = null;
		this.productData = {};
		this.queueToken;

		this.sessionId = null;
		this.shippingId = null;
		this.request = request.defaults({
			gzip: true,
			timeout: 20000,
		});
		this.cookieJar = request.jar();
		this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36s'
	}

	async run() {
		try {
			await this.init();
			if (!this.Monitor) this.Monitor = new ShopifyMonitor({
				baseUrl: this.taskData.site.baseUrl,
				site: this.taskData.site.id,
				searchInput: this.taskData.products[0].searchInput,
				size: this.taskData.products[0].size
			});

			//palace
			this.shippingId = 'shopify-5-7%20Working%20Day%20Delivery-10.00';
			//dsm
			/*this.shippingId = 'shopify-Express%201-2%20working%20days%20from%20dispatch-15.00';*/

			if (apiKeys.hasOwnProperty(this.taskData.site.id)) {
				this.apiToken = apiKeys[this.taskData.site.id];
				console.log(this.apiToken);
			}

			
			if (!this.apiToken) await logic.fetchApiToken.bind(this)();
			await logic.preloadCheckout.bind(this)();
			// await logic.preloadSession.bind(this)();
			// await utilities.setTimer.bind(this)();
			this.setStatus('Starting Task.', 'INFO');
			// this.startTS = Date.now();
			// await logic.findProduct.bind(this)();
			// await logic.fetchProductData.bind(this)();
			// await logic.cartItem.bind(this)();
			// await logic.checkout.bind(this)();
			// console.log(this.cookieJar)
			// await logic.sendDiscordCheckout.bind(this)()
		}
		catch (err) {
			console.log(err)
		}
	}
}

module.exports = ShopifyApi