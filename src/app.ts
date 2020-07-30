import * as auth from './main/authentication';
import * as discord from './main/discord';
import * as ipc from './ipc';
import { BrowserWindow, Menu, app, ipcMain } from 'electron';
import { ChildProcess, exec } from 'child_process';
import fs from 'fs';
import isDev from 'electron-is-dev';
import moment from 'moment';
import net from 'net';
import path from 'path';

declare global { namespace NodeJS { interface Global {
	go: net.Socket
}}}

let goServer: ChildProcess;
const socketPath = '/tmp/prosperaio.sock';
const connections: Record<string, net.Socket> = {};
//let client: NodeJS.socketPath;
let ts: number;
let server: net.Server;
let se3lf: string;

function main(): void {
	const settings = require('electron-settings');
	const isMac = process.platform === 'darwin';

	const mainWindow = new BrowserWindow({
		'width': 1400,
		'height': 750,
		'backgroundColor': '#1a1919',
		'frame': false,
		'show': false,
		'resizable': true,
		'webPreferences': {
			nodeIntegration: true
		}
	});

	const loginWindow = new BrowserWindow({
		'height': 400,
		'width': 700,
		'backgroundColor': '#1a1919',
		'frame': false,
		'show': false,
		'resizable': false,
		'webPreferences': {
			nodeIntegration: true
		}
	});

	const workerWindow = new BrowserWindow({
		'height': 50,
		'width': 50,
		'show': true,
		'webPreferences': {
			nodeIntegration: true
		}
	});

	function showMainWindow() {
		if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
		mainWindow.show();
	}

	function showWorkerWindow() {
		if (isDev) {
			workerWindow.webContents.openDevTools({ mode: 'detach' });
		}
		ipc.init(mainWindow, workerWindow);
	}

	mainWindow.webContents.once('did-finish-load', showMainWindow);
	mainWindow.on('closed', app.quit);

	workerWindow.webContents.once('did-finish-load', showWorkerWindow);
	//workerWindow.on('closed', () => { });

	loginWindow.webContents.once('did-finish-load', loginWindow.show);
	
	


	if (isDev) {
		mainWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'index.html'));
		workerWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'worker.html'));

		discord.setPresence();
		checkSocket();

	}
	// else if (settings.has('userKey')) {
	// 	auth.authenticate(settings.get('userKey'), async (error: any) => {
	// 		if (error) {
	// 			loginWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'authenticator.html'));
	// 			ipcMain.on('authenticate', async (event, args) => {
	// 				auth.authenticate(args.key, async (error: any) => {
	// 					if (error) {
	// 						loginWindow.webContents.send('authentication error', error);
	// 					}
	// 					else {
	// 						loginWindow.hide();
	// 						settings.set('userKey', args.key, { prettify: true });
	// 						mainWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'index.html'));
	// 						workerWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'worker.html'));

	// 						discord.setPresence();
	// 					}
	// 				});
	// 			});
	// 		}
	// 		else {
	// 			mainWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'index.html'));
	// 			workerWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'worker.html'));
	// 			discord.setPresence();
	// 		}
	// 	});
	// }
	// else {
	// 	loginWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'authenticator.html'));
	// 	ipcMain.on('authenticate', async (event, args) => {
	// 		auth.authenticate(args.key, async (error: any) => {
	// 			if (error) {
	// 				loginWindow.webContents.send('authentication error', error);
	// 			}
	// 			else {
	// 				loginWindow.hide();
	// 				settings.set('userKey', args.key, { prettify: true });
	// 				mainWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'index.html'));
	// 				workerWindow.loadURL(path.join('file:///', app.getAppPath(), 'assets', 'worker.html'));

	// 				discord.setPresence();
	// 			}
	// 		});
	// 	});
	// }

}

function checkSocket() {
	console.log('[MAIN] Checking for leftover socketPath.');
	fs.stat(socketPath, function (err: Error) {
		if (err) {
			console.log('[MAIN] No leftover socketPath found.');
			server = createServer(socketPath); return;
		}

		console.log('[MAIN] Removing leftover socketPath.');
		fs.unlink(socketPath, function (err: Error) {
			if (err) {
				console.error(err); process.exit(0);
			}
			server = createServer(socketPath); return;
		});
	});
}

