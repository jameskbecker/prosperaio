const decodeJWT = require('jwt-decode');
const builder = require('./builder');
const { logger } = require('../../other');

// exports.submitInitJWT = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: 'https://centinelapi.cardinalcommerce.com/V1/Order/JWT/Init',
// 			method: 'POST',
// 			jar: this.cookieJar,
// 			headers: {
// 				"Accept": "*/*",
//     		"Content-Type": "application/json;charset=UTF-8",
//     		"Host": "centinelapi.cardinalcommerce.com",
// 				"x-cardinal-tid": `Tid-${this.cardinalTid}`
// 			},
// 			body: JSON.stringify(builder.bind(this)('cardinal-init-jwt'))
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {
// 				console.log(response.statusCode);
// 				error = new Error();
// 				error.code = 'UNEXPECTED'
// 				reject(error);
// 			}
// 			else {
// 				this.cardinalClientJWT = JSON.parse(body).CardinalJWT;
// 				let responseData = decodeJWT(body);
// 				console.log(responseData)
// 				this.cardinalId = responseData.ConsumerSessionId;
// 				logger.info(`Cardinal ID:\n${this.cardinalId}`);
// 				this.DeviceFingerprintingURL = responseData.Payload.DeviceFingerprintingURL;
// 				logger.info(`Device Fingerprinting URL:\n${this.DeviceFingerprintingURL}`);
// 				resolve();
// 			}
// 		})
// 	})
// }

//open cardinal consumer authentication
// exports.openCCA = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: 'https://centinelapi.cardinalcommerce.com/V1/Order/JWT/Continue',
// 			method: 'POST',
// 			jar: this.cookieJar,
// 			headers: {
// 				"Accept": "*/*",
//     		"Content-Type": "application/json;charset=UTF-8",
//     		"Host": "centinelapi.cardinalcommerce.com",
// 				"x-cardinal-tid": `Tid-${this.cardinalTid}`,
// 			},
// 			body: JSON.stringify(builder.bind(this)('cardinal-cca'))
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {
// 				console.log(response.statusCode);
// 				error = new Error();
// 				error.code = 'UNEXPECTED'
// 				reject(error);
// 			}
// 			else {
// 				//console.log(this.cardinalServerJWT)
// 				//this.cardinalServerJWT = JSON.parse(body).CardinalJWT;
// 				//let responseData = decodeJWT(this.cardinalServerJWT);
// 				console.log(body)
// 				resolve();
// 			}
// 		})
// 	})
// }

// exports.requestAuth = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: this.authUrl,
// 			method: 'POST',
// 			jar: this.cookieJar,
// 			headers: {
// 				"Accept":	"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
// 				"Accept-Encoding":	"gzip, deflate, br",
// 				"Accept-Language":	"en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
// 				"Cache-Control":	"max-age=0",
// 				"Connection":	"keep-alive",
// 				"Content-Type":	"application/x-www-form-urlencoded",
// 				//"Host":	"verifiedbyvisa.comdirect.de",
// 				"Origin":	"https://www.supremenewyork.com",
// 				"Sec-Fetch-Site":	"cross-site",
// 				"Sec-Fetch-Mode":	"nested-navigate",
// 				"Upgrade-Insecure-Requests":	"1",
// 				"User-Agent":	this.userAgent
// 			},
// 			form: builder.bind(this)('cardinal-payer-authentication')
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {
// 				switch (response.statusCode) {
// 					case 302:
// 						console.log(this.authUrl + response.headers.location);
// 						console.log(response.headers);
// 						this.authPath = response.headers.location;
// 						this.needsManualAuth = true;
// 						resolve();
// 						break;
// 					default:
// 						console.log(response.statusCode);
// 						error = new Error();
// 						error.code = 'UNEXPECTED'
// 						reject(error);
// 				}
				
// 			}
// 			else {
// 				//console.log(body);
// 				let transToken = body.match(/(?<=config\.transaction = \{\n\s*?token: ")\w*?(?=")/gm);
// 				let pollUrl = body.match(/(?<=config\.pollUrl = ")\S*?(?=";)/gm);
// 				let confirmationUrl = body.match(/(?<=config.macsConfirmUrl = ")\S*?(?=";)/gm);
// 				if (transToken.length > 0) {
// 					logger.verbose(`Transaction Token:\n${transToken[0]}`);
// 					this.transactionToken = transToken[0];
// 				}
// 				if (pollUrl.length > 0) {
// 					logger.verbose(`Poll Url:\n${pollUrl[0]}`);
// 					this.authPollUrl = pollUrl[0];
// 				}

// 				if (confirmationUrl.length > 0) {
// 					logger.verbose(`Confirmation Url:\n${confirmationUrl[0]}`);
// 					this.confirmationUrl = confirmationUrl[0];
// 				}
// 				resolve();
// 			}
// 		})
// 	})
// }

// exports.fetchAuthHtml = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: this.authUrl + this.authPath,
// 			method: 'GET',
// 			jar: this.cookieJar,
// 			headers: {
// 				"Accept":	"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
// 				"Accept-Encoding":	"gzip, deflate, br",
// 				"Accept-Language":	"en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
// 				"Host":	"verifiedbyvisa.comdirect.de",
// 				"Connection":	"keep-alive",
// 				"User-Agent":	this.userAgent
// 			}
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {
// 				console.log(response.statusCode);
// 				error = new Error();
// 				error.code = 'UNEXPECTED'
// 				reject(error);
// 			}
// 			else {
// 				console.log(body);
// 			}
// 		})
// 	})
// }

// exports.pollAuthStatus = function() {
// 	return new Promise((resolve, reject) => {
// 		function poll() {
// 			console.log(builder.bind(this)('poll-payment'))
// 			this.request({
// 				url: this.authPollUrl,
// 				method: 'POST',
// 				jar: this.cookieJar,
// 				headers: {
// 					"accept": "*/*",
// 					"access-control-request-headers": "content-type",
// 					"access-control-request-method": "POST",
// 					"user-agent": this.userAgent,
// 					"sec-fetch-site": "same-site",
// 					"sec-fetch-mode": "cors",
// 					"accept-encoding": "gzip, deflate, br",
// 					"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
// 					"origin": "https://idcheck.acs.touchtechpayments.com",
// 					"referer":	"https://idcheck.acs.touchtechpayments.com/v1/payerAuthentication"
// 				},
// 				body: JSON.stringify(builder.bind(this)('poll-payment'))
// 			}, (error, response, body) => {
// 				if (error) {
// 					reject(error);
// 				}
// 				else if (response.statusCode !== 200) {
// 					console.log(response.statusCode);
// 					error = new Error();
// 					error.code = 'UNEXPECTED'
// 					reject(error);
// 				}
// 				else {
// 					logger.info(`3DS Poll Response:\n${body}`);
// 					body = JSON.parse(body)
// 					if (body.hasOwnProperty('status')) {
// 						switch(body.status) {
// 							case 'pending':
// 								this.setStatus('Pending Authentication.', 'WARNING');
// 								logger.warn('Waiting for User to Authenticate Payment.');
// 								return setTimeout(poll.bind(this), 500);

// 							case 'success':
// 								this.setStatus('Authenticated.', 'SUCCESS');
// 								logger.debug('Payment Authenticated.');
// 								this.paymentAuthToken = body.authToken;
// 								return resolve();

// 							case 'failure':
// 								this.setStatus('Failed Authentication.', 'ERROR');
// 								return;

// 							case 'blocked':
// 								this.setStatus('Card Frozen/Blocked.', 'ERROR');
// 								return;

// 							case 'expired':
// 								this.setStatus('Session Expired.', 'ERROR');
// 								return;
// 						}
// 					}
// 					//resolve();
// 				}
// 			})
// 		}
// 		poll.bind(this)();
// 	})
// }

// exports.confirmTransaction = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: this.confirmationUrl,
// 			method: 'POST',
// 			jar: this.cookieJar,
// 			headers: {
// 				//origin: https://idcheck.acs.touchtechpayments.com
// 				"user-agent": this.userAgent,
// 				"content-type": "application/json",
// 				"accept": "*/*",
// 				// sec-fetch-site: same-site
// 				// sec-fetch-mode: cors
// 				//referer: https://idcheck.acs.touchtechpayments.com/v1/payerAuthentication
// 				"accept-encoding": "gzip, deflate",
// 				"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7"
// 			},
// 			body: JSON.stringify(builder.bind(this)('confirm-transaction'))
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {
// 				console.log(response.statusCode);
// 				error = new Error();
// 				error.code = 'UNEXPECTED'
// 				reject(error);
// 			}
// 			else {
// 				console.log(body);
// 				body = JSON.parse(body);
// 				this.cardinalResponsePayload = body.Response;
// 				resolve()
// 			}
// 		})
// 	})
// }

//close cardinal consumer authentication
// exports.closeCCA = function() {
// 	return new Promise((resolve, reject) => {
// 		console.log(builder.bind(this)('close-cca'))
// 		this.request({
// 			url: 'https://centinelapi.cardinalcommerce.com/V1/TermURL/Overlay/CCA',
// 			method: 'POST',
// 			jar: this.cookieJar,
// 			headers: {
// 				"cache-control": "max-age=0",
// 				"origin": "https://idcheck.acs.touchtechpayments.com",
// 				"upgrade-insecure-requests": "1",
// 				"content-type": "application/x-www-form-urlencoded",
// 				"user-agent": this.userAgent,
// 				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
// 				"sec-fetch-site": "cross-site",
// 				"sec-fetch-mode": "nested-navigate",
// 				"referer": "https://idcheck.acs.touchtechpayments.com/v1/payerAuthentication",
// 				"accept-encoding": "gzip, deflate, br",
// 				"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7"
// 			},
// 			form: builder.bind(this)('close-cca')
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {
// 				console.log(response.statusCode);
// 			}
// 			else {
// 				console.log(body);
// 				resolve();
// 			}
// 		})
// 	})
// }

// exports.renderFingerprintData = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: 'https://geo.cardinalcommerce.com/DeviceFingerprintWeb/V2/Browser/Render',
// 			method: 'GET',
// 			headers: {
// 				"accept":	"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
// 				"accept-encoding":	"gzip, deflate",
// 				"accept-language":	"en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
// 				"referer":	`https://${www.supremenewyork.com}/mobile`,
// 				"sec-fetch-site":	"cross-site",
// 				"sec-fetch-mode":	"nested-navigate",
// 				"upgrade-insecure-requests":	1,
// 				"user-agent":	this.userAgent
// 			},
// 			qs: builder.bind(this)('cardinal-render-fingerprint')
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {
// 				console.log(response.statusCode);
// 				error = new Error();
// 				error.code = 'UNEXPECTED'
// 				reject(error);
// 			}
// 			else {

// 			}
// 		})
// 	})
// }

// exports.saveFingerprintData = function() {
// 	return new Promise((resolve, reject) => {
// 		this.request({
// 			url: 'https://geo.cardinalcommerce.com/DeviceFingerprintWeb/V2/Browser/SaveBrowserData',
// 			method: 'POST',
// 			headers: {
// 				"accept":	"*/*",
// 				"accept-encoding":	"gzip, deflate",
// 				"accept-language":	"en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
// 				"content-type":	"application/json",
// 				"origin":	"https://geo.cardinalcommerce.com",
// 				"sec-fetch-site":	"same-origin",
// 				"sec-fetch-mode":	"cors",
// 				"referer":	this.DeviceFingerprintingURL,
// 				"user-agent":	this.userAgent,
// 				"x-requested-with":	"XMLHttpRequest",
// 			},
// 			body: JSON.stringify(builder.bind(this)('cardinal-save-fingerprint'))
// 		}, (error, response, body) => {
// 			if (error) {
// 				reject(error);
// 			}
// 			else if (response.statusCode !== 200) {
// 				switch (response.statusCode) {
// 					default:
// 						console.log(response.statusCode);
// 				}
// 			}
// 			else {
// 				console.log(response.headers)
// 				resolve();
// 			}
// 		})
// 	})
// }