"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./elements");
const request_promise_native_1 = __importDefault(require("request-promise-native"));
function getProducts() {
    return new Promise((resolve) => {
        let productApiStatus = document.getElementById('productApiStatus');
        productApiStatus.value = 'Fetching Products';
        request_promise_native_1.default({
            url: 'http://prosper-products-eu.herokuapp.com/supreme',
            method: 'GET',
            json: true,
            resolveWithFullResponse: true,
            headers: {
                accept: 'application/json'
            }
        })
            .then((response) => {
            let body = response.body;
            productApiStatus.value = 'Loaded Products';
            resolve(body);
        })
            .catch((error) => {
            productApiStatus.value = 'Error Fetching Products';
            console.log(error);
            resolve({});
        });
    });
}
exports.default = getProducts;
//# sourceMappingURL=droplist.js.map