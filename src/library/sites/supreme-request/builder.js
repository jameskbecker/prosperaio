const { logger } = require('../../other');

module.exports = function (type) {
	let form;
	switch (type) {
		case 'cart-add':
			if (this.region === 'us') {
				form = {
					"s": this.sizeId,
					"st": this.styleId,
					"ds": 'bog',
					"ds1": 'bog2',
					"ns": ((+this.sizeId) + (+this.styleId)),
					"qty": qty
				}
			}
			else {
				form = {
					"size": this.sizeId,
					"style": this.styleId,
					"qty": this.products[0].productQty || 1
				}
			}
			break;

		case 'mobile-totals':
			form = {
				"order[billing_country]": this.profile.billing.country,
				"cookie-sub": this.cookieSub,
				"mobile": true
			}
			break;

		case 'parsed-checkout':
			form = {
				'g-recaptcha-response': this.captchaResponse
			}
			if (Math.floor(Math.random() * 2)) form['is_from_ios_native'] = '1';
		
			for (let i = 0; i < this.formElements.length; i++) {
				if (this.formElements[i].placeholder) {
					if (this.formElements[i].style) {
						form[this.formElements[i].name] = "";
					} else {
					switch (this.formElements[i].placeholder.replace('\u200c', '')) {
						case 'name':
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
						case 'apt, unit, etc':
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
				}
				else if (this.formElements[i].id) {
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
			form['order[terms]'] = '1';

			if (this.cardinal.id) {
				form['cardinal_id'] = this.cardinal.id;
			}
			break;
	}
	logger.verbose(JSON.stringify(form, null, '\t'));
	return form;
}