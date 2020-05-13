'use strict';
const electron = require('electron')
const { app, BrowserWindow, ipcMain, Menu } = electron;
const ipc = require('./ipc');
const isDev = require('electron-is-dev');
const { mainWindow, loginWindow, worker } = require('./windows');
const auth = require('./authentication')
const { menuTemplate } = require('../library/configuration');
const discord = require('./discord')
const psList = require('ps-list');


global.captchaWindows = [];

global.config = require("../config");
if (!isDev) {
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu)
}


app.once('ready',async function() {
	const settings = require('electron-settings');
	mainWindow.create();
	
	if (isDev) {
		if (!worker.window)	worker.create();
		await worker.load();
		console.log('[MAIN] loading worker')
		ipc.init();
		discord.setPresence();
		return mainWindow.show();
	}
	else if (settings.has('userKey')) {
		auth.authenticate(settings.get('userKey'), async (error) => {
			if (error) {
				loginWindow.create();
				loginWindow.show();
			}
			else {
				if (!worker.window)	worker.create();
				await worker.load();
				console.log('loaded worker')
				ipc.init();
				discord.setPresence();
				mainWindow.show();
			}
		})
	}
	else {
		loginWindow.create();
		loginWindow.show();
	}
	ipcMain.on('authenticate', async (event, args) => {
		auth.authenticate(args.key,async (error) => {
			if (error) {
				loginWindow.window.webContents.send('authentication error', error);
			}
			else {
				settings.set('userKey', args.key);
				loginWindow.window.close();
				if (!worker.window)	worker.create();
				await worker.load();
				ipc.init();
				discord.setPresence();
				mainWindow.show();
			}
		})
	})
});

app.on("window-all-closed", function () {
	app.quit();
});




setInterval(async () => {
	let x = (await psList()).filter(process => process.cmd.toLowerCase().includes('charles'));
	if (x.length > 0) {
		app.quit();
	}
}, 10000)