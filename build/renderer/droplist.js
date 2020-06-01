"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./elements");
var request = require("request-promise-native");
function getProducts() {
    return new Promise(function (resolve) {
        var productApiStatus = document.getElementById('productApiStatus');
        productApiStatus.value = "Fetching Products";
        request({
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
            productApiStatus.value = "Loaded Products";
            resolve(body);
        })
            .catch(function (error) {
            productApiStatus.value = "Error Fetching Products";
            console.log(error);
            resolve({});
        });
    });
}
exports.default = getProducts;
//# sourceMappingURL=droplist.js.map