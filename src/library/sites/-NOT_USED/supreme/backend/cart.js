const builder = require('../builder');
const { utilities } = require('../../../other');
exports.addCart = function() {
	return new Promise(async (resolve, reject) => {
		hasQuantity = this.taskData.products[0].quantity > 1 ? true : false;
		this.request({
			url: `https://www.${this.baseUrl}/shop/${this.productData.productSKU}/add.json`,
			method: 'POST',
			proxy: utilities.formatProxy(this.taskData.additional.proxyOptions.proxy),
			json: true,
			jar: this.cookieJar,
			headers: this.headers, 
			form: builder.cartForm(this.productData.sizeId, this.productData.styleId, hasQuantity)
		}, (error, response, body) => {
			if(!error && response.statusCode === 200) {
				if (body.length > 0) {
					//console.log('Items in Cart:', JSON.stringify(body))
					resolve();
				}
				else {

					
					let err = new Error();
					err.code = 'OUT OF STOCK';
					resolve(err);
				}
				
			}
			else {
				if (error) {
					let err = new Error();
					err.code = 'Connection Error';
					reject(err);
				}
				else {
					console.log(response)
				}
			}
		})
	})
}