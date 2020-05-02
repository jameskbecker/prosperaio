const electron = require('electron');
const { BrowserWindow } = electron;
const isDev = require('electron-is-dev');

function createWindow() {
	const mainWindow = new BrowserWindow({
		backgroundColor: '#1a1919',
		width: 1250,
		height: 750,
		frame: false,
		resizable: true,
		show: false,
		webPreferences: {
			nodeIntegration: true
		}
	});
	mainWindow.loadURL(config.mainWindowPath);
	mainWindow.webContents.once('dom-ready', ()=> {
		module.exports.ready = true;
	})
	module.exports.window = mainWindow
}

function showWindow() {
	const mainWindow = module.exports.window;
	if (module.exports.ready === true) {
		mainWindow.show();
		if (isDev) mainWindow.webContents.openDevTools();
	}
	else {
		mainWindow.webContents.once('dom-ready', ()=> {
			mainWindow.show();
			if (isDev) mainWindow.webContents.openDevTools();
		})
	}
}

module.exports = {
	create: createWindow,
	show: showWindow,
	window: undefined,
	isReady: false
}