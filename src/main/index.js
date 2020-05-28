'use strict';
const electron = require('electron')
const { app, BrowserWindow, ipcMain, Menu } = electron;
const ipc = require('./ipc');
const isDev = require('electron-is-dev');
const { MainWindow, LoginWindow, WorkerWindow } = require('./windows');
const auth = require('./authentication')
const { menuTemplate } = require('../library/configuration');
const discord = require('./discord')
const psList = require('ps-list');
const path = require('path')

global.captchaWindows = [];

global.config = require("../config");
if (!isDev) {
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu)
}

try {
	app.disableHardwareAcceleration();
} catch(e) {console.log(e)}
app.once('ready',async function() {

	const settings = require('electron-settings');
	MainWindow.create();
	console.log(path.resolve('..'))
	if (isDev) {
		if (!WorkerWindow.window)	WorkerWindow.create();
		await WorkerWindow.load();
		console.log('[MAIN] loading WorkerWindow')
		ipc.init();
		discord.setPresence();
		return MainWindow.show();
	}
	else if (settings.has('userKey')) {
		auth.authenticate(settings.get('userKey'), async (error) => {
			if (error) {
				LoginWindow.create();
				LoginWindow.show();
			}
			else {
				if (!WorkerWindow.window)	WorkerWindow.create();
				await WorkerWindow.load();
				console.log('loaded WorkerWindow')
				ipc.init();
				discord.setPresence();
				MainWindow.show();
			}
		})
	}
	else {
		LoginWindow.create();
		LoginWindow.show();
	}
	ipcMain.on('authenticate', async (event, args) => {
		auth.authenticate(args.key,async (error) => {
			if (error) {
				LoginWindow.window.webContents.send('authentication error', error);
			}
			else {
				settings.set('userKey', args.key);
				LoginWindow.window.close();
				if (!WorkerWindow.window)	WorkerWindow.create();
				await WorkerWindow.load();
				ipc.init();
				discord.setPresence();
				MainWindow.show();
			}
		})
	})
});

app.on("window-all-closed", function () {
	app.quit();
});




//setInterval(async () => {
//	try {
//		let x = (await psList()).filter(process => process.cmd.toLowerCase().includes('charles'));
//		if (x.length > 0) {
//			app.quit();
//		}
//	}
//	catch(error) {console.log(error)}
	
//}, 10000)