function ipcHandler(jsonString: string) {
	const message = JSON.parse(jsonString);

	switch (message.channel) {
		case 'task.setStatus':
			break;

		default:
			console.log('[MAIN] Received Unknown GO IPC Message:', message);
	}
}

function createServer(socketPath: string): net.Server {
	console.log("[MAIN] Starting Go Server");
	const server = net.createServer(function (socket: net.Socket) {
		console.log('[MAIN] Connection acknowledged.');
		// Store all connections so we can terminate them if the server closes.
		// An object is better than an array for these.
		const self = Date.now();
		se3lf = self.toString();
		connections[self] = (socket);
		global.go = (socket);
		socket.on('end', function () {
			console.log('Client disconnected.');
			delete connections[self];
		});

		// Messages are buffers. use toString
		socket.on('data', function (data: Buffer) {
			const message = data.toString().split(';');
			message.forEach((m: string) => {
				if (m.length) {
					ipcHandler(m);
				}

			});

		});


	});
	server.listen(socketPath);

	goServer = exec('./build/go-server');
	goServer.stdout.on('data', (data: string) => { console.log("\x1b[0m" + moment().format('DD/MM/YYYY HH:mm:ss.SSSS') + ' ' + data); });
	goServer.stderr.on('data', (data: string) => { console.log("\x1b[0m" + moment().format('DD/MM/YYYY HH:mm:ss.SSSS') + ' ' + data); });

	server.on('connection', () => {
		console.log('[MAIN] Client Connected.');

	});

	

	return server;
}

app.on('ready', main);


// function connectToGo(): void {
// 	client = net.createConnection(socketPathPath);
// 	client.on("connect", () => {
// 		console.log('[NODE-MAIN] Connected to Go.');
// 		client.write('{"channel": "main.connected"}');
// 		client.end();
// 	});
// 	client.on('data', (data: Buffer) => {
// 		const message = data.toString();
// 		console.log('[NODE-MAIN] Received Message:', message);
// 	});
// 	client.on('error', () => {
// 		console.log('[NODE-MAIN] Go Server Not Active');
// 	});


// }



// import { Main } from './Main';
// import { HarvesterWindow } from './main/windows/index';






// app.allowRendererProcessReuse = true;
// app.on('ready', Main);


