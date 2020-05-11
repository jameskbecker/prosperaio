const builder = require('./builder');
const { utilities } = require('../../other');
const settings = require('electron-settings');

function add() {
	let options = {
		url: this.baseUrl + '/shop/' + this.productId + '/add.json',
		method: 'POST',
		proxy: utilities.formatProxy(this._getProxy()),
		json: true,
		timeout: settings.has('globalTimeoutDelay') ? parseInt(settings.get('globalTimeoutDelay')) : 5000,
		form: this.atcForm ? this.atcForm : builder.bind(this)('cart-add'),
		headers: {
			'accept-encoding': 'gzip, deflate, br',
			'origin': this.baseUrl,
			'referer': this.baseUrl + '/mobile',
			'user-agent': this.userAgent
		}
	}
	console.log({proxy: options.proxy})
	return this.request(options);
}

function remove() {
	let options = {
		url: `${this.baseUrl}/shop/${this.productId}/remove.json`,
		method: 'POST',
		proxy: utilities.formatProxy(this._getProxy()),
		json: true,
		form: builder.bind(this)('cart-remove'),
		headers: {
			'accept-encoding': 'gzip, deflate, br',
			'origin': this.baseUrl,
			'referer': this.baseUrl + '/mobile',
			'user-agent': this.userAgent
		}
	}
	return this.request(options)
} 

function check() {
	let options = {
		url: this.baseUrl + '/shop/cart.json',
		method: 'GET',
		proxy: utilities.formatProxy(this._getProxy()),
		json: true,
		form: builder.bind(this)('cart'),
		headers: {
			'accept-encoding': 'gzip, deflate, br',
			'origin': this.baseUrl,
			'referer': this.baseUrl + '/mobile',
			'user-agent': this.userAgent
		}
	}
	return this.request(options);
}

module.exports = { add }