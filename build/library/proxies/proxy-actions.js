const settings = require('electron-settings');
const ProxyTester = require('./ProxyTester');
exports.run = function (options) {
    new ProxyTester(options.baseUrl, options.id, options.input);
};
//# sourceMappingURL=proxy-actions.js.map