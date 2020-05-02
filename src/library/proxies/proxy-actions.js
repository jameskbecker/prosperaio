const settings = require('electron-settings');
const ProxyTest = require('./proxy-tester');

exports.run = function(options) {
	new ProxyTest(options.baseUrl, options.id, options.input)
}
