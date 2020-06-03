"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ipc = __importStar(require("./ipc"));
var Main = (function () {
    function Main() {
    }
    Main.main = function (app, browserWindow, isDev) {
        Main.isDev = isDev;
        Main.isMac = process.platform === 'darwin';
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('ready', Main.onReady);
    };
    Main.onReady = function () {
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
            Main.mainWindow.loadURL("file:///" + Main.application.getAppPath() + "/assets/index.html");
            Main.workerWindow.loadURL("file:///" + Main.application.getAppPath() + "/assets/worker.html");
            ipc.init();
        }
        else {
            Main.loginWindow.loadURL("file:///" + Main.application.getAppPath() + "/assets/authenticator.html");
            Main.loginWindow.show();
        }
    };
    Main.mainOnClose = function () {
    };
    Main.workerOnClose = function () {
    };
    Main.readyToShow = function () {
        var _a, _b;
        (_a = Main.mainWindow) === null || _a === void 0 ? void 0 : _a.show();
        if (Main.isDev) {
            (_b = Main.mainWindow) === null || _b === void 0 ? void 0 : _b.webContents.openDevTools({ mode: 'detach' });
        }
    };
    Main.workerReady = function () {
        var _a;
        if (Main.isDev) {
            (_a = Main.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.openDevTools({ mode: 'detach' });
        }
    };
    Main.buildMenu = function () {
        __spreadArrays((Main.isMac ? [{
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
            }] : []), [
            {
                label: 'File',
                submenu: [
                    {
                        role: Main.isMac ? 'close' : 'quit'
                    },
                    { type: 'separator' },
                    {
                        label: 'Run All Tasks',
                        accelerator: 'CommandOrControl+Shift+R',
                        click: function () {
                            if (Main.workerWindow) {
                                Main.workerWindow.webContents.send('run all tasks');
                            }
                        }
                    },
                    {
                        label: 'Stop All Tasks',
                        accelerator: 'CommandOrControl+Shift+S',
                        click: function () {
                            if (Main.workerWindow) {
                                Main.workerWindow.webContents.send('stop all tasks');
                            }
                        }
                    },
                    {
                        label: 'Delete All Tasks',
                        accelerator: 'CommandOrControl+Shift+D',
                        click: function () {
                            if (Main.workerWindow) {
                                Main.workerWindow.webContents.send('delete all tasks');
                            }
                        }
                    }
                ]
            },
            {
                label: 'Edit',
                submenu: __spreadArrays([
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' }
                ], (Main.isMac ? [
                    { role: 'pasteAndMatchStyle' },
                    { role: 'delete' },
                    { role: 'selectAll' },
                    { type: 'separator' },
                ] : [
                    { role: 'delete' },
                    { type: 'separator' },
                    { role: 'selectAll' }
                ]))
            },
            {
                label: 'Window',
                submenu: [
                    {
                        label: 'Reload Data',
                        click: function () {
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
        ]);
    };
    Main.HARVESTERS = { 'supreme': [] };
    Main.HARVESTER_QUEUES = { 'supreme': [] };
    Main.CARDINAL_SOLVERS = {};
    return Main;
}());
exports.default = Main;
//# sourceMappingURL=Main.js.map