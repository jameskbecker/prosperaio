module.exports = function (type, options = {}) {
	let body;
	switch (type) {
		case 'cart':
			body = {
				"checkout": {
					line_items: [{
						"id": options.variantId,
						"quantity": options.qty || 1
					}]
				}
			};
			return body;

		case 'contact':
			body = {
				"checkout": {
					email: options.billing.email,
					billing_address: {
						"first_name": options.billing.first,
						"last_name": options.billing.last,
						"company": '',
						"address1": options.billing.address1,
						"address2": options.billing.address2,
						"zip": options.billing.zip,
						"city": options.billing.city,
						"country": options.country, //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
						"phone": options.billing.telephone
					},
					remember_me: "1",
					client_details: {
						"browser_width": "1920",
						"browser_height": "1200",
						"javascript_enabled": "1"
					}
				}
			}
			if (options.authenticityToken) {
				body.authenticity_token = options.authenticityToken;
			}

			if (options.captchaToken) {
				body["g-recaptcha-response"] = options.captchaToken;
			}
			return body;
		case 'credit-card':
			body = {
				"credit_card": {
					number: options.billing.cardNumber,
					name: `${options.billing.firstName} ${options.billing.lastName}`,
					// "start_month": "",
					// "start_year": "",
					month: options.billing.expiryMonth,
					year: options.billing.expiryYear,
					verification_value: options.billing.cvv
				}
			}
			return body;

		case 'submit-checkout':
			body = {
				"complete": "1",
				"previous_step": "payment_method",
				"step": "",
				"s": options.sessionId,
				"checkout": {}
			}

			if (options.shipping) {
				body.checkout.shipping_address = {
					"first_name": options.shipping.first,
					"last_name": options.shipping.last,
					"company": '',
					"address1": options.shipping.address1,
					"address2": options.shipping.address2,
					"zip": options.shipping.zip,
					"city": options.shipping.city,
					"country": options.country, //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
					"phone": profile.shipping.telephone
				};
				body.checkout.different_billing_address = "1";
			} else {
				body.checkout.different_billing_address = "0";
			}

			if (options.shippingRate) {
				body.checkout.shipping_rate = {
					"id": options.shippingRate
				}
			}
			return body;
	}
}