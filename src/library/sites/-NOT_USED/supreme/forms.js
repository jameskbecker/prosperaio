const desktop_EU = function() {
	let billingInfo = this.profile.billing;
	let paymentInfo = this.profile.payment;
	
	let form = {
		"utf8": "✓",
		"authenticity_token": this.authToken,
		"order[billing_name]": `${billingInfo.first} ${billingInfo.last}`,
		"order[email]": billingInfo.email,
		"order[tel]": billingInfo.telephone,
		"order[billing_address]": billingInfo.address1,
		"order[billing_address_2]": billingInfo.address2,
		"order[billing_address_3]": billingInfo.address3,
		"order[billing_city]": billingInfo.city,
		"order[billing_zip]": billingInfo.zip,
		"order[billing_country]": billingInfo.country,
		"same_as_billing_address": 1,
		"store_credit_id": "",
		"credit_card[type]": paymentInfo.type,
		"credit_card[cnb]": paymentInfo.number,
		"credit_card[month]": paymentInfo.expMonth,
		"credit_card[year]": paymentInfo.expYear,
		"credit_card[vval]": paymentInfo.cvv,
		"order[terms]": 0,
		"order[terms]": 1,
		"g-recaptcha-response": this.captchaResponse,
		"hpcvv": ""
	}
	
	return form
}

const mobile_EU = function() {
	let billingInfo = this.profile.billing;
	let paymentInfo = this.profile.payment;
	let form = {
		"store_credit_id": "",
		"from_mobile": 1,
		"cookie-sub": encodeURI(`{"${this.productData.sizeId}":"${this.products[0].quantity}"}`),
		"same_as_billing_address": 1,
		"order[billing_name]": `${billingInfo.first} ${billingInfo.last}`,
		"order[email]": billingInfo.email,
		"order[tel]": billingInfo.telephone,
		"order[billing_address]": billingInfo.address1,
		"order[billing_address_2]": billingInfo.address2,
		"order[billing_address_3]": billingInfo.address3,
		"order[billing_city]": billingInfo.city,
		"order[billing_zip]": billingInfo.zip,
		"order[billing_country]": billingInfo.country,
		"credit_card[type]": paymentInfo.type,
		"credit_card[cnb]": paymentInfo.cardNumber,
		"credit_card[month]": paymentInfo.expiryMonth,
		"credit_card[year]": paymentInfo.expiryYear,
		"credit_card[vval]": paymentInfo.cvv,
		"order[terms]": 0,
		"order[terms]": 1,
		"g-recaptcha-response": this.captchaResponse
	}
	return form;
}

const desktop_US = function() {
	form = {
		'utf8': '✓',
		'authenticity_token': this.authToken,
		'order[billing_name]': `${billingInfo.first} ${billingInfo.last}`,
		'order[email]': billingInfo.email,
		'order[tel]': billingInfo.telephone,
		'order[billing_address]': billingInfo.address1,
		'order[billing_address_2]': billingInfo.address2,
		'order[billing_zip]': billingInfo.zip,
		'order[billing_city]': billingInfo.city,
		'order[billing_state]': billingInfo.state,
		'order[billing_country]': billingInfo.country,
		'asec': 'Rmasn',
		'same_as_billing_address': 1,
		'store_credit_id': '',
		'credit_card[nlb]': paymentInfo.number,
		'credit_card[month]': paymentInfo.expMonth,
		'credit_card[year]': paymentInfo.expYear,
		'credit_card[rvv]': paymentInfo.cvv,
		'order[terms]': 0,
		'order[terms]': 1,
		'g-recaptcha-response': this.captchaResponse,
		'credit_card[vval]': ''
	}

	
}

