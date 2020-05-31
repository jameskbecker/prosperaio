import { BrowserWindow } from 'electron';
import { HarvesterWindow } from './windows/index';
import * as ipc from './ipc';

interface harvesterProps {
  supreme: Array<typeof HarvesterWindow>;
}

class Main {
  static BrowserWindow: typeof BrowserWindow;
  static application: Electron.App;
  static isDev: boolean;

  static mainWindow: Electron.BrowserWindow;
  static loginWindow: Electron.BrowserWindow | null;
  static workerWindow: Electron.BrowserWindow;
  
  HARVESTERS: harvesterProps = { 'supreme': [] };
  HARVESTER_QUEUES: harvesterProps = { 'supreme': [] };
  CARDINAL_SOLVERS: any = {};
  
  

  static main(app: Electron.App, browserWindow: typeof BrowserWindow, isDev: boolean):void {
    Main.isDev = isDev;
    Main.BrowserWindow = browserWindow;
    Main.application = app;
    Main.application.on('ready', Main.onReady);
  }

  private static onReady() {
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

  private static readyToShow() {
    Main.mainWindow?.show();

    if (Main.isDev) {
      Main.mainWindow?.webContents.openDevTools({ mode: 'detach' });
    }
  }

  private static workerReady() {
    if (Main.isDev) {
      Main.workerWindow?.webContents.openDevTools({ mode: 'detach' });
    }
  }
}

export default Main;