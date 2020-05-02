const { logger } = require('../../other');

module.exports = function (type) {
	let form;
	switch (type) {
		case 'cart':
			if (this.region === 'eu') {
				form = {
					"size": this.sizeId,
					"style": this.styleId,
					"qty": this.taskData.productQty || 1
				}
			}
			else {
				form = {
					"s": this.sizeId,
					"st": this.styleId,
					"ds": 'bog',
					"qty": this.taskData.productQty || 1
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
			form['order[terms]'] = '1';

			if (this.cardinalId) {
				form['cardinal_id'] = this.cardinalId;
			}
			break;

		// case 'cardinal-init-jwt':
		// 	form = {
		// 		"BrowserPayload": {
		// 			"Order": {
		// 				"OrderDetails": {},
		// 				"Consumer": {
		// 					"BillingAddress": {},
		// 					"ShippingAddress": {},
		// 					"Account": {}
		// 				},
		// 				"Cart": [],
		// 				"Token": {},
		// 				"Authorization": {},
		// 				"Options": {},
		// 				"CCAExtension": {}
		// 			},
		// 			"SupportsAlternativePayments": {
		// 				"cca": true,
		// 				"hostedFields": false,
		// 				"applepay": false,
		// 				"discoverwallet": false,
		// 				"wallet": false,
		// 				"paypal": false,
		// 				"visacheckout": false
		// 			}
		// 		},
		// 		"Client": {
		// 			"Agent": "SongbirdJS",
		// 			"Version": "1.30.0"
		// 		},
		// 		"ConsumerSessionId": null,
		// 		"ServerJWT": this.cardinalServerJWT
		// 	}
		// 	break;

		// case 'cardinal-render-fingerprint':
		// 	form = {
		// 		"threatmetrix": true,
		// 		"alias": "Default",
		// 		"orgUnitId": "56099d28f723aa3e24d81c1b",
		// 		"tmEventType": "PAYMENT",
		// 		"referenceId": this.cardinalId,
		// 		"geolocation": false,
		// 		"origin": "Songbird"
		// 	};
		// 	break;

		// case 'cardinal-save-fingerprint':
		// 	form = {
		// 		"BinConfigIdentifiers": null,
		// 		"Cookies": {
		// 			"Legacy": true,
		// 			"LocalStorage": true,
		// 			"SessionStorage": true
		// 		},
		// 		"DeviceChannel": "Browser",
		// 		"Extended": {
		// 			"Browser": {
		// 				"Adblock": true,
		// 				"AvailableJsFonts": [],
		// 				"DoNotTrack": "unknown",
		// 				"JavaEnabled": false
		// 			},
		// 			"Device": {
		// 				"ColorDepth": 24,
		// 				"Cpu": "unknown",
		// 				"Platform": "iOS",
		// 				"TouchSupport": {
		// 					"MaxTouchPoints": 0,
		// 					"OnTouchStartAvailable": false,
		// 					"TouchEventCreationSuccessful": false
		// 				}
		// 			}
		// 		},
		// 		"Fingerprint": "ca4b543d6415c116461973b1ec701677",
		// 		"FingerprintingTime": 455,
		// 		"FingerprintDetails": {
		// 			"Version": "1.5.1"
		// 		},
		// 		"Language": "en-GB",
		// 		"Latitude": null,
		// 		"Longitude": null,
		// 		"OrgUnitId": "56099d28f723aa3e24d81c1b",
		// 		"Origin": "Songbird",
		// 		"Plugins": ["Chrome PDF Plugin::Portable Document Format::application/x-google-chrome-pdf~pdf", "Chrome PDF Viewer::::application/pdf~pdf", "Native Client::::application/x-nacl~,application/x-pnacl~"],
		// 		"ReferenceId": this.cardinalId,
		// 		"Referrer": `https://${this.baseUrl}/mobile`,
		// 		"Screen": {
		// 			"FakedResolution": false,
		// 			"Ratio": 1.6,
		// 			"Resolution": "1280x800",
		// 			"UsableResolution": "1280x777",
		// 			"CCAScreenSize": "03"
		// 		},
		// 		"ThreatMetrixEnabled": "false",
		// 		"ThreatMetrixEventType": "PAYMENT",
		// 		"ThreatMetrixAlias": "Default",
		// 		"ThreeDSServerTransId": null,
		// 		"TimeOffset": 0,
		// 		"UserAgent": this.userAgent,
		// 		"UserAgentDetails": {
		// 			"FakedOS": false,
		// 			"FakedBrowser": false
		// 		},
		// 		"BinSessionId": null
		// 	}
		// 	break;

		// case 'cardinal-cca':
		// 	form = {
		// 		"BrowserPayload": {
		// 			"PaymentType": "CCA",
		// 			"Order": {
		// 				"OrderDetails": {
		// 					"TransactionId": "vwWmxaPBaUDIzzly7gB1"
		// 				},
		// 				"Consumer": {
		// 					"Email": this.cardinalConsumerData["Email"],
		// 					"BillingAddress": this.cardinalConsumerData["BillingAddress"],
		// 					"ShippingAddress": this.cardinalConsumerData["ShippingAddress"],
		// 					"Account": {}
		// 				},
		// 				"Cart": [],
		// 				"Token": {},
		// 				"Authorization": {},
		// 				"Options": {},
		// 				"CCAExtension": {}
		// 			}
		// 		},
		// 		"Client": {
		// 			"Agent": "SongbirdJS",
		// 			"Version": "1.30.0"
		// 		},
		// 		"ConsumerSessionId": this.cardinalId,
		// 		"ServerJWT": this.cardinalServerJWT
		// 	}
		// 	break;

		// case 'cardinal-payer-authentication':
		// 	form = {
		// 		"PaReq": this.authPayload,
		// 		"MD": this.cardinalId,
		// 		"TermUrl": "https://centinelapi.cardinalcommerce.com/V1/TermURL/Overlay/CCA"
		// 	}
		// 	break;

		// case 'poll-payment':
		// 	form = {
		// 		"transToken": this.transactionToken
		// 	}
		// 	break;

		// case 'confirm-transaction':
		// 	form = {
		// 		"transToken": this.transactionToken,
		// 		"authToken": this.paymentAuthToken
		// 	}
		// 	break;

		// case 'close-cca':
		// 	form = {
		// 		"MD": this.cardinalId,
		// 		"PaRes": this.cardinalResponsePayload	
		// 	}
		// 	console.log(form)
		// 	break;
	}
	console.log(form);
	return form;
}