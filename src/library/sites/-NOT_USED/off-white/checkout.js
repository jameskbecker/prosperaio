const _ = require('underscore');
const settings = require('electron-settings');

exports.register = function() {
	let linkedProfile = settings.get('profiles.'+this.taskData.profie);
	return new Promise((resolve, reject) =>  {
		this.request({
			url: "https://www.off---white.com/en/DE/checkout/registration",
			method: "POST",
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
				"accept-encoding": "gzip",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
				"cache-control": "max-age=0",
				"content-type": "application/x-www-form-urlencoded",
				"origin": "https://www.off---white.com",
				"referer": "https://www.off---white.com/en/DE/checkout/registration",
				"upgrade-insecure-requests": "1",
				"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
			},
			form: {
				"utf8": "✓",
				"_method": "put",
				"authenticity_token": "",
				"order[email]": linkedProfile.email,
				"commit": "Continue"
			}
		}, (error, response, body) => {
			console.log(response.headers);
		})
	})
}

// submitAddress: {
// 	single: () => {
// 		return new Promise((resolve, reject) => {
// 			request({
// 				url: "",
// 				method: "POST",
// 				headers: {},
// 				form: {
// 					"utf8": "✓",
// 					"_method": "patch",
// 					"authenticity_token": "",
// 					"order[email]": "",
// 					"order[state_lock_version]": "",
// 					"order[bill_address_attributes][firstname]": "",
// 					"order[bill_address_attributes][lastname]": "",
// 					"order[bill_address_attributes][address1]": "",
// 					"order[bill_address_attributes][address2]": "",
// 					"order[bill_address_attributes][city]": "",
// 					"order[bill_address_attributes][country_id]": "",
// 					"order[bill_address_attributes][zipcode]": "",
// 					"order[bill_address_attributes][phone]": "",
// 					"order[bill_address_attributes][hs_fiscal_code]": "",
// 					"order[bill_address_attributes][id]": "",
// 					"order[use_billing]": "",
// 					"order[ship_address_attributes][id]": "",
// 					"order[terms_and_conditions]": "no",
// 					"order[terms_and_conditions]": "yes",
// 					"commit": "Save and Continue"
// 				}
// 			}, (error, response, body) => {
				
// 			})
// 		})
// 	},
// 	double: () => {
// 		return new Promise((resolve, reject) => {
// 			request({
// 				url: "https://www.off---white.com/en/DE/checkout/update/address",
// 				method: "POST",
// 				headers: {
// 					"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
// 					"accept-encoding": "gzip",
// 					"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
// 					"cache-control": "max-age=0",
// 					"content-type": "application/x-www-form-urlencoded",
// 					"origin": "https://www.off---white.com",
// 					"referer": "https://www.off---white.com/en/DE/checkout/update/address",
// 					"upgrade-insecure-requests": "1",
// 					"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
// 				},
// 				form: {
// 					"utf8": "✓",
// 					"_method": "patch",
// 					"authenticity_token": "",
// 					"order[email]": "",
// 					"order[state_lock_version]": "2",
// 					"order[bill_address_attributes][firstname]": "",
// 					"order[bill_address_attributes][lastname]": "",
// 					"order[bill_address_attributes][address1]": "",
// 					"order[bill_address_attributes][address2]": "" ,
// 					"order[bill_address_attributes][city]": "",
// 					"order[bill_address_attributes][country_id]": "",
// 					"order[bill_address_attributes][zipcode]": "",
// 					"order[bill_address_attributes][phone]": "",
// 					"order[bill_address_attributes][hs_fiscal_code]": "",
// 					"order[bill_address_attributes][id]": "",
// 					"order[ship_address_attributes][firstname]": "",
// 					"order[ship_address_attributes][lastname]": "",
// 					"order[ship_address_attributes][address1]": "",
// 					"order[ship_address_attributes][address2]": "",
// 					"order[ship_address_attributes][city]": "",
// 					"order[ship_address_attributes][country_id]": "",
// 					"order[ship_address_attributes][zipcode]": "",
// 					"order[ship_address_attributes][phone]": "",
// 					"order[ship_address_attributes][shipping]": "true",
// 					"order[ship_address_attributes][id]": "1077064",
// 					"order[terms_and_conditions]": "no",
// 					"order[terms_and_conditions]": "yes",
// 					"commit": "Save and Continue"
// 				}
// 			})
// 		})	
// 	}
// },

