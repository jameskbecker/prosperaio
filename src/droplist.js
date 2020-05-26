const request = require('request-promise-native');

async function getProducts() {
	document.getElementById('productApiStatus').value = "Fetching Products"
	try {
		let response = await request({
			url: 'http://prosper-products-eu.herokuapp.com/supreme/latest',
			method: 'GET',
			json: true,
			resolveWithFullResponse: true,
			headers: {
				accept: 'application/json'
			}
		})
		let body = response.body;
		document.getElementById('productApiStatus').value = "Loaded Products"
		return body;
	}
	catch (error) {
		document.getElementById('productApiStatus').value = "Error Fetching Products"
		console.log(error)
		return {};
	}
}

module.exports = getProducts;