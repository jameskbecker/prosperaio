exports.fillForm = function () {
	return new Promise(async (resolve, reject) => {
		try {
			await this.page.tap('#checkout-now');
			let paymentInfo = this.profile.payment;
			if (this.page.url !== `${this.baseUrl}/mobile#checkout`) {
				await this.page.goto(`${this.baseUrl}/mobile#checkout`);
			}
			else {
				//await this.page.reload();
			}
			await this.page.waitFor('#order_billing_name');
			this.setStatus('Filling Checkout Form.', 'WARNING');
			await this.page.select('select[name="credit_card[type]"]', this.profile.payment.type);
			await this.page.tap('input[placeholder="credit card number"]');
			await this.page.evaluate(`$('input[placeholder="credit card number"]').val('${this.profile.payment.cardNumber.replace(/\s/g, '')}')`)
			await this.page.select('select[name="credit_card[month]"', this.profile.payment.expiryMonth);
			await this.page.select('select[name="credit_card[year]"]', paymentInfo.expiryYear);
			await this.page.tap('input[placeholder="cvv"]');
			await this.page.type('input[placeholder="cvv"]', paymentInfo.cvv, { delay: 1 });
			await this.page.tap('#order_terms');
			
			resolve();
		}
		catch (err) {
			console.log(err)
		}
	})
}

exports.submitForm = function() {
	return new Promise(async (resolve, reject) => {
	//	const captchaId = this.checkoutAttempts > 0 ? `g-recaptcha-response-${this.checkoutAttempts}` : 'g-recaptcha-response';
	await this.page.evaluate(`$('[name="cardinal_id"]').remove()`);
	await this.page.evaluate(`$('[src*="https://songbird.cardinalcommerce.com"]').remove()`);
	
	await this.page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML = "${this.captchaResponse}"`);
		await this.page.tap('#submit_button');
		this.page.on('response', async response => {
			if (response.url() === `${this.baseUrl}/checkout.json`) {
				let body = JSON.parse(await response.text());
				console.log(body)
				this.checkoutData = body;
				resolve();
			}
		})
	})
}



exports.fillFormDesktopEu = function () {
	return new Promise(async (resolve, reject) => {
		let paymentInfo = this.profile.payment;
		if (this.page.url !== `https://www.${this.baseUrl}/checkout`) {
			await this.page.goto(`https://www.${this.baseUrl}/checkout`);
			await this.page.click('#cnb');
			await this.page.evaluate(`document.getElementById("cnb").value = "${paymentInfo.cardNumber}"`);
			await this.page.select('#credit_card_month', paymentInfo.expiryMonth);
			await this.page.select('#credit_card_year', paymentInfo.expiryYear);
			await this.page.type('#vval', paymentInfo.cvv, { delay: this.taskData.typeDelay });
			await this.page.click('#order_terms');
			await this.requestCaptcha();
			const captchaId = 'g-recaptcha-response';
			await this.page.evaluate(`document.getElementById("${captchaId}").innerHTML = "${this.captchaResponse}"`);
			await this.page.evaluate('checkoutAfterCaptcha();')
			this.page.on('response', async response => {
				console.log(response.url())
				if (response.url() === `${this.baseUrl}/checkout.json`) {
					let body = JSON.parse(await response.text());
					

				}
			})
		}
		else {
			await this.page.reload();
		}
		resolve();
	})
}

exports.pollStatus = function () {
	let options = {
		url: this.baseUrl + '/checkout/' + this.slug + '/status.json',
		method: 'GET',
		json: true
	}
	return this.request(options);
}