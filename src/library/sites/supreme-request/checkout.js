const builder = require('./builder');
const {utilities } = require('../../other')
function fetchMobileTotals() {
	let options = {
		url: `${this.baseUrl}/checkout/totals_mobile.js`,
		method: 'GET',
		proxy: utilities.formatProxy(this._getProxy()),
		qs: builder.bind(this)('mobile-totals')
	}
	return this.request(options);
}

function fetchForm() {
	let options = {
		url: `${this.baseUrl}/mobile`,
		proxy: utilities.formatProxy(this._getProxy()),
		method: 'GET'
	}
	
	return this.request(options);
}

function submit(endpoint) {
	let path = endpoint !== 'cardinal' ? '/checkout.json' : '/checkout/' + this.slug + '/cardinal.json';
	let options = {
		url: this.baseUrl + path,
		method: 'POST',
		proxy: utilities.formatProxy(this._getProxy()),
		json: true,
		form: builder.bind(this)('parsed-checkout'),
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
 
function pollStatus() {
	let options = {
		url: this.baseUrl + '/checkout/' + this.slug + '/status.json',
		method: 'GET',
		proxy: utilities.formatProxy(this._getProxy()),
		json: true,
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
// let options = {
// 	baseUrl: 'http://127.0.0.1:5500',
// 	request: require('request-promise-native'),
// 	cookieJar: require('request-promise-native').jar(),
// 	userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148' 
// }
// const cheerio = require('cheerio')
// fetchForm.bind(options)()
// .then(response => {
// 	let $ = cheerio.load(response.body);
// 	let form = $('script[id="checkoutViewTemplate"]').html();
// 	$ = cheerio.load(form);
// 	let inputs = $('input');
// 	let counter = 0;
// 	for (let i = 0; i < inputs.length; i++) {
// 		if (!inputs[i].attribs.style && inputs[i].attribs.type !== "submit") {
// 			console.log(JSON.stringify({
// 				name: inputs[i].attribs.name || inputs[i].attribs.id,
// 				value: inputs[i].attribs.value || ""
// 			}, null, '\t'))
// 			counter++;
// 		}
// 	}
// 	console.log(counter)
// })
// .catch(error => {
// 	console.log(error)
// })

module.exports = { fetchMobileTotals, fetchForm, submit, pollStatus }