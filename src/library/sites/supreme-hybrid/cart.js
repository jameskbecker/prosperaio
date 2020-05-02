exports.add = function () {
	return new Promise(async (resolve, reject) => {
		if (this.page.url().includes(this.mobileUrl)) {
			await this.page.reload({ waitUntil: 'domcontentloaded' });
		}
		else {
			await this.page.goto(this.mobileUrl + '/' + this.styleId);
		}
		this.setStatus('Carting.', 'WARNING');
		await this.page.waitForSelector('.cart-button');
		await this.page.evaluate(`
			$.ajax({
				type: "POST",
				url: "/shop/" + ${this.productId} + "/add.json",
				data: {
					size: ${this.sizeId},
					style: ${this.styleId},
					qty: ${this.taskData.productQty || 1}
				},
				dataType: "json",
				success: function (n) {
					console.log('response:', n)
				},
				error: function () {
					console.log('error')
				}
			})
		`)
	})
}