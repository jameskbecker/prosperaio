'use strict';
const electron = require('electron')
const { app, BrowserWindow, ipcMain, Menu } = electron;
const ipc = require('./ipc');
const isDev = require('electron-is-dev');
const { mainWindow, loginWindow, worker } = require('./windows');
const auth = require('./authentication')
const { menuTemplate } = require('../library/configuration');
const discord = require('./discord')



global.captchaWindows = [];

global.config = require("../config");
const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu)

app.once('ready', () => {
	
	const settings = require('electron-settings');
	mainWindow.create();
	
	if (!isDev) {
		if (!worker.window)	worker.create();
		worker.load();
		console.log('[MAIN] loading worker')
		ipc.init();
		discord.setPresence();
		return mainWindow.show();
	}
	else if (settings.has('userKey')) {
		auth.authenticate(settings.get('userKey'), (error) => {
			if (error) {
				loginWindow.create();
				loginWindow.show();
			}
			else {
				if (!worker.window)	worker.create();
				worker.load();
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
		auth.authenticate(args.key, (error) => {
			if (error) {
				loginWindow.window.webContents.send('authentication error', error);
			}
			else {
				settings.set('userKey', args.key);
				loginWindow.window.close();
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


