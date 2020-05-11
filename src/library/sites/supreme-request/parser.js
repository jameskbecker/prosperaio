const request = require('request-promise-native');
const cheerio = require('cheerio');
const utilities = require('../../other/utilities')

function parseForm(formElements) {
	let form = {};
	for (let i = 0; i < formElements.length; i++) {
		let element = formElements[i];
		if (
			element.hasOwnProperty('style') &&
			element.style.includes('absolute')
		) {
			let name = element.name || element.id;
			form[name] = element.value || '';
		}
		else if (element.placeholder) {
			switch (element.placeholder) {
				case 'full name':
				case 'na‌me':
					form[element.name] = 'full name'
					break;

				case 'email':
					form[element.name] = 'email';
					break;

				case 'telephone':
					form[element.name] = 'telephone'
					break;
				case 'address':
					form[element.name] = 'address1'
					break;

				case 'address 2':
				case 'apt, unit, etc':
					form[element.name] = 'address2'
					break;

				case 'postcode':
				case 'zip':
					form[element.name] = 'zip'
					break;
				case 'city':
					form[element.name] = 'city'
					break;
				case 'state':
					form[element.name] = 'state'
					break;
				case 'credit card number':
					form[element.name] = 'cc number'
					break;
				case 'cvv':
					form[element.name] = 'cvv'
					break;
			}

		}
		else if (element.id && !element.value) {
			switch (element.id) {
				case 'store_credit_id':
					form[element.name] = '';
					break;
				case 'cookie-sub':
					form[element.name] = 'cookie sub'
					break;
				case 'order_billing_country':
					form[element.name] = 'DE'
					break;
				case 'credit_card_type':
					form[element.name] = 'visa'
					break;
				case 'credit_card_month':
					form[element.name] = '11'
					break;
				case 'credit_card_year':
					form[element.name] = '34'
					break;
			}
		}
		else if(element.name !== 'store_address') {
			form[element.name] = (element.hasOwnProperty('value') ? element.value : '');
		}
	}
	return form;
}

request({
	url: 'https://www.supremenewyork.com/mobile',
	method: 'GET',
	resolveWithFullResponse: true,
	proxy: utilities.formatProxy("west.proxies.aycd.io:80:113642-233yba5zxuma78h380ff2ak-residential-us-static-wwwsupremenewyorkcom:05XCqN1gH774St1")
})
	.then(response => {
		let body = response.body;
		let formElements = [];
		let $ = cheerio.load(body);
	
		let checkoutWrapper = $("#checkoutViewTemplate").html();
		$ = cheerio.load(checkoutWrapper);
		let checkoutForm = $('form[action="https://www.supremenewyork.com/checkout.json"]').html();
		$ = cheerio.load(checkoutForm);
		$(':input[type!="submit"]').each(function () {
			let formElement = $(this)[0].attribs;
			let output = {};
			let attributes = ["name", "id", "placeholder", "value", "style"]
			attributes.forEach(attribute => {
				if (Object.hasOwnProperty.bind(formElement)(attribute)) {
					output[attribute] = formElement[attribute]
				}
			})
			if (Object.keys(output).length > 0) {
				formElements.push(output)
			}
		})
		console.log(parseForm(formElements))
	})
	.catch((e) => {console.error(e.message) })