module.exports = function (type, options = {}) {
	let form;
	switch (type) {
		case 'create-account':
			form = {
				'form_type': 'create_customer',
				'utf8':	'✓',
				'customer[first_name]':	'first',
				'customer[last_name]':	'last',
				'customer[email]':	'email',
				'customer[password]':	'pass'
			};

			return form;

		case 'login-account':
			form = {
				'form_type': 'customer_login',
				'utf8':	'✓',
				'customer[email]': 'email',
				'customer[password]':	'password'
			}

		case 'cart':
			form = {
				'id': this.productData.variantId,
				'quantity': this.taskData.products[0].productQty
			};

			if (Object.keys(this.properties).length > 0) form['properties'] = this.properties;
			return form;

		case 'create-checkout':
			form = {
				"checkout": "Checkout"
			};
			form[`updates[${options.variantId}]`] = '1';
			if (options.note) form.note = options.note;

			if (['kith'].includes(this.site.id)) {
				form['attributes[checkout_clicked]'] = true;
			}

			if (['kith'].includes(this.site.id)) {
				form['checkout'] = '';
			}

			
			return form;

		case 'contact':
			form = {
				"_method": "patch",
				"previous_step": "contact_information",
				"step": "shipping_method",
				"authenticity_token": options.authToken,
				"checkout[email]": options.shipping.email,
				"checkout[buyer_accepts_marketing]": "0",
				"checkout[shipping_address][first_name]": options.shipping.first,
				"checkout[shipping_address][last_name]": options.shipping.last,
				"checkout[shipping_address][address1]": options.shipping.address1,
				"checkout[shipping_address][address2]": options.shipping.address2,
				"checkout[shipping_address][zip]": options.shipping.zip,
				"checkout[shipping_address][city]": options.shipping.city,
				"checkout[shipping_address][country]": "Germany", //!!!!!!!!!!!!!!!!!!!!!!!!!!!
				"checkout[shipping_address][phone]": options.shipping.telephone,
				"checkout[remember_me]": "1",
				"button": "",
				"checkout[client_details][browser_width]": "1630",
				"checkout[client_details][browser_height]": "985",
				"checkout[client_details][javascript_enabled]": ""
			}

			if (options.captchaResponse) form["g-recaptcha-response"] = options.captchaResponse;
			return form;

		case 'shipping':
			form = {
				"_method": "patch",
				"previous_step": "shipping_method",
				"step": "payment_method",
				"checkout[shipping_rate][id]": options.shippingId,
				"button": "",
				"checkout[client_details][browser_width]": "1630",
				"checkout[client_details][browser_height]": "985",
				"checkout[client_details][javascript_enabled]": "1"
			}
			return form;


		case 'credit-card':
			form = {
				"credit_card": {
					"number": options.billing.cardNumber,
					"name": `${options.billing.firstName} ${options.billing.lastName}`,
					// "start_month": "",
					// "start_year": "",
					"month": options.billing.expiryMonth,
					"year": options.billing.expiryYear,
					"verification_value": options.billing.cvv					
				}
			}
			return form;


		case 'submit-payment':
			form = {
				"_method": "patch",
				"previous_step": "payment_method",
				"step": "",
				"s": options.sessionId,
				"checkout[payment_gateway]": options.gatewayId,
				"checkout[credit_card][vault]": "false",
				"checkout[different_billing_address]": "false",
				"checkout[total_price]": "7800",
				"complete": "1",
				"checkout[client_details][browser_width]": "1630",
				"checkout[client_details][browser_height]": "985",
				"checkout[client_details][javascript_enabled]": "1"
			};
			return form;

	}
};