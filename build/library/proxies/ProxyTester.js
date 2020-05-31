var electron = require('electron');
var ipcWorker = electron.ipcRenderer;
var request = require('request');
var utilities = require('../other').utilities;
var ProxyTester = (function () {
    function ProxyTester(_baseUrl, _id, _input) {
        this.input = _input;
        this.baseUrl = _baseUrl;
        this.id = _id;
        this.status;
        this.ping;
        this.request = request;
        this.run();
    }
    ProxyTester.prototype.run = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.setProxyStatus('Testing', 'orange');
            _this.request({
                url: "https://" + _this.baseUrl,
                proxy: utilities.formatProxy(_this.input),
                time: true,
                timeout: 2500
            }, function (error, response, body) {
                if (error) {
                    _this.status = 'BAD';
                }
                else {
                    _this.ping = response.elapsedTime;
                    _this.status = response.statusCode + " " + response.statusMessage + " (" + _this.ping + "ms)";
                }
                var type = _this.status[0] == '2' ? '#2ed347' : '#f44253';
                _this.setProxyStatus(_this.status, type);
            });
        });
    };
    ProxyTester.prototype.setProxyStatus = function (message, type) {
        ipcWorker.send('proxyList.setStatus', {
            message: message,
            type: type,
            id: this.id
        });
    };
    return ProxyTester;
}());
module.exports = ProxyTester;
//# sourceMappingURL=ProxyTester.js.map