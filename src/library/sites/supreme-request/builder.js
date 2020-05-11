const { logger } = require('../../other');

module.exports = function (type) {
	let form;
	switch (type) {
		case 'cart-add':
			if (this.region === 'us') {
				form = {
					"s": this.sizeId,
					"st": this.styleId,
					// "ds": 'bog',
					// "ds1": 'bog2',
					// "ns": ((+this.sizeId) + (+this.styleId)),
					"qty": this.products[0].productQty || 1
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
				let element = this.formElements[i];
				if (
					element.hasOwnProperty('style') &&
					element.style.includes('absolute')
				) {
					let name = element.name || element.id;
					form[name] = element.value || '';
				}
				else if (element.placeholder) {
					switch (element.placeholder) {
						case 'full name':
						case 'na‌me':
							form[element.name] = `${this.profile.billing.first} ${this.profile.billing.last}` || '';
							break;
			
						case 'email':
							form[element.name] = this.profile.billing.email || '';
							break;
			
						case 'telephone':
							form[element.name] = this.profile.billing.telephone || '';
							break;
						case 'address':
							form[element.name] = this.profile.billing.address1 || '';
							break;
			
						case 'address 2':
						case 'apt, unit, etc':
							form[element.name] = this.profile.billing.address2 || '';
							break;
			
						case 'postcode':
						case 'zip':
							form[element.name] = this.profile.billing.zip || '';
							break;
						case 'city':
							form[element.name] = this.profile.billing.city || '';
							break;
						case 'state':
							form[element.name] = this.profile.billing.state || '';
							break;
						case 'credit card number':
							form[element.name] = this.profile.payment.cardNumber || '';
							break;
						case 'cvv':
							form[element.name] = this.profile.payment.cvv || '';
							break;
					}
			
				}
				else if (element.id && !element.value) {
					switch (element.id) {
						case 'store_credit_id':
							form[element.name] = '';
							break;
						case 'cookie-sub':
							form[element.name] = this.cookieSub || '';
							break;
						case 'order_billing_country':
							form[element.name] = this.profile.billing.country || '';
							break;
						case 'credit_card_type':
							form[element.name] = this.profile.payment.type || '';
							break;
						case 'credit_card_month':
							form[element.name] = this.profile.payment.expiryMonth || '';
							break;
						case 'credit_card_year':
							form[element.name] = this.profile.payment.expiryYear || '';
							break;
					}
				}
				else if(element.name !== 'store_address') {
					form[element.name] = (element.hasOwnProperty('value') ? element.value : '');
				}
			}

			if (this.cardinal.id) {
				form['cardinal_id'] = this.cardinal.id;
			}
			break;
	}
	logger.verbose(JSON.stringify(form, null, '\t'));
	return form;
}