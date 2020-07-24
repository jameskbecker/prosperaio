import got, { 
    OptionsOfJSONResponseBody, 
    Got, 
    CancelableRequest, 
    Response 
} from 'got';
import { CookieJar } from 'tough-cookie';

interface KickzProps { [key: string]: () => CancelableRequest<Response<string>> | string; }
const baseUrl: string =  "www.kickz.com";
const cookieJar: CookieJar = new CookieJar();
const client: Got = got.extend({
    prefixUrl: baseUrl + '/de',
    http2: true,
    timeout: 30000,
    cookieJar
})


function getProductData(): CancelableRequest<Response<string>> {
    const options: OptionsOfJSONResponseBody = {
        headers: {},

    };
    return client.get(`/api/product/erp/${this.productId}`, options);
}

function addToCart(): CancelableRequest<Response<string>> {
    const options: OptionsOfJSONResponseBody = {
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Origin": this.baseUrl,
            "Referer": this._productUrl,
            "User-Agent": this.userAgent,   
            "X-Requested-With": "XMLHttpRequest",
        },
        form: {
            'productVariantIdAjax': this.variantId.toString(),
            'ttoken': this.cartToken
        }
    };

    return client.post(`/cart/ajaxAdd`, options);
}

function reserveCart(): CancelableRequest<Response<string>> {
    const options: OptionsOfJSONResponseBody = {
        headers: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
            "Referer": this.baseUrl + "/de/cart",
            "User-Agent": this.baseUrl,
            "X-Requested-With": "XMLHttpRequest"
        }
    }
    return client.get(`/checkout/reserveBasketItemsAjax/timestamp/${Date.now()}`, options)
}

function addressHint(): CancelableRequest<Response<string>> {
    const options: OptionsOfJSONResponseBody = {
        form: {
            'addressSupport.hintDeliveryAddressSelected': 'true',
            'addressSupport.hintInvoiceAddressSelected': 'true',
            'wizard.invoiceAddress.additionalAddressInfo': '',
            'wizard.invoiceAddress.city': '',
            'wizard.invoiceAddress.companyName': '',
            'wizard.invoiceAddress.countryIsoCode': 'de',
            'wizard.invoiceAddress.county': '',
            'wizard.invoiceAddress.doorCode': '',
            'wizard.invoiceAddress.email': '',
            'wizard.invoiceAddress.firstName': '',
            'wizard.invoiceAddress.houseNumber': '',
            'wizard.invoiceAddress.lastName': '',
            'wizard.invoiceAddress.phone': '',
            'wizard.invoiceAddress.salutationId': 'MR',
            'wizard.invoiceAddress.state': '',
            'wizard.invoiceAddress.street': 'Annaberger%20Strasse',
            'wizard.invoiceAddress.zip': '',
            'wizardOrder.differentDeliveryAddress': 'false'
        }
    };
    return client.post(`/checkout/addresses/method/addressHint`, options);
}

function paymentSummarySubmit(): CancelableRequest<Response<string>> {
    const options: OptionsOfJSONResponseBody = {
        form: {
            'cardTypeCode': '',
            'PaymentMethod': 'PAYPAL_DIRECT',
            'redirectUrl': '',
            'saveCcDataForNextCheckout': 'true'
        }
    };
    return client.post(`/checkout/paymentSummarySubmit`, options);
}

function paypalDirectSubmit(): CancelableRequest<Response<string>> {
    const options: OptionsOfJSONResponseBody = {
        form: {
            'DATA': '',
            'SIGNATURE': ''
        }
    };
    return client.post(`/checkout/paypalDirectSubmit`, options);

}

export const Kickz: KickzProps = {
    getProductData,
    addToCart,
    reserveCart,
    addressHint,
    paymentSummarySubmit,
    paypalDirectSubmit

}


// class Kickz extends Task {
//     productId: number;
//     variantId: number;
//     cartToken: string;
//     cookierJar: CookieJar
//     client: Got;
//     userAgent: string;

//     constructor(_taskData: any, _taskId: string) {
//         super(_taskData, _taskId);
//         this.client = got.extend({
//             prefixUrl: this.baseUrl + '/de',
//             http2: true,
//             cookieJar: this.cookierJar,
//         })
//     }

    
//}

//export default Kickz;