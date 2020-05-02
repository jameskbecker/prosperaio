exports.addCart = function() {
	return new Promise(async (resolve, reject) => {
		if (this.taskData.setup.platform === 'mobile') {
			try {
				let productUrl = `https://www.${this.baseUrl}/mobile#products/${this.productData.productSKU}/${this.productData.styleId}`;
				if (this.page.url() === productUrl) {
					await this.page.reload({waitUntil: 'domcontentloaded'});
				}
				else {
					await this.page.goto(productUrl);
				}
				this.setStatus('ATTEMPTING TO CART', 'WARNING');
				
				
				await this.page.waitForSelector('.cart-button');
				const cartButtonText = await this.page.$eval('.cart-button', button => button.innerHTML);
				if (cartButtonText === 'sold out') {
					let err = new Error();
					err.code = 'OUT OF STOCK';
					reject(err);
				}
				
				else {
					await this.page.waitForSelector('#size-options');
					await this.page.select('#size-options', '' + this.productData.sizeId);
					
					this.setStatus('Delaying.', 'WARNING')();
					await this.page.waitFor(parseInt(this.taskData.cartDelay))
					await this.page.click('span .cart-button');
					await this.page.waitForResponse(`https://www.${this.baseUrl}/shop/${this.productData.productSKU}/add.json`);
					resolve();
				}
			}
			catch (err) {
				console.log(err);
				reject(err)
			}
		}
		else if (this.taskData.setup.platform === 'desktop') {
			let productUrl = `https://www.${this.baseUrl}/shop/category/${this.productData.productSKU}/${this.productData.styleId}`;
			if (this.page.url() === productUrl) {
			await this.page.reload({waitUntil: 'domcontentloaded'});
		}
		else {
			await this.page.goto(productUrl);
		}
		await this.page.waitForSelector('[type="submit"]');
		const cartButtonText = await this.page.$eval('[type="submit"]', button => button.value);
		if (cartButtonText === 'sold out') {
			let err = new Error();
			err.code = 'OUT OF STOCK';
			reject(err);
		}
		else {
			await this.page.waitForSelector('#size');
			await this.page.select('#size', '' + this.productData.sizeId);
			this.setStatus('Delaying.', 'WARNING')();
			await this.page.waitFor(parseInt(this.taskData.cartDelay));
			await this.page.click('[type="submit"]');
			this.setStatus('CARTING', 'WARNING')();
			await this.page.waitForResponse(`https://www.${this.baseUrl}/shop/${this.productData.productSKU}/add`);
			resolve();

		}
		}
	})
}