/*
function Main(app: Electron.App, browserWindow: typeof BrowserWindow, isDev: boolean) {
	this.isDev = isDev;
	this.isMac = process.platform === 'darwin';
	this.app = app;
}










interface Main {
	BrowserWindow: typeof BrowserWindow;
  application: Electron.App;
	isDev: boolean;
	isMac:boolean;

  mainWindow: Electron.BrowserWindow;
  loginWindow: Electron.BrowserWindow | null;
  workerWindow: Electron.BrowserWindow;

  HARVESTERS: harvesterProps;
  HARVESTER_QUEUES: harvesterProps;
  CARDINAL_SOLVERS: any;
}


function Main(app: Electron.App, browserWindow: typeof BrowserWindow, isDev: boolean) {
	this.isDev = isDev;
	this.isMac = process.platform === 'darwin';
	this.app = app;


  main():void {
		Main.isDev = isDev;
		Main.isMac = process.platform === 'darwin';
		Main.BrowserWindow = browserWindow;
		try {
			app.disableHardwareAcceleration();
		} catch(e) {console.log(e);}

    Main.application = app;
    Main.application.on('ready', Main.onReady);
  }

  onReady():void {
    Main.mainWindow = new Main.BrowserWindow({
      'width': 1250,
      'height': 750,
      'backgroundColor': '#1a1919',
      'frame': true,
			'show': false,

      'resizable': true,
      'webPreferences': {
        nodeIntegration: true
      }
    });

    Main.loginWindow = new Main.BrowserWindow({
      'height': 400,
      'width': 700,
      'backgroundColor': '#1a1919',
      'frame': false,
      'show': false,
      'resizable': false,
      'webPreferences': {
        nodeIntegration: true
      }
    });

    Main.workerWindow = new Main.BrowserWindow({
      'height': 100,
      'width': 100,
      'show': false,
      'webPreferences': {
        nodeIntegration: true
      }
    });

    Main.mainWindow.webContents.once('did-finish-load', Main.readyToShow);
    Main.workerWindow.webContents.once('did-finish-load', Main.workerReady);

    Main.mainWindow.on('closed', Main.mainOnClose);
    Main.workerWindow.on('closed', Main.workerOnClose);

    if (Main.isDev) {
      Main.mainWindow.loadURL(`file:///${Main.application.getAppPath()}/assets/index.html`);
      Main.workerWindow.loadURL(`file:///${Main.application.getAppPath()}/assets/worker.html`);

      ipc.init();
    }
    else {
      Main.loginWindow.loadURL(`file:///${Main.application.getAppPath()}/assets/authenticator.html`);
      Main.loginWindow.show();
    }
  }

  mainOnClose():void {

  }

  workerOnClose():void {

  }

  readyToShow():void {
    Main.mainWindow?.show();

    if (Main.isDev) {
      Main.mainWindow?.webContents.openDevTools({ mode: 'detach' });
    }
  }

  workerReady():void {
    if (Main.isDev) {
      Main.workerWindow?.webContents.openDevTools({ mode: 'detach' });
    }
	}

	buildMenu():any {
		[
			// { role: 'appMenu' }
			...(Main.isMac ? [{
				label: 'ProsperAIO',
				submenu: [
					{
						role: 'about'
					},
					{ type: 'separator' },
					{ role: 'hide' },
					{ role: 'unhide' },
					{ type: 'separator' },
					{ role: 'quit' }
				]
			}] : []),
			// { role: 'fileMenu' }
			{
				label: 'File',
				submenu: [
					{
						role: Main.isMac? 'close' : 'quit'
					},
					{ type: 'separator' },
					{
						label: 'Run All Tasks',
						accelerator: 'CommandOrControl+Shift+R',
						click: function (): any {
							if (Main.workerWindow) {
								Main.workerWindow.webContents.send('run all tasks');
							}
						}
					},
					{
						label: 'Stop All Tasks',
						accelerator: 'CommandOrControl+Shift+S',
						click: function (): any {
							if (Main.workerWindow) {
								Main.workerWindow.webContents.send('stop all tasks');
							}
						}
					},
					{
						label: 'Delete All Tasks',
						accelerator: 'CommandOrControl+Shift+D',
						click: function (): any {
							if (Main.workerWindow) {
								Main.workerWindow.webContents.send('delete all tasks');
							}
						}
					}//,
					// { type: 'separator' },
					// {
					// 	label: 'New Profile',
					// 	accelerator: 'CommandOrControl+P'
					// },
				]
			},
			// { role: 'editMenu' }
			{
				label: 'Edit',
				submenu: [
					{ role: 'undo' },
					{ role: 'redo' },
					{ type: 'separator' },
					{ role: 'cut' },
					{ role: 'copy' },
					{ role: 'paste' },
					...(Main.isMac ? [
						{ role: 'pasteAndMatchStyle' },
						{ role: 'delete' },
						{ role: 'selectAll' },
						{ type: 'separator' },
					] : [
							{ role: 'delete' },
							{ type: 'separator' },
							{ role: 'selectAll' }
						])
				]
			},
			// { role: 'windowMenu' }
			{
				label: 'Window',
				submenu: [
					{
						label: 'Reload Data',
						click: function (): any {
							if (Main.workerWindow) {
								Main.HARVESTERS = {
									'supreme': []
								};

								Main.HARVESTER_QUEUES = {
									'supreme': []
								};
								Main.workerWindow.webContents.reload();
								Main.mainWindow.webContents.reload();
							}
						},
						accelerator: 'CommandOrControl+R'
					},
					{
						role: 'minimize'
					},
					{
						role: 'close'
					}
				]
			}
		];
	}
}













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
*/