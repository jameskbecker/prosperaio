exports.add = function () {
	return new Promise(async (resolve, reject) => {
		try {
			if (this.page.url().includes(this.mobileUrl)) {
				await this.page.reload({ waitUntil: 'domcontentloaded' });
			}
			else {
				await this.page.goto(this.mobileUrl + '/' + this.styleId);
			}
			this.setStatus('Carting.', 'WARNING');


			await this.page.waitForSelector('.cart-button');
			const cartButtonText = await this.page.$eval('.cart-button', button => button.innerHTML);
			if (cartButtonText === 'sold out') {
				let err = new Error();
				err.code = 'Out of Stock.';
				reject(err);
			}

			else {
				await this.page.waitForSelector('select[name="size-options"]');
				await this.page.select('select[name="size-options"]', '' + this.sizeId);

				this.setStatus('Delaying ATC.', 'WARNING');
				await this.page.waitFor(this.taskData.delays.cart || 0);
				this.setStatus('Carting.', 'WARNING');
				await this.page.tap('span.cart-button');
				await this.page.waitForResponse(`${this.baseUrl}/shop/${this.productId}/add.json`)
				this.setStatus('Added to Cart.', 'SUCCESS');	
				resolve();
			}
		}
		catch (err) {
			console.log(err);
			reject(err)
		}
	})
}