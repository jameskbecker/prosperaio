// exports.getCreditCardUrl = function() {
// 	this.request({
// 		url: `https://www.kickz.com/de/checkout/computeCreditCardRegistrationUrl/timestamp/${Date.now()}`,
// 		method: 'POST',
// 		jar: this.cookies,
// 		headers: {
// 			"Accept": "application/json, text/plain, */*",
// 			"Accept-Encoding": "gzip, deflate",
// 			"Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
// 			"Connection": "keep-alive",
// 			"Content-Type": "application/x-www-form-urlencoded",
// 			"Host": "www.kickz.com",
// 			"Origin": "https://www.kickz.com",
// 			"Referer": "https://www.kickz.com/de/checkout/paymentSummary",
// 			"User-Agent": this.userAgent
// 		},
// 		form: buildForm('payment-url')
// 	}, (error, response, body) => {
// 		if (error) {

// 		}
// 		else if (response.statusCode !== 200) {

// 		}
// 		else {
// 			let redirectUrl;
// 			try {
// 				body = JSON.parse(body);
// 				redirectUrl = body.redirectUrl
// 			} 
// 			catch(err) {}
			
// 			if (!redirectUrl) {

// 			}
// 			else {
// 				this.creditCardUrl = redirectUrl;
// 				resolve();
// 			}
// 		}
// 	})
// }

// exports.submitCard = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: this.creditCardUrl,
// 			method: 'POST',
// 			jar: this.cookies,
// 			headers: {
// 				"Accept": "application/json, text/plain, */*",
// 				"Accept-Encoding": "gzip, deflate",
// 				"Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
// 				"Connection": "keep-alive",
// 				"Content-Type": "application/x-www-form-urlencoded",
// 				"Host": "www.saferpay.com",
// 				"Origin": "https://www.kickz.com",
// 				"User-Agent": this.userAgent
// 			},
// 			form: buildForm('card')
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {

// 			}
// 			else {

// 			}
// 		})
// 	})
// }

//PLACE PAYMENT SUMMARY SUMBIT HERE