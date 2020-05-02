module.exports = function (type) {
	let form;;
	switch (type) {
		case 'cart':
			form = {
				"productVariantIdAjax": this.variantId,
				"ttoken": this.cartToken
			}
			console.log(form)
			return form;

		case 'address':
			form = {
				'addressSupport.hintDeliveryAddressSelected': true,
				'addressSupport.hintInvoiceAddressSelected': true,
				'wizard.invoiceAddress.additionalAddressInfo': '',
				'wizard.invoiceAddress.city': this.profile.billing.city,
				'wizard.invoiceAddress.companyName': '',
				'wizard.invoiceAddress.countryIsoCode': this.profile.billing.country.toLowerCase(),
				'wizard.invoiceAddress.county': '',
				'wizard.invoiceAddress.doorCode': '',
				'wizard.invoiceAddress.email': this.profile.billing.email,
				'wizard.invoiceAddress.firstName': this.profile.billing.first,
				'wizard.invoiceAddress.houseNumber': this.profile.billing.address1,
				'wizard.invoiceAddress.lastName': this.profile.billing.last,
				'wizard.invoiceAddress.phone': this.profile.billing.telephone,
				'wizard.invoiceAddress.salutationId': 'MR',
				'wizard.invoiceAddress.state': this.profile.billing.state,
				'wizard.invoiceAddress.street': this.profile.billing.address1,
				'wizard.invoiceAddress.zip': this.profile.billing.zip,
				'wizardOrder.differentDeliveryAddress': false
			}

			// if (!this.sameShippingAddress) {
			// 	form["wizardOrder.differentDeliveryAddress"] = true;
			// 	form["wizard.deliveryAddress.additionalAddressInfo"] = this.profile.shipping.address2;
			// 	form["wizard.deliveryAddress.city"] = this.profile.shipping.city;
			// 	form["wizard.deliveryAddress.companyName"] = "";
			// 	form["wizard.deliveryAddress.countryIsoCode"] = this.profile.shipping.country.toLowerCase();
			// 	form["wizard.deliveryAddress.county"] = "";
			// 	form["wizard.deliveryAddress.doorCode"] = "";
			// 	form["wizard.deliveryAddress.firstName"] = this.profile.shipping.first;
			// 	form["wizard.deliveryAddress.houseNumber"] = "";
			// 	form["wizard.deliveryAddress.lastName"] = this.profile.shipping.last;
			// 	form["wizard.deliveryAddress.phone"] = this.profile.shipping.telephone;
			// 	form["wizard.deliveryAddress.salutationId"] = "MR"
			// 	form["wizard.deliveryAddress.state"] = this.profile.shipping.state;
			// 	form["wizard.deliveryAddress.street"] = this.profile.shipping.address1;
			// }

			if (this.hasCaptcha) {
				form['g-recaptcha-response'] = this.captchaResponse;
			}

			return form;

		case 'payment-url':
			form = {
				"payWithAlias": false
			}
			return form;

		case 'submit-order':
			form = {
				"cardTypeCode": this.ccTypeCode,
				"PaymentMethod": this.paymentMethod,
				"redirectUrl": this.dataUrl,
				"saveCcDataForNextCheckout": true //or false?
			}
			return form;

		case 'submit-payment':
			form = {
				"DATA": this.dataUrl,
				"SIGNATURE": ""
			}
			return form;


		case 'webhook':
			form = {
				embeds: [{
					type: 'rich',
					color: 16777215,
					fields: [
						{
							name: 'Product Name',
							value: this.productName,
							inline: true
						}
					]
				}]
			}

			switch (this.taskData.setup.mode) {
				case 'kickz-wire':
					form.embeds.title = 'Bank Tranfer Required';
					form.embeds[0].fields.push({
						name: 'Order Number',
						value: `|| ${this.orderNumber} ||`,
						inline: false
					})
					break;

				case 'kickz-paypal':
					form.embeds.title = 'Manual Checkout Required';
					form.embeds[0].fields.push({
						name: 'Checkout Now',
						value: `[Click Here](${this.paypalUrl})`,
						inline: false
					})
					break;
			}
			return form;

		// case 'card':
		// 	form = {
		// 		"CardNumber": options.payment.cardNumber,
		// 		"cardType":	options.cardType,
		// 		"ExpMonth":	options.payment.expiryMonth,
		// 		"ExpYear":	options.payment.expiryYear,
		// 		"FromAjax":	true,
		// 		"HolderName":	options.payment.name
		// 	}
		// 	return form;

		// case 'capAttempts':
		// 	form = {
		// 		"MD": options.mdValue,
		// 		"PaReq": options.requestPayload,
		// 		"TermUrl": options.termUrl
		// 	};
		// 	return form;

		// case 'submit-payload':
		// 	form = {
		// 		"PaRes": options.responsePayload,
		// 		"MD": options.mdValue,
		// 		"PaReq": options.requestPayload,
		// 		"ABSlog":	"GPP",
		// 		"deviceDNA": "",	
		// 		"executionTime": "",
		// 		"dnaError": "",
		// 		"mesc": "",
		// 		"mescIterationCount":	"0",
		// 		"desc": "",
		// 		"isDNADone": false
		// 	}
		// 	return form;

		// case 'check-payment':
		// 	form = {
		// 		"jsessionid": '5D9C3780E685646CF9EEDAA249F30ED6.tomcat-9000', //in cookies
		// 		"orderNumber": this.orderNumber,
		// 		"originalPaymentMethod": "CREDIT_CARD",
		// 		"time":	1562932639223
		// 	}
	}
}