// submitDelivery: () => {
// 	return new Promise((resolve, reject) => {
// 		request({
// 			url: "https://www.off---white.com/en/DE/checkout/update/delivery",
// 			method: "POST",
// 			headers: {
// 				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
// 				"accept-encoding": "gzip",
// 				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
// 				"cache-control": "max-age=0",
// 				"content-type": "application/x-www-form-urlencoded",
// 				"origin": "https://www.off---white.com",
// 				"referer": "https://www.off---white.com/en/DE/checkout/delivery",
// 				"upgrade-insecure-requests": "1",
// 				"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
// 			},
// 			form: {
// 				"utf8": "✓",
// 				"_method": "patch",
// 				"authenticity_token": "",
// 				"order[state_lock_version]": "3",
// 				"order[shipments_attributes][0][selected_shipping_rate_id]": "501882",
// 				"order[shipments_attributes][0][id]": "376584",
// 				"commit": "Save and Continue"
// 			}
// 		}, (error, resolve, body) => {

// 		})
// 	})
// },

// submitPayment: {
// 	creditCard: () => {
// 		return new Promise((resolve, reject) =>  {
// 			request({
// 				url: "https://ecomm.sella.it/Pagam/hiddenIframe.aspx",
// 				method: "POST",
// 				headers: {
// 					"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
// 					"Accept-Encoding": "gzip",
// 					"Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
// 					"Cache-Control": "max-age=0",
// 					"Connection": "keep-alive",
// 					"Content-Type": "application/x-www-form-urlencoded",
// 					"Host": "ecomm.sella.it",
// 					"Origin": "https://ecomm.sella.it",
// 					"Referer": "https://ecomm.sella.it/Pagam/hiddenIframe.aspx?a=9091712&b=hucUrAG60Xg03z98V9WWCjc8hXeANwbwuUpbds9wJ91djEkUpA9JIXO14zgBs1d1*78hAZW1n6GZnRrUQBoyeYmKkqxJu*IuhEo39RHMh53gibUC1gaIiNeKA26rq9aUuVYY4Q9GyAQOiRAxYBRt6QXkSRXd2lhcFdgr4Yb8p6CnMKf6x9J35C*8inJqwNgtPm8pvJyEprDooSzGLGch973tmbmX_fdIo4fFouTI6M2JCMUlXa88woAJp7ui6ZBePVqz5VS6rtLlTmpKSRdtFdNn6JVwru8o19wzwe1WQEQR64LLU5NOCFJt7jKwSgTMCj8JXKnaZZACceciIzkLG6LD8bms59HQLmj**dXJHDUi5_AwbouLOCQnN0oSLg_2ILZQ9BwmGNFVqgWyuuN6i8o9JN2ZmoelVagDZmEbGo1sqDWKw8T7gTwqlTzS_AWv9j7bVRMdqsYxvnkt0fLjviw6m_41W3Nbv955d0XMvdRnymdAnLMum1hiiUm7i6Q9mzkBh*flsk7_Xa9JWdxmHU1iMcV5QsNJrKHUT3BXWfWROY4p68S3YSdkFLEiIkcLrHu3Zmz0cUyeJZ2SYPpzxh_rj5bYEsFuEiIKCiku6b3zY8xMteID9XLfMPhV0XeJSJimJRjUtycGRrjp517Cyah89z8f00jlmuOu3i0EPEY&MerchantUrl=https://www.off---white.com/en/DE/checkout/payment",
// 					"Upgrade-Insecure-Requests": "1",
// 					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
// 				},
// 				form: {
// 					"__VIEWSTATE": "/wEPDwULLTE0NjI5MDIyMzRkZCu3ckWIJcqVoJxu+J8Yb7ubBzDlvfL4kujteKZzxJce",
// 					"__VIEWSTATEGENERATOR": "03A20F8C",
// 					"__EVENTVALIDATION": "/wEdAAsd0QBNIwGwioMYKL5PCT1kBbf2+V2duhYEVZVnhJ9g5aXGNAgZD1YrF+iGSzBuRlqUPkQScl/6Wkde4uG5Ut28SQxxNmg847cr4ZkoQe0Tk/p6XPaUiLE+3NOiUuFX/JqwnxCKJlxAHJ4nJ1PeDbNzXSJqCk8wAw1eDuKBgIrEzZmBJY4E3kxdOJyWkbGGRRJdAB/FCtFI3lEMYfwjcuI1+89L7O27P8hOpD20HhVnCUhrXZ40eD/pAKN2ZMmC0eDlbUISpWhQ5EOsL3HCoSfY",
// 					"cardnumber": "",
// 					"cardExpiryMonth": "04",
// 					"cardExpiryYear": ""/*2digits*/,
// 					"cvv": "",
// 					"buyerName": "undefined",
// 					"buyerEMail": "undefined",
// 					"inputString": "hucUrAG60Xg03z98V9WWCjc8hXeANwbwuUpbds9wJ91djEkUpA9JIXO14zgBs1d1*78hAZW1n6GZnRrUQBoyeYmKkqxJu*IuhEo39RHMh53gibUC1gaIiNeKA26rq9aUuVYY4Q9GyAQOiRAxYBRt6QXkSRXd2lhcFdgr4Yb8p6CnMKf6x9J35C*8inJqwNgtPm8pvJyEprDooSzGLGch973tmbmX_fdIo4fFouTI6M2JCMUlXa88woAJp7ui6ZBePVqz5VS6rtLlTmpKSRdtFdNn6JVwru8o19wzwe1WQEQR64LLU5NOCFJt7jKwSgTMCj8JXKnaZZACceciIzkLG6LD8bms59HQLmj**dXJHDUi5_AwbouLOCQnN0oSLg_2ILZQ9BwmGNFVqgWyuuN6i8o9JN2ZmoelVagDZmEbGo1sqDWKw8T7gTwqlTzS_AWv9j7bVRMdqsYxvnkt0fLjviw6m_41W3Nbv955d0XMvdRnymdAnLMum1hiiUm7i6Q9mzkBh*flsk7_Xa9JWdxmHU1iMcV5QsNJrKHUT3BXWfWROY4p68S3YSdkFLEiIkcLrHu3Zmz0cUyeJZ2SYPpzxh_rj5bYEsFuEiIKCiku6b3zY8xMteID9XLfMPhV0XeJSJimJRjUtycGRrjp517Cyah89z8f00jlmuOu3i0EPEY",
// 					"pares": "",
// 					"logPostData": "",
// 					"shopLogin": "",
// 				},
// 				qs: {
// 					"a": "9091712",
// 					"b": "hucUrAG60Xg03z98V9WWCjc8hXeANwbwuUpbds9wJ91djEkUpA9JIXO14zgBs1d1*78hAZW1n6GZnRrUQBoyeYmKkqxJu*IuhEo39RHMh53gibUC1gaIiNeKA26rq9aUuVYY4Q9GyAQOiRAxYBRt6QXkSRXd2lhcFdgr4Yb8p6CnMKf6x9J35C*8inJqwNgtPm8pvJyEprDooSzGLGch973tmbmX_fdIo4fFouTI6M2JCMUlXa88woAJp7ui6ZBePVqz5VS6rtLlTmpKSRdtFdNn6JVwru8o19wzwe1WQEQR64LLU5NOCFJt7jKwSgTMCj8JXKnaZZACceciIzkLG6LD8bms59HQLmj**dXJHDUi5_AwbouLOCQnN0oSLg_2ILZQ9BwmGNFVqgWyuuN6i8o9JN2ZmoelVagDZmEbGo1sqDWKw8T7gTwqlTzS_AWv9j7bVRMdqsYxvnkt0fLjviw6m_41W3Nbv955d0XMvdRnymdAnLMum1hiiUm7i6Q9mzkBh*flsk7_Xa9JWdxmHU1iMcV5QsNJrKHUT3BXWfWROY4p68S3YSdkFLEiIkcLrHu3Zmz0cUyeJZ2SYPpzxh_rj5bYEsFuEiIKCiku6b3zY8xMteID9XLfMPhV0XeJSJimJRjUtycGRrjp517Cyah89z8f00jlmuOu3i0EPEY",
// 					"MerchantUrl": "https://www.off---white.com/en/DE/checkout/payment"
// 				}
// 			}, (error, response, body) => {

// 			})
// 		})
// 	}
// },

// processOrder: () => {
// 	return new Promise((resolve, reject) => {
// 		request({
// 			url: "https://www.off---white.com/checkout/payment/process_token.json",
// 			method: "POST",
// 			headers: {
// 				"accept": "application/json, text/javascript, */*; q=0.01",
// 				"accept-encoding": "gzip",
// 				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
// 				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
// 				"origin": "https://www.off---white.com",
// 				"referer": "https://www.off---white.com/en/DE/checkout/payment",
// 				"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
// 				"x-newrelic-id": "UwAFU1RXGwYGXFZRAQE=",
// 				"x-requested-with": "XMLHttpRequest"
// 			},
// 			form: {
// 				"token": ""
// 			}
// 		}, (error, response, body) => {
			
// 		})
// 	})
// }
