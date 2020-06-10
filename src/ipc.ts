import { app, BrowserWindow, dialog, ipcMain, session } from 'electron';
//import { Main } from './app';
import { HarvesterWindow, GoogleWindow } from './main/windows/index';
import { logger } from './library/other';
import settings from 'electron-settings';

var cardinal_solvers:any = {};

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
function init():void {

	/* ----------------------------------- WINDOW -------------------------------------- */

	ipcMain.on('window.reload',  ():void => {
		logger.debug('[MAIN] [IPC] window.reload');
		this.workerWindow?.webContents.reload();
		this.mainWindow.webContents.reload();
	});

	ipcMain.on('window.maximize', ():void => {
		logger.debug('[MAIN] [IPC] window.maximize');
		this.mainWindow.isMaximized() ? this.mainWindow.unmaximize() : this.mainWindow.maximize();
	});

	ipcMain.on('window.minimize', ():void => {
		logger.debug('[MAIN] [IPC] window.minimize');
		BrowserWindow.getFocusedWindow()?.minimize();
	});

	ipcMain.on('window.close', ():void => {
		logger.debug('[MAIN] [IPC] window.close');
		app.quit();
	});

	/* ---------------------------------- CAPTCHA ------------------------------------- */
	ipcMain.on('captcha.launch', (event, args):void => {
		logger.debug('[MAIN] [IPC] captcha.launch');
		try {
			let harvester:HarvesterWindow = new HarvesterWindow(args.sessionName, args.site);
			harvester.spawn();
			HARVESTERS[args.site].push(harvester);
		}
		catch(error) {
			console.log(error);
		}
	
	
	});

	ipcMain.on('captcha.ready', (event, args):void => {
		logger.debug('[MAIN] [IPC] captcha.ready');
		let harvester:any = HARVESTERS[args.site].find((harvester: HarvesterWindow):boolean => harvester.sessionName === args.sessionName);
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

	ipcMain.on('captcha.clearQueue', (event, args):void => {
		logger.debug('[MAIN] [IPC] captcha.clearQueue');
		HARVESTER_QUEUES[args].length = 0;
		event.sender.send('cleared queue', HARVESTER_QUEUES[args].length);
	});

	ipcMain.on('captcha.signIn', (event, args):void => {
		logger.debug('[MAIN] [IPC] captcha.signIn');
		let sessionName:string = args.sessionName;
	//new GoogleLogin(sessionName, args.type);
	GoogleWindow.create(sessionName);
	GoogleWindow.load();
	GoogleWindow.window?.once('closed', ():void => {
		GoogleWindow.window = null;
		this.mainWindow.webContents.send('logged into GoogleWindow', {
			type: args.type
		});
	});
	});

	ipcMain.on('captcha.signOut', (event, args):void => {
		logger.debug('[MAIN] [IPC] captcha.signOut');
		let sessionName:string = args.name;
		session.fromPartition(`persist:${sessionName}`).clearStorageData();
		this.mainWindow.webContents.send('remove session', sessionName);
	});

	ipcMain.on('captcha.request', (event, args):void => {
		logger.debug('[MAIN] [IPC] captcha.request');
		let readyHarvesters:any = HARVESTERS[args.type].filter((harvester: HarvesterWindow):boolean => harvester.state === 'ready');
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

	ipcMain.on('captcha.response', (event, args):void => {
		logger.debug('[MAIN] [IPC] captcha.response');
		this.workerWindow?.webContents.send('captcha response', {
			id: args.id,
			ts: args.ts,
			token: args.token
		});
		let usedHarvester:any = HARVESTERS[args.site].filter((harvester: HarvesterWindow):boolean => harvester.sessionName === args.sessionName)[0]; //filter by session?
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

	ipcMain.on('captcha.closeWindow', (event, args):void => {
		logger.debug('[MAIN] [IPC] captcha.closeWindow');
		let updatedHarvesters:any = HARVESTERS[args.site].filter(function (harvester: HarvesterWindow):any {
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

	ipcMain.on('cardinal.setup', (event, args) => {
		logger.debug('[MAIN] [IPC] cardinal.setup');
		cardinal_solvers[args.taskId] = new BrowserWindow({
			width: 450,
			height: 555,
			frame: false,
			show: false,
			alwaysOnTop: true,
			webPreferences: {
				nodeIntegration: true
			}
		});
		cardinal_solvers[args.taskId].loadFile(`${app.getAppPath()}/assets/3d-secure.html`);
		cardinal_solvers[args.taskId].webContents.once('dom-ready', function():void {
			cardinal_solvers[args.taskId].show();
			cardinal_solvers[args.taskId].webContents.send('cardinal.setup', args);
		});
	});

	ipcMain.on('cardinal.setupComplete', (event, args) => {
		logger.debug('[MAIN] [IPC] cardinal.setupComplete');
		cardinal_solvers[args.taskId].hide();
		this.workerWindow?.webContents.send(`cardinal.setupComplete(${args.taskId})`, {
			cardinalId: args.cardinalId
		});
	});

	ipcMain.on('cardinal.continue', (event, args) => {
		logger.debug('[MAIN] [IPC] cardinal.continue');
		cardinal_solvers[args.taskId].show();
		cardinal_solvers[args.taskId].webContents.send('cardinal.continue', args);
	});

	ipcMain.on('cardinal.validated', (event, args) => {
		logger.debug('[MAIN] [IPC] cardinal.validated');
		this.workerWindow?.webContents.send(`cardinal.validated(${args.taskId})`, {
			data: args.data,
			responseJWT: args.responseJWT
		});
		cardinal_solvers[args.taskId].close();
		delete cardinal_solvers[args.taskId];
	});

	/* ----------------------------------------------------------------------------------- */

	ipcMain.on('import data', async (event, args):Promise<any> => {
		let paths:any = await dialog.showOpenDialog(this.mainWindow, {
			message: `Import ${args.type}`,
			buttonLabel: 'Import',
			properties: ['multiSelections'],
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
			let shouldOverwrite:boolean = Boolean(dialog.showMessageBox(this.mainWindow, {
				type: 'question',
				buttons: ['No', 'Yes'],
				defaultId: 0,
				message: 'Would you like to Overwrite your Current Data?'
			}));
			this.workerWindow?.webContents.send('import data', {
				'type': args.type,
				'paths': paths,
				'overwrite': shouldOverwrite
			});
		}
	});

	ipcMain.on('export data', (event, args):void => {
		let path:any = dialog.showSaveDialog(this.mainWindow, {
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
		this.workerWindow?.webContents.send('export data', {
			path: path,
			type: args.type
		});
	});

	/* --------------------------------------------------------------------------------------- */

	ipcMain.on('task.save', (event, args):void => {
		this.workerWindow?.webContents.send('save task', args);
	});

	ipcMain.on('task.run', (event, id):void => {
		this.workerWindow?.webContents.send('run task', id);
	});

	ipcMain.on('task.stop', (event, id):void => {
		this.workerWindow?.webContents.send('stop task', id);
	});

	ipcMain.on('task.duplicate', (event, id):void => {
		this.workerWindow?.webContents.send('duplicate task', id);
	});

	ipcMain.on('task.delete', (event, id):void => {
		this.workerWindow?.webContents.send('delete task', id);
	});

	ipcMain.on('task.runAll', ():void => {
		this.workerWindow?.webContents.send('run all tasks');
	});

	ipcMain.on('task.stopAll', ():void => {
		this.workerWindow?.webContents.send('stop all tasks');
	});

	ipcMain.on('task.deleteAll', ():void => {
		this.workerWindow?.webContents.send('delete all tasks');
	});

	ipcMain.on('task.setStatus', (event, args):void => {
		this.mainWindow.webContents.send('task.setStatus', args);
	});

	ipcMain.on('task.setProductName', (event, args):void => {
		this.mainWindow.webContents.send('task.setProductName', args);
	});

	ipcMain.on('task.setSizeName', (event, args):void => {
		this.mainWindow.webContents.send('task.setSizeName', args);
	});

	/* --------------------------------------------------------------------------------- */

	ipcMain.on('delete all profiles', ():void => {
		this.workerWindow?.webContents.send('delete all profiles');
	});

	/* --------------------------------------------------------------------------------- */

	ipcMain.on('proxyList.test', (event, args):void => {
		this.workerWindow?.webContents.send('proxyList.test', args);
	});

	ipcMain.on('proxyList.testAll', (event, args):void => {
		this.workerWindow?.webContents.send('proxyList.testAll', args);
	});

	ipcMain.on('proxyList.setStatus', (event, args):void => {
		this.mainWindow.webContents.send('proxyList.setStatus', args);
	});

	ipcMain.on('proxyList.removeItem', (event, args):void => {
		this.workerWindow?.webContents.send('proxyList.removeItem', args);
	});

	ipcMain.on('proxyList.delete', (event, args):void => {
		this.workerWindow?.webContents.send('proxyList.delete', args);
	});

	ipcMain.on('proxyList.edit', ():void => {
		
	});

	/* --------------------------------------------------------------------------------- */

	ipcMain.on('setup browser mode', ():void => {
		this.mainWindow.webContents.send('installing browser mode');
		this.workerWindow?.webContents.send('download browser exectutable', {
			path: app.getPath('appData') + '/ProsperAIO'
		});
	});

	ipcMain.on('check for browser executable', ():void => {
		this.mainWindow.webContents.send('check for browser executable');
	});

	/* --------------------------------------------------------------------------------------- */

	ipcMain.on('sync settings', (event, type):void => {
		this.mainWindow.webContents.send('sync settings', type);
	});

	ipcMain.on('reset settings', async ():Promise<any> => {
		let box:any = await dialog.showMessageBox(this.mainWindow, {
			type: 'warning',
			buttons: ['Yes', 'No'],
			defaultId: 1,
			message: 'Are You Sure You Want to Perform this Action?',
			detail: 'This will delete all tasks, profiles, google accounts and any other custom settings you may have made.',
			cancelId: 1
		});
		switch (box.response) {
			case 0:
				this.workerWindow?.webContents.send('reset settings');
				break;
			case 1:
				logger.debug('NO');
				break;
		}
	});

	ipcMain.on('signout', ():void => {
		settings.delete('userKey');
		app.relaunch();
		app.exit();
	});
}
export { init };