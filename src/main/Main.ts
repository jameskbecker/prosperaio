import { BrowserWindow } from 'electron';
import { HarvesterWindow } from './windows/index';
import * as ipc from './ipc';
import * as path from 'path';

interface harvesterProps {
  supreme: Array<typeof HarvesterWindow>;
}



class Main {
  static BrowserWindow: typeof BrowserWindow;
  static application: Electron.App;
	static isDev: boolean;
	static isMac:boolean;

  static mainWindow: Electron.BrowserWindow;
  static loginWindow: Electron.BrowserWindow | null;
  static workerWindow: Electron.BrowserWindow;
  
  static HARVESTERS: harvesterProps = { 'supreme': [] };
  static HARVESTER_QUEUES: harvesterProps = { 'supreme': [] };
  static CARDINAL_SOLVERS: any = {};
  
  

  static main(app: Electron.App, browserWindow: typeof BrowserWindow, isDev: boolean):void {
		Main.isDev = isDev;
		Main.isMac = process.platform === 'darwin';
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on('ready', Main.onReady);
  }

  private static onReady():void {
    Main.mainWindow = new Main.BrowserWindow({
      "width": 1250,
      "height": 750,
      "backgroundColor": '#1a1919',
      "frame": true,
			"show": false,
			
      "resizable": true,
      "webPreferences": {
        nodeIntegration: true
      }
    });
    
    Main.loginWindow = new Main.BrowserWindow({
      "height": 400,
      "width": 700,
      "backgroundColor": '#1a1919',
      "frame": false,
      "show": false,
      "resizable": false,
      "webPreferences": {
        nodeIntegration: true
      }
    });

    Main.workerWindow = new Main.BrowserWindow({
      "height": 100,
      "width": 100,
      "show": false,
      "webPreferences": {
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

  private static mainOnClose():void {
    
  }

  private static workerOnClose():void {
    
  }

  private static readyToShow():void {
    Main.mainWindow?.show();

    if (Main.isDev) {
      Main.mainWindow?.webContents.openDevTools({ mode: 'detach' });
    }
  }

  private static workerReady():void {
    if (Main.isDev) {
      Main.workerWindow?.webContents.openDevTools({ mode: 'detach' });
    }
	}
	
	private static buildMenu():any {
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

export default Main;