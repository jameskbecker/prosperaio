exports.add = function() {
	return new Promise((resolve, reject) => {
		this.request({
			url: 'https://www.footlocker.de/de/zum-warenkorb-hinzufuegen',
			method: 'POST',
			headers: {},
			qs: {
				"SynchronizerToken": this.syncToken,
				"Ajax": true,
				"Relay42_Category":	"Product Pages",
				"acctab-tabgroup-319251459080990":	null,
				"Quantity_319251459080990":	1,
				"SKU": this.productSKU
			}
		}, (error, response, body) => {
			if (error) {
				reject(error);
			}
			else if (response.statusCode !== 200) {

			}
			else {

			}
		})
	})
}