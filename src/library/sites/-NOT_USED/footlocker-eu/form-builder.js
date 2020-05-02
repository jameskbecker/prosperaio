module.exports = function(type) {
	switch(type) {
		case 'billing':
			let form = {
				"isshippingaddress":	"",
				"billing_Title":	"common.account.salutation.mr.text"
				"billing_FirstName":	"James"
				"billing_LastName":	"Becker"
				"billing_CountryCode":	"DE"
				"billing_Address1":	"Joseph Roth Strasse"
				"billing_Address2":	"110"
				"billing_Address3": ""
				"billing_City":	"Bonn"
				"billing_PostalCode":	"53175"
				"billing_PhoneHome":	"015903762209"
				"billing_BirthdayRequired":	true
				"billing_Birthday_Day":	21
				"billing_Birthday_Month":	10
				"billing_Birthday_Year":	2000
				"email_Email":	jamesbecker16@icloud.com
				"billing_ShippingAddressSameAsBilling":	true
				"isshippingaddress": ""
				"shipping_Title":	common.account.salutation.mr.text
				"shipping_FirstName":	
				"shipping_LastName"	:
				"SearchTerm"	:
				"shipping_CountryCode"	DE	
				"shipping_Address1"	
				"shipping_Address2"	
				"shipping_Address3"	
				"shipping_City"	
				"shipping_PostalCode"	
				"shipping_PhoneHome"	
				"shipping_AddressID"	"2jasFf0XuPQAAAFsvyYqxkgK"
				"CheckoutRegisterForm_Password"	
				"promotionCode"	
				"PaymentServiceSelection"	"xtasFf0SpCsAAAFNI988qNaq"
				"UserDeviceTypeForPaymentRedirect"	Desktop
				"UserDeviceFingerprintForPaymentRedirect"	0400bpNfiPCR/AUNf94lis1zttgKW9F/EYYbnrp/XmcfWoVVgr+Rt2dAZANC2gidTEoy7SXQPURgIZWYWeZUeZZ+RlWCv5G3Z0BkoP8dO8z8DmlOsI6LaK3P5JPGHKmyGnb3zlLMxlLYswFtRCaleKgjKKq+ovm69KJe9mn4R/CPX4KaH9/XqQ5h97EfVk9EjAzqePD+6MDJh1sYpm3kktOFO+ixLXGBICA18sQyiQagYnGC7XLTgcuc7M6mhllQ7/XHYDvethm0ixXKgDzSlcJpdpKo5QZl/nXR0LVQmADUFBkOLxHrBU1X2vqqjESqbaBDvX9j17x6IHjtxpPWlswtar6Az9pGMaEcSNfOTvsgtn95SxDtE2suujWRMoizXj3piSkiHcDvTuWbZ7blJBujU1tlk/8IOJ9aAnejZeJoxuFMyPpjzYuuV+VhT2JQxvTdTn3ScfrBfYTI39pidBcrICrIVljJcY0LDJoN6tosZC78QG9QoMi9Z9GPh19UQXiRztLykrtBfy2Oh9ltHZfQIpE4yrBZqHW2jHg6QNlLWqnjrnPtr/w0jt3pZ/WuuaUQogaK3VDujNmjYmLrUKTmt2IexFSsDpBLY0K4Pgeu78O5LqBNk4kdSilCz8QbOZkvlLJCJSQ8k4zDYcrDIukhlNs71gNppFEP/pr71oD561pNBqLw/NJvb0y/4wtP4BZZxH7SQMzNTdKEKJ5sETroggSVcPSEQy29CXaiWs2BQ0+bhOndAlvYPaTuTY5r0H4ERw6NL2GAwt8apG44isAWX3Sw7PtSQtUR3qs+07R991PDrfdFzwid0aNZgt0aiaqvvIWQkhxgVBkG8+OF4jH/3mPdoTUpq/pNvBLLD2l+arMvqcYRdyiN2RKePA1UZdKAZDwic+y5/r+SkyAbziDM7k8xAXTS4l7D1erHMnjL6rjoI7fnfZGq1WY92TPgDgLJkTvlqBdC12PmY1XpDGBtyWF8hRwW7Jsss29L0sFkQPnkjHloApNDPJIEFaG7TsuZ7u6UZrLMXNZ90c4daMxzNcOazUYYzBb5UsHozl+XYShmK7Ltd63OEQm68rvRvAGk8iwAA2SOP/bks9BccdZ3wJKrOMrrAKe7ZReVZOQwdJnQIw86VipKNP+BthXHUeYXbncxx3eMAl59WmG5WcEPoFzUCRThR6Rd4jM8QNlFf1olNgx2dFbKxn6mAJ3ZTHu2lRwsSzEWkEb1gw2Oo7OBFUoizwIC00fVFFAN6Q1x80UdCdGdyqwwbekDud5uWuFSNOZcrdb3mKRzbr+7IIVjhHoqCGUZ5gtFvqHIUM4s+37WSQmisMpsUtcH5mc6Z6PNaYzBrdiYuJmj9gZiTLzdrwXojk4bF91PgyVjmWuUjUZUHnDNISDnKbKBQsQRflmaYptObt5FJPQyXmEW1X3d0GGkDLmFaqWGSDG+zNqC2yf61PhTxBtcA0D+nqbYMO6nb6WwOUgw6DGwwQ860TfrZX1VUz0bx0RZQLInI5v8/pHzCOtBMmfMAMq73kF531bptwsEOFHyJcQS05Nhg2QHxwv2xMYbWjH7wkmmn8Vn/Me5Arq5zIBBYihfOi4n1nFm1XNRzIjQ6jCsgDSKoqdx6t/lpBvgmvtOs3zOGbKg3eRWshuDyd0VRAtxJqGw60FGg38yPBcVVWEuPuJ/+tnnEuhP/8VoPf6sdyVaPwPlc0jWEbeWlBxMl5rGYnLLvGADYLDUdDWM119wPpPV0ZSMv/bxqvqZydrPOqLVfRrFr6nhAxfc1fF7o3ZVVCQKguk3WZxTF+yy9+wQ1sU3X3Lzt5YstdZ3m/rUyN/aYnQXKyAqyFZYyXGNCwyaDeraLGQu/EBvUKDIvWfRj4dfVEF4kc7S8pK7QX8t
				"ShippingMethodUUID"	xeCsFf0LZ8IAAAFfi719gTQJ
				"termsAndConditions"	on
				"GDPRDataComplianceRequired"	true
				"""""""""""sendOrder	"""""""""""
			}
			return form;
	}
}