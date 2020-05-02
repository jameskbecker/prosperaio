const electron = require('electron');
const { BrowserWindow } = electron;
const isDev = require('electron-is-dev');

function createWindow(taskId) {
	const threeDSWindow = new BrowserWindow({
		width: 450,
		height: 555,
		frame: false,
		show: false,
		alwaysOnTop: true
	})
	global['CARDINAL_SOLVERS'][taskId] = threeDSWindow;
}

function loadWindow(id, callback) {
	const window = global['CARDINAL_SOLVERS'][id];
	window.loadFile(config.threeDSWindowPath);
	window.webContents.once('dom-ready', function() {
		if (!isDev) {
			window.webContents.openDevTools();
		}
		window.show();
		callback();
})
	
}

module.exports = {
	create: createWindow,
	load: loadWindow,
	window: null
}