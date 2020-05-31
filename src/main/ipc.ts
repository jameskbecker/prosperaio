import { app, BrowserWindow, dialog, ipcMain, session } from 'electron';
import Main from './Main';
import { HarvesterWindow, GoogleWindow } from './windows/index';
const { logger } = require('../library/other');
const settings = require('electron-settings');

var CARDINAL_SOLVERS:any = {};

var HARVESTERS:any = {
	'supreme': [],
	'kickz': [],
	'kickzpremium': []
};
var HARVESTER_QUEUES:any = {
	'supreme': [],
	'kickz': [],
	'kickzpremium': []
};
function init() {

	/* ----------------------------------- WINDOW -------------------------------------- */

	ipcMain.on('window.reload',  () => {
		logger.debug('[MAIN] [IPC] window.reload');
		Main.workerWindow?.webContents.reload();
		Main.mainWindow.webContents.reload();
	});

	ipcMain.on('window.minimize', () => {
		logger.debug('[MAIN] [IPC] window.minimize');
		BrowserWindow.getFocusedWindow()?.minimize();
	});

	ipcMain.on('window.close', () => {
		logger.debug('[MAIN] [IPC] window.close');
		app.quit();
	});

	/* ---------------------------------- CAPTCHA ------------------------------------- */
	ipcMain.on('captcha.launch', (event, args) => {
		logger.debug('[MAIN] [IPC] captcha.launch');
		let harvester = new HarvesterWindow(args.sessionName, args.site);
		harvester.spawn();
		HARVESTERS[args.site].push(harvester);
	});

	ipcMain.on('captcha.ready', (event, args) => {
		logger.debug('[MAIN] [IPC] captcha.ready');
		let harvester = HARVESTERS[args.site].find((harvester: HarvesterWindow) => harvester.sessionName === args.sessionName);
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
		event.sender.send('cleared queue', HARVESTER_QUEUES[args].length);
	});

	ipcMain.on('captcha.signIn', (event, args) => {
		logger.debug('[MAIN] [IPC] captcha.signIn');
		let sessionName = args.sessionName;
	//new GoogleLogin(sessionName, args.type);
	GoogleWindow.create(sessionName);
	GoogleWindow.load();
	GoogleWindow.window?.once('closed', () => {
		GoogleWindow.window = null;
		Main.mainWindow.webContents.send('logged into GoogleWindow', {
			type: args.type
		});
	});
	});

	ipcMain.on('captcha.signOut', (event, args) => {
		logger.debug('[MAIN] [IPC] captcha.signOut');
		let sessionName = args.name;
		session.fromPartition(`persist:${sessionName}`).clearStorageData();
		Main.mainWindow.webContents.send('remove session', sessionName);
	});

	ipcMain.on('captcha.request', (event, args) => {
		logger.debug('[MAIN] [IPC] captcha.request');
		let readyHarvesters = HARVESTERS[args.type].filter((harvester: HarvesterWindow) => harvester.state === 'ready');
		if (readyHarvesters.length < 1) {
			logger.debug('NO READY HARVESTERS... PLACING IN QUEUE');
			HARVESTER_QUEUES[args.type].push(args);
		}
		else {
			readyHarvesters[0].state = 'busy';
			readyHarvesters[0].window.webContents.send('captcha request', {
				config: readyHarvesters[0].config,
				id: args.id
			});
		}
	});

	ipcMain.on('captcha.response', (event, args) => {
		logger.debug('[MAIN] [IPC] captcha.response');
		Main.workerWindow?.webContents.send('captcha response', {
			id: args.id,
			ts: args.ts,
			token: args.token
		});
		let usedHarvester = HARVESTERS[args.site].filter((harvester: HarvesterWindow) => harvester.sessionName === args.sessionName)[0]; //filter by session?
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
		let updatedHarvesters = HARVESTERS[args.site].filter(function (harvester: HarvesterWindow) {
			if (harvester.sessionName === args.sessionName) {
				harvester.window?.close();
			}
			else {
				return true;
			}
		});
		HARVESTERS[args.site] = updatedHarvesters;
	});

	/* ---------------------------------- CARDINAL ------------------------------------- */

	// ipcMain.on('cardinal.setup', (event, args) => {
	// 	logger.debug('[MAIN] [IPC] cardinal.setup');
	// 	ThreeDSWindow.create(args.taskId);
	// 	ThreeDSWindow.load(args.taskId, () => {
	// 		CARDINAL_SOLVERS[args.taskId].webContents.send('cardinal.setup', args);
	// 	});
	// });

	// ipcMain.on('cardinal.setupComplete', (event, args) => {
	// 	logger.debug('[MAIN] [IPC] cardinal.setupComplete');
	// 	CARDINAL_SOLVERS[args.taskId].hide();
	// 	Main.workerWindow?.webContents.send(`cardinal.setupComplete(${args.taskId})`, {
	// 		cardinalId: args.cardinalId
	// 	});
	// });

	// ipcMain.on('cardinal.continue', (event, args) => {
	// 	logger.debug('[MAIN] [IPC] cardinal.continue');
	// 	CARDINAL_SOLVERS[args.taskId].show();
	// 	CARDINAL_SOLVERS[args.taskId].webContents.send('cardinal.continue', args);
	// });

	// ipcMain.on('cardinal.validated', (event, args) => {
	// 	logger.debug('[MAIN] [IPC] cardinal.validated');
	// 	Main.workerWindow?.webContents.send(`cardinal.validated(${args.taskId})`, {
	// 		data: args.data,
	// 		responseJWT: args.responseJWT
	// 	});
	// 	CARDINAL_SOLVERS[args.taskId].close();
	// 	delete CARDINAL_SOLVERS[args.taskId];
	// });

	/* ----------------------------------------------------------------------------------- */

	ipcMain.on('import data', async (event, args) => {
		let paths = await dialog.showOpenDialog(Main.mainWindow, {
			message: `Import ${args.type}`,
			buttonLabel: 'Import',
			properties: ["multiSelections"],
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
		if (paths.filePaths.constructor === Array && paths.filePaths.length >= 1) {
			let shouldOverwrite = Boolean(dialog.showMessageBox(Main.mainWindow, {
				type: 'question',
				buttons: ['No', 'Yes'],
				defaultId: 0,
				message: 'Would you like to Overwrite your Current Data?'
			}));
			Main.workerWindow?.webContents.send('import data', {
				'type': args.type,
				'paths': paths,
				'overwrite': shouldOverwrite
			});
		}
	});

	ipcMain.on('export data', (event, args) => {
		let path = dialog.showSaveDialog(Main.mainWindow, {
			message: `Export ${args.type}`,
			defaultPath: `${args.type}.prosper`,
			buttonLabel: 'Export',
			//multiSelections: false,
			filters: [
				{
					name: 'ProsperAIO File',
					extensions: ['prosper']
				}
			]
		});
		Main.workerWindow?.webContents.send('export data', {
			path: path,
			type: args.type
		});
	});

	/* --------------------------------------------------------------------------------------- */

	ipcMain.on('task.save', (event, args) => {
		Main.workerWindow?.webContents.send('save task', args);
	});

	ipcMain.on('task.run', (event, id) => {
		Main.workerWindow?.webContents.send('run task', id);
	});

	ipcMain.on('task.stop', (event, id) => {
		Main.workerWindow?.webContents.send('stop task', id);
	});

	ipcMain.on('task.duplicate', (event, id) => {
		Main.workerWindow?.webContents.send('duplicate task', id);
	});

	ipcMain.on('task.delete', (event, id) => {
		Main.workerWindow?.webContents.send('delete task', id);
	});

	ipcMain.on('task.runAll', () => {
		Main.workerWindow?.webContents.send('run all tasks');
	});

	ipcMain.on('task.stopAll', () => {
		Main.workerWindow?.webContents.send('stop all tasks');
	});

	ipcMain.on('task.deleteAll', () => {
		Main.workerWindow?.webContents.send('delete all tasks');
	});

	ipcMain.on('task.setStatus', (event, args) => {
		Main.mainWindow.webContents.send('task.setStatus', args);
	});

	ipcMain.on('task.setProductName', (event, args) => {
		Main.mainWindow.webContents.send('task.setProductName', args);
	});

	ipcMain.on('task.setSizeName', (event, args) => {
		Main.mainWindow.webContents.send('task.setSizeName', args);
	});

	/* --------------------------------------------------------------------------------- */

	ipcMain.on('delete all profiles', () => {
		Main.workerWindow?.webContents.send('delete all profiles');
	});

	/* --------------------------------------------------------------------------------- */

	ipcMain.on('proxyList.test', (event, args) => {
		Main.workerWindow?.webContents.send('proxyList.test', args);
	});

	ipcMain.on('proxyList.testAll', (event, args) => {
		Main.workerWindow?.webContents.send('proxyList.testAll', args);
	});

	ipcMain.on('proxyList.setStatus', (event, args) => {
		Main.mainWindow.webContents.send('proxyList.setStatus', args);
	});

	ipcMain.on('proxyList.removeItem', (event, args) => {
		Main.workerWindow?.webContents.send('proxyList.removeItem', args);
	});

	ipcMain.on('proxyList.delete', (event, args) => {
		Main.workerWindow?.webContents.send('proxyList.delete', args);
	});

	ipcMain.on('proxyList.edit', () => {
		
	});

	/* --------------------------------------------------------------------------------- */

	ipcMain.on('setup browser mode', () => {
		Main.mainWindow.webContents.send('installing browser mode');
		Main.workerWindow?.webContents.send('download browser exectutable', {
			path: app.getPath('appData') + '/ProsperAIO'
		});
	});

	ipcMain.on('check for browser executable', () => {
		Main.mainWindow.webContents.send('check for browser executable');
	});

	/* --------------------------------------------------------------------------------------- */

	ipcMain.on('sync settings', (event, type) => {
		Main.mainWindow.webContents.send('sync settings', type);
	});

	ipcMain.on('reset settings', async () => {
		let box = await dialog.showMessageBox(Main.mainWindow, {
			type: 'warning',
			buttons: ['Yes', 'No'],
			defaultId: 1,
			message: 'Are You Sure You Want to Perform this Action?',
			detail: 'This will delete all tasks, profiles, google accounts and any other custom settings you may have made.',
			cancelId: 1
		});
		switch (box.response) {
			case 0:
				Main.workerWindow?.webContents.send('reset settings');
				break;
			case 1:
				logger.debug('NO');
				break;
		}
	});

	ipcMain.on('signout', () => {
		settings.delete('userKey');
		app.relaunch();
		app.exit();
	});
}
export { init };