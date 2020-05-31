const request = require('request-promise-native');

function getProducts() {
	return new Promise((resolve) => {
		document.getElementById('productApiStatus').value = "Fetching Products";
		request({
			url: 'http://prosper-products-eu.herokuapp.com/supreme/latest',
			method: 'GET',
			json: true,
			resolveWithFullResponse: true,
			headers: {
				accept: 'application/json'
			}
		})
			.then((response) => {
				let body = response.body;
				document.getElementById('productApiStatus').value = "Loaded Products";
				resolve(body);
			})
			.catch((error) => {
				document.getElementById('productApiStatus').value = "Error Fetching Products";
				console.log(error);
				resolve({});
			});
	});
}

module.exports = getProducts;