exports.cartForm = function(sizeId, styleId, hasQtyProperty = false) {
	form = {
		size: sizeId,
		style: styleId
	}

	if (hasQtyProperty) {
		form.qty = this.taskData.products[0].quantity;
	}
	return form;
}

exports.checkoutFormMobile = function(region, cookieSub, billingInfo, paymentInfo, captchaToken) {
	const form = {
		'store_credit_id': '',
		'from_mobile': 1,
		'cookie-sub': cookieSub,
		'same_as_billing_address': 1,
		'order[billing_name]': `${billingInfo.first} ${billingInfo.last}`,
		'order[email]': billingInfo.email,
		'order[tel]': billingInfo.telephone,
		'order[billing_address]': billingInfo.address1,
		'order[billing_city]': billingInfo.city,
		'order[billing_zip]': billingInfo.zip,
		'credit_card[month]': paymentInfo.expiryMonth,
		'credit_card[year]': paymentInfo.expiryYear,
		'order[terms]': 1,
		'g-recaptcha-response': captchaToken
	}
	switch (region) {
		case 'EU':
			form['order[billing_address_2]'] = billingInfo.address2;
			form['order[billing_address_3]'] = billingInfo.address3;
			form['order[billing_country]'] = billingInfo.country;
			form['credit_card[type]'] = paymentInfo.type;
			form['credit_card[cnb]'] = paymentInfo.cardNumber;
			form['credit_card[vval]'] = paymentInfo.cvv;
			break;
		case 'US':
			form['order[billing_name]'] = '';
			form['order[bn]'] = `${billingInfo.first} ${billingInfo.last}`;
			form['order[billing_address_2]'] = billingInfo.address2;
			form['order[billing_state]'] = billingInfo.state;
			form['order[billing_country]'] = billingInfo.country;
			form['credit_card[cnb]'] = paymentInfo.cardNumber;
			form['credit_card[rsusr]'] = paymentInfo.cvv;
			break;
		case 'JP':
			form['order[billing_state]'] = billingInfo.state;
			form['store_address'] = 1;
			form['credit_card[type]'] = paymentInfo.type;
			form['credit_card[cnb]'] = paymentInfo.cardNumber;
			from['credit_card[vval]'] = paymentInfo.cvv;
			break;
		default:
	}
	return form;
}