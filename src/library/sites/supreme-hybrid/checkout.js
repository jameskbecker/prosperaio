exports.fillForm = function () {
	return new Promise(async (resolve, reject) => {
		try {
			let paymentInfo = this.profile.payment;
			if (this.page.url !== `https://www.supremenewyork.com/mobile#checkout`) {
				await this.page.goto(`https://www.supremenewyork.com/mobile#checkout`);
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
		await this.page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML = "${this.captchaResponse}"`);
		await this.page.tap('#submit_button');
		this.page.on('response', async response => {
			if (response.url() === 'https://www.supremenewyork.com/checkout.json') {
				let body = JSON.parse(await response.text());
				switch (body.status) {
					case 'queued':
						console.log('queued')
						this.slug = body.slug;
						resolve();
						break;
					case 'outOfStock':

						err.code = 'OOS';
						reject(err);
						break;
					case 'failed':
						console.log(body)
						if (body.errors) {
							if (body.errors['credit_card'].number[0] === 'is not a valid credit card number') {
								err = new Error();
								err.code = 'INVALID PAYMENT';
								reject(err);
							}

						}
						if (body.mpa) {
							if (body.mpa[0]['Sold Out?'] === false && body.mpa[0]['Success?'] === false) {
								err = new Error();
								err.code = 'CARD DECLINE';
								reject(err);
							}

							if (body.mpa[0]['Sold Out?'] === true && body.mpa[0]['Success?'] === false) {
								err = new Error();
								err.code = 'OOS';
								reject(err);
							}
							break;

						}
						err = new Error();
						err.code = 'PAYMENT ERROR';
						reject(err);
						break;
					case 'paid':
					default:
						this.successful = true;
						err.code = 'PAID';
						reject(err);
				}

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
				if (response.url() === 'https://www.supremenewyork.com/checkout.json') {
					let body = JSON.parse(await response.text());
					if (body.slug) {
						this.slug = body.slug;
						resolve();
					}
					else {
						console.log(body)
						switch (body.status) {
							case 'failed':
								if (body.errors && body.errors.credit_card.number && body.errors.credit_card.number.length > 0) {
									let err = new Error();
									err.code = 'INVALID PAYMENT';
									reject(err);
								}
								else {
									if (body.errors && body.errors.order && Object.keys(body.errors.order).length > 0) {
										if (body.errors.order.terms) {
											let err = new Error();
											err.code = 'TERMS UNACCEPTED';
											reject(err);
										}
										else {
											let err = new Error();
											err.code = 'INVALID BILLING';
											reject(err);
										}
									}
									else if (this.captchaResponse === '_') {
										let err = new Error();
										err.code = 'NO CAPTCHA';
										reject(err);
									}
								}


						}

					}

				}
			})
		}
		else {
			await this.page.reload();
		}
		resolve();
	})
}