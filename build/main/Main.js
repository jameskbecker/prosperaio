"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ipc = require("./ipc");
var Main = (function () {
    function Main() {
        this.HARVESTERS = { 'supreme': [] };
        this.HARVESTER_QUEUES = { 'supreme': [] };
        this.CARDINAL_SOLVERS = {};
    }
    Main.main = function (app, browserWindow, isDev) {
        Main.isDev = isDev;
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
    return Main;
}());
exports.default = Main;
//# sourceMappingURL=Main.js.map