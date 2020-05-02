module.exports = function (type) {
	let form;
	switch (type) {
		case 'cart':
			form = {
				"size": this.productData.sizeId,
				"style": this.productData.styleId,
				"qty": this.taskData.productQty || 1
			}
			return form;

		case 'totals-mobile':
			form = {
				'order[billing_country]': this.profile.billing.country,
				'cookie-sub': this.cookieSub,
				'mobile': true
			}
			return form;

		case 'cardinal-init':
			form = {
				"BrowserPayload": {
					"Order": {
						"OrderDetails": {},
						"Consumer": {
							"BillingAddress": {},
							"ShippingAddress": {},
							"Account": {}
						},
						"Cart": [],
						"Token": {},
						"Authorization": {},
						"Options": {},
						"CCAExtension": {}
					},
					"SupportsAlternativePayments": {
						"cca": true,
						"hostedFields": false,
						"applepay": false,
						"discoverwallet": false,
						"wallet": false,
						"paypal": false,
						"visacheckout": false
					}
				},
				"Client": {
					"Agent": "SongbirdJS",
					"Version": "1.26.0"
				},
				"ConsumerSessionId": null,
				"ServerJWT": this.cardinalJWT
			}
			return form;

		case 'checkout-eu':
			form = {
				'store_credit_id': '',
				'from_mobile': '1',
				'cookie-sub': this.cookieSub,
				'cardinal_id': this.cardinalId,
				'same_as_billing_address': '1',
				'order[billing_name]': `${this.profile.billing.first} ${this.profile.billing.last}`,
				'order[email]': this.profile.billing.email,
				'order[tel]': this.profile.billing.telephone,
				'order[billing_address]': this.profile.billing.address1,
				'order[billing_address_2]': this.profile.billing.address2,
				'order[billing_address_3]': '',
				'order[billing_city]': this.profile.billing.city,
				'order[billing_zip]': this.profile.billing.zip,
				'order[billing_country]': this.profile.billing.country,
				'store_address': '1',
				'credit_card[type]': this.profile.payment.type,
				'credit_card[cnb]': this.profile.payment.cardNumber,
				'credit_card[month]': this.profile.payment.expiryMonth,
				'credit_card[year]': this.profile.payment.expiryYear,
				'credit_card[vval]': this.profile.payment.cvv,
				'order[terms]': '1',
				'g-recaptcha-response': this.captchaResponse,
				'is_from_ios_native': '1'
			}
			return form;

		case 'checkout-us':
			form = {
				'store_credit_id': '',
				'from_mobile': '1',
				'cookie-sub': this.cookieSub,
				'same_as_billing_address': 1,
				'order[billing_name]': '', //fake billing name 
				'order[bn]': `${this.profile.billing.first} ${this.profile.billing.last}`,
				'order[email]': this.profile.billing.email,
				'order[tel]': this.profile.billing.telephone,
				'order[billing_address]': this.profile.billing.ad,
				'order[billing_address_2]': this.profile.billing.address2,
				'order[billing_zip]': this.profile.billing.zip,
				'order[billing_city]': this.profile.billing.city,
				'order[billing_country]': 'USA',
				'credit_card[cnb]': this.profile.payment.cardNumber,
				'credit_card[month]': this.profile.payment.expiryMonth,
				'credit_card[year]': this.profile.payment.expiryYear,
				'credit_card[rsusr]': this.profile.payment.cvv,
				'order[terms]': '1',
				'g-recaptcha-response': this.captchaResponse,
				'is_from_ios_native': '1'
			}
			return form;

		case 'checkout-jp':
			form = {
				'store_credit_id': '',
				'from_mobile': 1,
				'cookie-sub': this.cookieSub,
				'same_as_billing_address': 1,
				'order[billing_name]': `${this.profile.billing.first} ${this.profile.billing.last}`,
				'order[email]': this.profile.billing.email,
				'order[tel]': this.profile.billing.telephone,
				'order[billing_address]': this.profile.billing.address1,
				'order[billing_city]': this.profile.billing.city,
				'order[billing_zip]': this.profile.billing.zip,
				'credit_card[month]': this.profile.payment.expiryMonth,
				'credit_card[year]': this.profile.payment.expiryYear,
				'order[terms]': 0,
				'order[terms]': 1,
				'g-recaptcha-response': this.captchaResponse,
				'is_from_ios_native': 1
			}
			form['order[billing_state]'] = this.profile.billing.state;
			form['store_address'] = 1;
			form['credit_card[type]'] = this.profile.payment.type;
			form['credit_card[cnb]'] = this.profile.payment.cardNumber;
			from['credit_card[vval]'] = this.profile.payment.cvv;
			return form;

		case 'parsed-checkout':
			form = {
				'g-recaptcha-response': this.captchaResponse
			}
			console.log(this.formElements)
			for (let i = 0; i < this.formElements.length; i++) {
				if (this.formElements[i].hasOwnProperty('placeholder')) {
					switch (this.formElements[i].placeholder) {
						case 'full name':
							form[this.formElements[i].name] = `${this.profile.billing.first} ${this.profile.billing.last}`;
							break;

						case 'email':
							form[this.formElements[i].name] = this.profile.billing.email;
							break;

						case 'telephone':
							form[this.formElements[i].name] = this.profile.billing.telephone;
							break;

						case 'address':
							form[this.formElements[i].name] = this.profile.billing.address1;
							break;

						case 'address 2':
							form[this.formElements[i].name] = this.profile.billing.address2;
							break;

						case 'address 3':
							form[this.formElements[i].name] = '';
							break;

						case 'city':
							form[this.formElements[i].name] = this.profile.billing.city;
							break;

						case 'postcode':
							form[this.formElements[i].name] = this.profile.billing.zip;
							break;

						case 'credit card number':
							form[this.formElements[i].name] = this.profile.payment.cardNumber
							break;

						case 'cvv':
							form[this.formElements[i].name] = this.profile.payment.cvv
							break;
					}
				}
				else if (this.formElements[i].hasOwnProperty('id')) {
					switch (this.formElements[i].id) {
						case 'store_credit_id':
							form[this.formElements[i].name] = '';
							break;

						case 'cookie-sub':
							form[this.formElements[i].name] = this.cookieSub;
							break;

						case 'remember_address':
							form[this.formElements[i].name] = '1';
							break;

						case 'order_terms':
							form[this.formElements[i].name] = '1';
							break;

						case 'order_billing_country':
							form[this.formElements[i].name] = this.profile.billing.country.toUpperCase();
							break;

						case 'credit_card_type':
							form[this.formElements[i].name] = this.profile.payment.type;
							break;	

						case 'credit_card_month':
							form[this.formElements[i].name] = this.profile.payment.expiryMonth;
							break;

						case 'credit_card_year':
							form[this.formElements[i].name] = this.profile.payment.expiryYear;
							break;
					}
				}
				else {
					form[this.formElements[i].name] = this.formElements[i].value || '';
				}


			}
			return form;
	}
}