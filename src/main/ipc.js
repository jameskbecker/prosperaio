'use strict'
const electron = require('electron');
const { app, BrowserWindow, dialog, ipcMain, session } = electron;
const { Harvester, mainWindow, worker, threeDS } = require('./windows');
const { HarvesterLogin, logger } = require('../library/other');
const settings = require('electron-settings');

global['CARDINAL_SOLVERS'] = {}
global['HARVESTERS'] = {
	'supreme': [],
	'kickz': [],
	'kickzpremium': []
};
global['HARVESTER_QUEUES'] = {
	'supreme': [],
	'kickz': [],
	'kickzpremium': []
}

module.exports = {
	init: () => {

		/* ----------------------------------- WINDOW -------------------------------------- */

		ipcMain.on('window.reload', (event, args) => {
			logger.debug('[MAIN] [IPC] window.reload');
			worker.window.webContents.reload();
			mainWindow.window.webContents.reload();
		});

		ipcMain.on('window.minimize', (event, args) => {
			logger.debug('[MAIN] [IPC] window.minimize');
			BrowserWindow.getFocusedWindow().minimize();
		});

		ipcMain.on('window.close', (event, args) => {
			logger.debug('[MAIN] [IPC] window.close');
			app.quit();
		});

		/* ---------------------------------- CAPTCHA ------------------------------------- */
		ipcMain.on('captcha.launch', (event, args) => {
			logger.debug('[MAIN] [IPC] captcha.launch');
			let harvester = new Harvester(args.sessionName, args.site);
			harvester.spawn();
			HARVESTERS[args.site].push(harvester);
		});

		ipcMain.on('captcha.ready', (event, args) => {
			logger.debug('[MAIN] [IPC] captcha.ready');
			let harvester = HARVESTERS[args.site].filter(harvester => harvester.sessionName === args.sessionName)[0];
			if (HARVESTER_QUEUES[args.site].length > 0) {
				harvester.state = 'busy';
				harvester.window.webContents.send('captcha request', {
					config: harvester.config,
					id: HARVESTER_QUEUES[args.site][0].id
				});
				HARVESTER_QUEUES[args.site].shift();
			}
			else {
				harvester.state = 'ready';
			}
		});

		ipcMain.on('captcha.clearQueue', (event, args) => {
			logger.debug('[MAIN] [IPC] captcha.clearQueue');
			HARVESTER_QUEUES[args].length = 0;
			event.sender.send('cleared queue', HARVESTER_QUEUES[args].length)
		});

		ipcMain.on('captcha.signIn', (event, args) => {
			logger.debug('[MAIN] [IPC] captcha.signIn');
			let sessionName = args.sessionName;
			new HarvesterLogin(sessionName, args.type);
		});

		ipcMain.on('captcha.signOut', (event, args) => {
			logger.debug('[MAIN] [IPC] captcha.signOut');
			let sessionName = args.name
			session.fromPartition(`persist:${sessionName}`).clearStorageData();
			mainWindow.window.webContents.send('remove session', sessionName);
		});

		ipcMain.on('captcha.request', (event, args) => {
			logger.debug('[MAIN] [IPC] captcha.request');
			let readyHarvesters = HARVESTERS[args.type].filter(harvester => harvester.state === 'ready');
			if (readyHarvesters.length < 1) {
				logger.debug('NO READY HARVESTERS... PLACING IN QUEUE')
				HARVESTER_QUEUES[args.type].push(args);
			}
			else {
				readyHarvesters[0].state = 'busy';
				readyHarvesters[0].window.webContents.send('captcha request', {
					config: readyHarvesters[0].config,
					id: args.id
				})
			}
		});

		ipcMain.on('captcha.response', (event, args) => {
			logger.debug('[MAIN] [IPC] captcha.response');
			worker.window.webContents.send('captcha response', {
				id: args.id,
				ts: args.ts,
				token: args.token
			});
			let usedHarvester = HARVESTERS[args.site].filter(harvester => harvester.sessionName === args.sessionName)[0]; //filter by session?
			if (HARVESTER_QUEUES[args.site].length > 0) {
				usedHarvester.window.webContents.send('captcha request', {
					config: usedHarvester.config,
					id: HARVESTER_QUEUES[args.site][0].id
				});
				HARVESTER_QUEUES[args.site].shift();
			}
			else {
				usedHarvester.state = 'ready';
			}

		});

		ipcMain.on('captcha.closeWindow', (event, args) => {
			logger.debug('[MAIN] [IPC] captcha.closeWindow');
			let updatedHarvesters = HARVESTERS[args.site].filter(function (harvester) {
				if (harvester.sessionName === args.sessionName) {
					harvester.window.close();
				}
				else {
					return true;
				}
			})
			HARVESTERS[args.site] = updatedHarvesters;
		});

		/* ---------------------------------- CARDINAL ------------------------------------- */

		ipcMain.on('cardinal.setup', (event, args) => {
			logger.debug('[MAIN] [IPC] cardinal.setup');
			threeDS.create(args.taskId);
			threeDS.load(args.taskId, () => {
				global['CARDINAL_SOLVERS'][args.taskId].webContents.send('cardinal.setup', args);
			});
		})

		ipcMain.on('cardinal.setupComplete', (event, args) => {
			logger.debug('[MAIN] [IPC] cardinal.setupComplete');
			global['CARDINAL_SOLVERS'][args.taskId].hide();
			worker.window.webContents.send(`cardinal.setupComplete(${args.taskId})`, {
				cardinalId: args.cardinalId
			})
		})

		ipcMain.on('cardinal.continue', (event, args) => {
			logger.debug('[MAIN] [IPC] cardinal.continue');
			global['CARDINAL_SOLVERS'][args.taskId].show();
			global['CARDINAL_SOLVERS'][args.taskId].webContents.send('cardinal.continue', args)
		});

		ipcMain.on('cardinal.validated', (event, args) => {
			logger.debug('[MAIN] [IPC] cardinal.validated');
			worker.window.webContents.send(`cardinal.validated(${args.taskId})`, {
				data: args.data,
				responseJWT: args.responseJWT
			});
			global['CARDINAL_SOLVERS'][args.taskId].close();
			delete global['CARDINAL_SOLVERS'][args.taskId];
		});

		/* ----------------------------------------------------------------------------------- */

		ipcMain.on('import data', (event, args) => {
			let paths = dialog.showOpenDialog(mainWindow.window, {
				message: `Import ${args.type}`,
				buttonLabel: 'Import',
				multiSelections: true,
				filters: [
					{
						name: 'ProsperAIO File',
						extensions: ['prosper']
					},
					{
						name: 'JSON File',
						extensions: ['json']
					}
				]

			});
			if (typeof paths === 'object' && paths.length >= 1) {
				let shouldOverwrite = Boolean(dialog.showMessageBox(mainWindow.window, {
					type: 'question',
					buttons: ['No', 'Yes'],
					defaultId: 0,
					message: 'Would you like to Overwrite your Current Data?'
				}));
				worker.window.webContents.send('import data', {
					'type': args.type,
					'paths': paths,
					'overwrite': shouldOverwrite
				})
			}
		});

		ipcMain.on('export data', (event, args) => {
			let path = dialog.showSaveDialog(mainWindow.window, {
				message: `Export ${args.type}`,
				defaultPath: `${args.type}.prosper`,
				buttonLabel: 'Export',
				multiSelections: false,
				filters: [
					{
						name: 'ProsperAIO File',
						extensions: ['prosper']
					}
				]
			});
			worker.window.webContents.send('export data', {
				path: path,
				type: args.type
			})
		});

		/* --------------------------------------------------------------------------------------- */

		ipcMain.on('task.save', (event, args) => {
			worker.window.webContents.send('save task', args);
		});

		ipcMain.on('task.run', (event, id) => {
			worker.window.webContents.send('run task', id);
		});

		ipcMain.on('task.stop', (event, id) => {
			worker.window.webContents.send('stop task', id);
		});

		ipcMain.on('task.duplicate', (event, id) => {
			worker.window.webContents.send('duplicate task', id);
		});

		ipcMain.on('task.delete', (event, id) => {
			worker.window.webContents.send('delete task', id);
		});

		ipcMain.on('task.runAll', (event, id) => {
			worker.window.webContents.send('run all tasks');
		});

		ipcMain.on('task.stopAll', (event, id) => {
			worker.window.webContents.send('stop all tasks');
		});

		ipcMain.on('task.deleteAll', (event, id) => {
			worker.window.webContents.send('delete all tasks');
		});

		ipcMain.on('task.setStatus', (event, args) => {
			mainWindow.window.webContents.send('task.setStatus', args);
		});

		ipcMain.on('task.setProductName', (event, args) => {
			mainWindow.window.webContents.send('task.setProductName', args);
		});

		ipcMain.on('task.setSizeName', (event, args) => {
			mainWindow.window.webContents.send('task.setSizeName', args);
		});

		/* --------------------------------------------------------------------------------- */

		ipcMain.on('delete all profiles', (event, args) => {
			worker.window.webContents.send('delete all profiles');
		})

		/* --------------------------------------------------------------------------------- */

		ipcMain.on('proxyList.test', (event, args) => {
			worker.window.webContents.send('proxyList.test', args);
		});

		ipcMain.on('proxyList.testAll', (event, args) => {
			worker.window.webContents.send('proxyList.testAll', args);
		});

		ipcMain.on('proxyList.setStatus', (event, args) => {
			mainWindow.window.webContents.send('proxyList.setStatus', args);
		});

		ipcMain.on('proxyList.removeItem', (event, args) => {
			worker.window.webContents.send('proxyList.removeItem', args);
		});

		ipcMain.on('proxyList.delete', (event, args) => {
			worker.window.webContents.send('proxyList.delete', args);
		});

		ipcMain.on('proxyList.edit', (event, args) => {
			
		});

		/* --------------------------------------------------------------------------------- */

		ipcMain.on('setup browser mode', (event, args) => {
			mainWindow.window.webContents.send('installing browser mode');
			worker.window.webContents.send('download browser exectutable', {
				path: app.getPath('appData') + '/ProsperAIO'
			});
		});

		ipcMain.on('check for browser executable', (event, args) => {
			mainWindow.window.webContents.send('check for browser executable');
		});

		/* --------------------------------------------------------------------------------------- */

		ipcMain.on('sync settings', (event, type) => {
			mainWindow.window.webContents.send('sync settings', type);
		})

		ipcMain.on('reset settings', (event, args) => {
			dialog.showMessageBox({
				type: 'warning',
				buttons: ['Yes', 'No'],
				defaultId: 1,
				message: 'Are You Sure You Want to Perform this Action?',
				detail: 'This will delete all tasks, profiles, google accounts and any other custom settings you may have made.',
				cancelId: 1
			}, (response) => {
				switch (response) {
					case 0:
						worker.window.webContents.send('reset settings');
						break;
					case 1:
						logger.debug('NO');
						break;
				}
			})
		});

		ipcMain.on('signout', (event, args) => {
			settings.delete('userKey');
			app.relaunch();
			app.exit()
		});
	}
}	