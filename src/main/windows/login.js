const electron = require('electron');
const { BrowserWindow } = electron;
const isDev = require('electron-is-dev');

function createWindow() {
	const loginWindow = new BrowserWindow({
		backgroundColor: '#1a1919',
		width: electron.screen.getPrimaryDisplay().workAreaSize.width * 0.5,
		height: electron.screen.getPrimaryDisplay().workAreaSize.height / 2	,
		frame: false,
		resizable: false
	})
	module.exports.window = loginWindow;
}

function showWindow() {
	const loginWindow = module.exports.window;
	loginWindow.loadURL(config.loginWindowPath);
	loginWindow.webContents.once('dom-ready', ()=> {
		loginWindow.show();
		if (isDev) loginWindow.webContents.openDevTools();
	})
}

module.exports = {
	create: createWindow,
	show: showWindow,
	window: undefined
}