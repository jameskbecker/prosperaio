const builder = require('./builder');
const { logger } = require('../../other');

function add() {
	let options = {
		uri: this.baseUrl + '/shop/' + this.productId + '/add.json',
		method: 'POST',
		proxy: null,
		json: true,
		form: builder.bind(this)('cart-add')
	}
	return this.request(options);
}

function remove() {
	let options = {
		url: `${this.baseUrl}/shop/${this.productId}/remove.json`,
		method: 'POST',
		proxy: null,
		json: true,
		form: builder.bind(this)('cart-remove')
	}
	return this.request(options)
} 

function check() {
	let options = {
		url: this.baseUrl + '/shop/cart.json',
		method: 'GET',
		proxy: null,
		json: true,
		form: builder.bind(this)('cart')
	}
	return this.request(options);
}

module.exports = { add }