const mobile_US = function() {
	form = {
		'store_credit_id': '',
		'from_mobile': 1,
		'cookie-sub': encodeURI(`{"${this.productData.sizeId}":"${this.products[0].quantity}"}`),
		'same_as_billing_address': 1,
		'order[billing_name]': '',
		'order[bn]': `${billingInfo.first} ${billingInfo.last}`,
		'order[email]': billingInfo.email,
		'order[tel]': billingInfo.telephone,
		'order[billing_address]': billingInfo.address1,
		'order[billing_address_2]': billingInfo.address2,
		'order[billing_zip]': billingInfo.zip,
		'order[billing_city]': billingInfo.city,
		'order[billing_state]': billingInfo.state,
		'order[billing_country]': billingInfo.country,
		'credit_card[cnb]': paymentInfo.cardNumber,
		'credit_card[month]': paymentInfo.expiryMonth,
		'credit_card[year]': paymentInfo.expiryYear,
		'credit_card[rsusr]': paymentInfo.cvv,
		'order[terms]': 0,
		'order[terms]': 1,
		'g-recaptcha-response': this.captchaResponse
	}
}

const mobile_JP = function() {
	form = {
		'store_credit_id': '',
		'from_mobile': 1,
		'cookie-sub': encodeURI(`{"${this.productData.sizeId}":"${this.products[0].quantity}"}`),
		'same_as_billing_address': 1,
		'order[billing_name]': `${billingInfo.first} ${billingInfo.last}`,
		'order[email]': billingInfo.email,
		'order[tel]': billingInfo.telephone,
		'order[billing_zip]': billingInfo.zip,
		'order[billing_state]':  billingInfo.state,
		'order[billing_city]': billingInfo.city,
		'order[billing_address]': billingInfo.address1,
		'store_address': 1,
		'credit_card[type]': paymentInfo.type,
		'credit_card[cnb]': paymentInfo.cardNumber,
		'credit_card[month]': paymentInfo.expiryMonth,
		'credit_card[year]': paymentInfo.expiryYear,
		'credit_card[vval]': paymentInfo.cvv,
		'order[terms]': 0,
		'order[terms]': 1,
		'g-recaptcha-response': this.captchaResponse
	}
}

const desktop_JP = function() {
	form = {
		'utf8': '✓',
		'authenticity_token': this.authToken,
		'order[billing_name]': `${billingInfo.first} ${billingInfo.last}`,
		'order[email]': billingInfo.email,
		'order[tel]': billingInfo.telephone,
		'order[billing_zip]': billingInfo.zip,
		'order[billing_state]':  billingInfo.state,
		'order[billing_city]': billingInfo.city,
		'order[billing_address]': billingInfo.address1,
		'same_as_billing_address': 1,
		'credit_card[type]': paymentInfo.type,
		'credit_card[cnb]': paymentInfo.cardNumber,
		'credit_card[month]': paymentInfo.expiryMonth,
		'credit_card[year]': paymentInfo.expiryYear,
		'credit_card[vval]': paymentInfo.cvv,
		'order[terms]': 0,
		'order[terms]': 1,
		'g-recaptcha-response': this.captchaResponse,
		'hpcvv': '' 
	}
}

exports.checkoutForm = function(options = {}) {
	const baseMobile = {
		'store_credit_id': '',
		'from_mobile': 1,
		'cookie-sub': encodeURI(`{"${this.productData.sizeId}":"${this.products[0].quantity}"}`),
		'same_as_billing_address': 1,
		'order[billing_name]': `${billingInfo.first} ${billingInfo.last}`,
		
		'g-recaptcha-response': this.captchaResponse,
		
	}

	const baseDesktop = {
		"utf8": "✓",
		"authenticity_token": this.authToken,
		"order[billing_name]": `${billingInfo.first} ${billingInfo.last}`,
		"order[email]": billingInfo.email,
		'order[tel]': billingInfo.telephone,
		'order[billing_zip]': billingInfo.zip,
		'order[billing_city]': billingInfo.city,
		'credit_card[month]': paymentInfo.expiryMonth,
		'credit_card[year]': paymentInfo.expiryYear,
		'order[terms]': 1,
		'g-recaptcha-response': this.captchaResponse

	}

	switch(type) {
		
	}
}