import Task from '../Task';
import { CookieJar } from 'tough-cookie';
import got from 'got';


class FootlockerEu extends Task {
  cookieJar: CookieJar;
  sku: string;
  synchronizerToken: string;
  userAgent: string;

  constructor(_taskData: any, _id: string) {
    super(_taskData, _id);
    this.cookieJar = new CookieJar();
  }

  _getCartData(): void {
    let options:object = {
      method: 'GET',
      headers: {},
      responseType: 'text',
      cookieJar: this.cookieJar,
      timeout: 30000,
      http2: true,
      agent: {}
    }
  }

  _addToCart(): void {
    const cartParameters: URLSearchParams = new URLSearchParams([
      ["SynchronizerToken", this.synchronizerToken],
      ["Ajax", "true"],
      ["Relay42_Category", "Product Pages"],
      ["acctab-tabgroup-" + this.sku, "null"],
      ["Quantity_" + this.sku, "1"],
      ["SKU", this.sku]
    ])

    let options: object = {
      prefixUrl: this.baseUrl,
      method: 'GET',
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "user-agent": this.userAgent,
        "x-requested-with": "XMLHttpRequest",
        "origin": this.baseUrl,
        "sec-fetch-site": "same-origin",
        "sec- fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": this._productUrl,
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9"
      },
      responseType: 'json',
      cookieJar: this.cookieJar,
      searchParams: cartParameters,
      timeout: 30000,
      http2: true,
      agent: {

      }
    }

    got('/en/addtocart', options);
  }

  _checkout(): void {
    const form: any = {
      "SynchronizerToken": "",
      "billing_Title": "common.account.salutation.mr.text",
      "billing_FirstName": "",
      "billing_LastName": "",
      "billing_CountryCode": "DE",
      "billing_Address1":	"",
      "billing_Address2": "110",
      "billing_Address3": "",
      "billing_City": "Bonn",
      "billing_PostalCode":	"",
      "billing_PhoneHome": "",
      "billing_BirthdayRequired": "true",
      "billing_Birthday_Day": "",
      "billing_Birthday_Month": "",
      "billing_Birthday_Year": "",
      "email_Email": "",
      "billing_ShippingAddressSameAsBilling": "true",
      "isshippingaddress": "",
      "shipping_Title": "common.account.salutation.mr.text",
      "shipping_FirstName": "",
      "shipping_LastName": "",
      "SearchTerm": "",
      "shipping_CountryCode": "DE",
      "shipping_Address1": "",
      "shipping_Address2": "",
      "shipping_Address3": "",
      "shipping_City": "",
      "shipping_PostalCode": "",
      "shipping_PhoneHome": "",
      "shipping_AddressID": "",
      "CheckoutRegisterForm_Password": "",
      "promotionCode": "",
      "PaymentServiceSelection": "xtasFf0SpCsAAAFNI988qNaq",
      "UserDeviceTypeForPaymentRedirect":	"Desktop",
      "UserDeviceFingerprintForPaymentRedirect": "",
      "ShippingMethodUUID": "f9OsFf0L12YAAAFZVR_Ys82r",
      "GDPRDataComplianceRequired": "true"
    }

  }
}

export default FootlockerEu;