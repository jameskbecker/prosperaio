const { BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');

const defaultProperties = {
	"backgroundColor": '#1a1919',
	 "frame": false,
	 "show": false,
	 "resizable": true,
	 "webPreferences": {
		 nodeIntegration: true
	 }
}


class BotWindow extends BrowserWindow {
	constructor(path:string, properties?:any) {
		super({...defaultProperties, ...properties});

		this.loadURL(path);
		this.once('ready-to-show', () => {
			if (isDev) this.webContents.openDevTools({mode: "detach"});
			this.show();
		})
	}
}
export { BotWindow as default }

// function createWindow() {
// 	const mainWindow = new BrowserWindow({
// 		backgroundColor: '#1a1919',
// 		width: 1250,
// 		height: 750,
// 		frame: false,
// 		resizable: true,
// 		show: false,
// 		webPreferences: {
// 			nodeIntegration: true
// 		}
// 	});
// 	mainWindow.loadURL(config.mainWindowPath);
// 	mainWindow.webContents.once('dom-ready', ()=> {
// 		module.exports.ready = true;
// 	})
// 	module.exports.window = mainWindow
// }

// function showWindow() {
// 	const mainWindow = module.exports.window;
// 	if (module.exports.ready === true) {
// 		mainWindow.show();
// 		if (isDev) mainWindow.webContents.openDevTools();
// 	}
// 	else {
// 		mainWindow.webContents.once('dom-ready', ()=> {
// 			mainWindow.show();
// 			if (isDev) mainWindow.webContents.openDevTools();
// 		})
// 	}
// }

// module.exports = {
// 	create: createWindow,
// 	show: showWindow,
// 	window: undefined,
// 	isReady: false
// }