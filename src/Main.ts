import { BrowserWindow } from 'electron';
import { HarvesterWindow } from './main/windows/index';
import * as ipc from './ipc';
import * as path from 'path';

interface harvesterProps {
  supreme: Array<typeof HarvesterWindow>;
}

// interface Main {
// 	BrowserWindow: typeof BrowserWindow;
//   application: Electron.App;
// 	isDev: boolean;
// 	isMac:boolean;

//   mainWindow: Electron.BrowserWindow;
//   loginWindow: Electron.BrowserWindow | null;
//   workerWindow: Electron.BrowserWindow;
  
//   HARVESTERS: harvesterProps;
//   HARVESTER_QUEUES: harvesterProps;
//   CARDINAL_SOLVERS: any;
// }

/*
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

export { Main };*/
class Main {}
export { Main};