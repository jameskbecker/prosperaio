const electron = require('electron');
const ipcWorker = electron.ipcRenderer;
const request = require('request');
const { utilities } = require('../other');
class ProxyTester {
    constructor(_baseUrl, _id, _input) {
        this.input = _input;
        this.baseUrl = _baseUrl;
        this.id = _id;
        this.status;
        this.ping;
        this.request = request;
        this.run();
    }
    run() {
        return new Promise((resolve, reject) => {
            this.setProxyStatus('Testing', 'orange');
            this.request({
                url: `https://${this.baseUrl}`,
                proxy: utilities.formatProxy(this.input),
                time: true,
                timeout: 2500
            }, (error, response, body) => {
                if (error) {
                    this.status = 'BAD';
                }
                else {
                    this.ping = response.elapsedTime;
                    this.status = `${response.statusCode} ${response.statusMessage} (${this.ping}ms)`;
                }
                let type = this.status[0] == '2' ? '#2ed347' : '#f44253';
                this.setProxyStatus(this.status, type);
            });
        });
    }
    setProxyStatus(message, type) {
        ipcWorker.send('proxyList.setStatus', {
            message: message,
            type: type,
            id: this.id
        });
    }
}
module.exports = ProxyTester;
//# sourceMappingURL=ProxyTester.js.map