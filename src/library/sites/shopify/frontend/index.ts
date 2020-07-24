import got, { Got, OptionsOfJSONResponseBody, CancelableRequest, Response } from 'got';
const defaultHeaders = {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate, br",
    "accept-Language": "en-GB,en;q=0.9,en-US;q=0.8,de;q=0.7",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
}


interface shopifyFrontendProps {
    add(productUrl: string): CancelableRequest<Response<string>>;
    //remove(): CancelableRequest<Response<string>>;
}

function createShopifyFrontend(): shopifyFrontendProps {
    const baseUrl: string = "https://www.kith.com";
    const client: Got = got.extend({
        prefixUrl: baseUrl
    })
    return {
        add(productUrl: string): CancelableRequest<Response<string>> {
            const options: OptionsOfJSONResponseBody = {
                headers: { ...defaultHeaders, Origin: baseUrl, Referer: productUrl },
                form: {

                }
            }
            return client.post('/cart/add.js', options);
        }
    
        // remove(): CancelableRequest<Response<string>> {
            
        // }
    }
}

export default createShopifyFrontend;