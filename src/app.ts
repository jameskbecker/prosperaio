import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { Main } from './Main';
import isDev from 'electron-is-dev';

Main.main(app, BrowserWindow, isDev);






















//'use strict';
//declare function require(path: string);
//import { BotWindow } from './src/main/windows';

//import {default as ipc} from './ipc';
//const { LoginWindow, WorkerWindow } = require('./windows')
//import {  default as menuTemplate } from '../library/configuration/menu-template';
// import * as auth from './authentication';
// import * as discord from './discord';
// import * as config from './config';

// import * as psList from 'ps-list';
// import * as path from 'path';
// import * as settings from 'electron-settings';

// if (isDev) {
// 	require('electron-reload')(path.join(__dirname, '..'), {
// 		electron: require('electron')
// 	});
// }
// function main():void {
	


	
	

// 	if (isDev) {
// 		// require('electron-reload')(path.join(__dirname, '..'), {
// 		// 	electron: require('electron')
// 		// });

// 		console.log('[MAIN] loading Worker  Window')
// 		if (!workerWindow) {
// 			workerWindow = new BrowserWindow(workerWindowProps);
// 			workerWindow.loadURL(config.workerWindowPath);
// 		}

		
// 		mainWindow = new BrowserWindow(mainWindowProps);
// 		mainWindow.loadURL(config.mainWindowPath);
// 		mainWindow.once('ready-to-show', () => {
// 			if (isDev) mainWindow.webContents.openDevTools({mode: "detach"});
// 			mainWindow.show();
// 		})
		
// 		ipc.init();
// 		//discord.setPresence();
// 		return;
// 	}
// 	else if (settings.has('userKey')) {
// 		auth.authenticate(settings.get('userKey'), async (error) => {
// 			if (error) {
					
// 				//LoginWindow.show();
// 			}
// 			else {
// 				//if (!WorkerWindow.window)	WorkerWindow.create();
// 				//await WorkerWindow.load();
// 				console.log('loaded WorkerWindow')
// 				ipc.init();
// 				//discord.setPresence();
// 				mainWindow = new BrowserWindow(mainWindowProps);
// 			}
// 		})
// 	}
// 	// else {
// 	// 	loginWindow = new BotWindow(config.loginWindowPath, {
// 	// 		width: 700,
// 	// 		height: 400
// 	// 	})
// 	// }
// 	// ipcMain.on('authenticate', async (event, args) => {
// 	// 	auth.authenticate(args.key,async (error) => {
// 	// 		if (error) {
// 	// 			loginWindow.webContents.send('authentication error', error);
// 	// 		}
// 	// 		else {
// 	// 			settings.set('userKey', args.key);
// 	// 			//LoginWindow.window.close();
// 	// 			//if (!WorkerWindow.window)	WorkerWindow.create();
// 	// 			//await WorkerWindow.load();
// 	// 			ipc.init();
// 	// 			discord.setPresence();
// 	// 			mainWindow = new BotWindow(config.mainWindowPath, {
// 	// 				"width": 1250,
// 	// 				 "height": 750,
// 	// 			});
// 	// 		}
// 	// 	})
// 	// })
// }


// app.once('ready', main);

// app.on("window-all-closed", function () {
// 	app.quit();
// });




//setInterval(async () => {
//	try {
//		let x = (await psList()).filter(process => process.cmd.toLowerCase().includes('charles'));
//		if (x.length > 0) {
//			app.quit();
//		}
//	}
//	catch(error) {console.log(error)}
	
//}, 10000)