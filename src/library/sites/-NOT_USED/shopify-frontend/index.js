const Task = require('../../../tasks/base')
//const { ShopifyMonitor } = require('../../monitors');
const logic = require('./logic');
const request = require('request');
class ShopifyFrontend extends Task {
	constructor(_taskData) {
		super(_taskData);
		this.checkoutKey = '';
		this.checkoutTS = 0;
		this.cookies = request.jar();
		this.note = null;
		this.properties = {};
		this.primaryUrl = 'https://kith.com/collections/mens-footwear/products/nike-air-max-90-viotech-og';
		this.primaryVariant;
		this.request = request.defaults({
			gzip: true,
			timeout: _taskData.delays.timeout || 10000
		});
		this.shippingRateId = null;
		this.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36';
	}

	async run() {
		await this.init();
		// if (!this.Monitor) this.Monitor = new ShopifyMonitor({
		// 	baseUrl: this.taskData.site.baseUrl,
		// 	site: this.taskData.site.id,
		// 	searchInput: this.taskData.products[0].searchInput,
		// 	size: this.taskData.products[0].size
		// });

		this.shippingRateId = 'shopify-DHL%20Express%20International%20(excluding%20duty,%20tax%20and%20customs%20fees)-30.00';
		this.setStatus('Starting Task.', 'INFO');
		this.startTS = Date.now();
		await logic.findProduct.bind(this)();
		await logic.fetchProductData.bind(this)();
		await logic.cartItem.bind(this)();
		await logic.checkout.bind(this)();
		await logic.sendDiscordCheckout.bind(this)();
	}
}

module.exports = ShopifyFrontend