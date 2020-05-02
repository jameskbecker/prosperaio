const electron = require('electron');
const { BrowserWindow } = electron;
const isDev = require('electron-is-dev');
const config = require('../../config');

function createWindow() {
	const workerWindow = new BrowserWindow({
		show: false,
		webPreferences: {
			nodeIntegration: true
		}
	})
	module.exports.window = workerWindow;
}

function loadWindow() {
	const workerWindow = module.exports.window;
	workerWindow.loadURL(config.workerWindowPath);
	workerWindow.webContents.once('dom-ready', ()=> {
		if (isDev) {
			workerWindow.webContents.openDevTools({
				mode: 'detach'
			});
		}
	})
}

module.exports = {
	create: createWindow,
	load: loadWindow,
	window: null
}