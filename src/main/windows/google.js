const electron = require('electron');
const { BrowserWindow, session } = electron;

function createWindow(accountName) {
	const googleWindow = new BrowserWindow({
		width: electron.screen.getPrimaryDisplay().workAreaSize.width / 2,
		height: electron.screen.getPrimaryDisplay().workAreaSize.height / 2,
		frame: true,
		show: false,
		webPreferences: {
			session: session.fromPartition(`persist: ${accountName}`),
			nodeIntegration: true
		}
	})
	module.exports.window = googleWindow;
}

function loadWindow() {
	const googleWindow = module.exports.window;
	googleWindow.loadURL('https://www.youtube.com/signin');
	googleWindow.show();
}

module.exports = {
	create: createWindow,
	load: loadWindow,
	window: null
}