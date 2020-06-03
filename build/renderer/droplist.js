"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./elements");
var request_promise_native_1 = __importDefault(require("request-promise-native"));
function getProducts() {
    return new Promise(function (resolve) {
        var productApiStatus = document.getElementById('productApiStatus');
        productApiStatus.value = 'Fetching Products';
        request_promise_native_1.default({
            url: 'http://prosper-products-eu.herokuapp.com/supreme/latest',
            method: 'GET',
            json: true,
            resolveWithFullResponse: true,
            headers: {
                accept: 'application/json'
            }
        })
            .then(function (response) {
            var body = response.body;
            productApiStatus.value = 'Loaded Products';
            resolve(body);
        })
            .catch(function (error) {
            productApiStatus.value = 'Error Fetching Products';
            console.log(error);
            resolve({});
        });
    });
}
exports.default = getProducts;
//# sourceMappingURL=droplist.js.map