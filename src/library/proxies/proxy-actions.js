const settings = require('electron-settings');
const ProxyTester = require('./proxy-tester');

exports.run = function(options) {
	new ProxyTester(options.baseUrl, options.id, options.input)
}
