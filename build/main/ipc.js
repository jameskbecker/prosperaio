"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
var electron_1 = require("electron");
var Main_1 = require("./Main");
var index_1 = require("./windows/index");
var logger = require('../library/other').logger;
var settings = require('electron-settings');
var CARDINAL_SOLVERS = {};
var HARVESTERS = {
    'supreme': [],
    'kickz': [],
    'kickzpremium': []
};
var HARVESTER_QUEUES = {
    'supreme': [],
    'kickz': [],
    'kickzpremium': []
};
function init() {
    var _this = this;
    electron_1.ipcMain.on('window.reload', function () {
        var _a;
        logger.debug('[MAIN] [IPC] window.reload');
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.reload();
        Main_1.default.mainWindow.webContents.reload();
    });
    electron_1.ipcMain.on('window.minimize', function () {
        var _a;
        logger.debug('[MAIN] [IPC] window.minimize');
        (_a = electron_1.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.minimize();
    });
    electron_1.ipcMain.on('window.close', function () {
        logger.debug('[MAIN] [IPC] window.close');
        electron_1.app.quit();
    });
    electron_1.ipcMain.on('captcha.launch', function (event, args) {
        logger.debug('[MAIN] [IPC] captcha.launch');
        var harvester = new index_1.HarvesterWindow(args.sessionName, args.site);
        harvester.spawn();
        HARVESTERS[args.site].push(harvester);
    });
    electron_1.ipcMain.on('captcha.ready', function (event, args) {
        logger.debug('[MAIN] [IPC] captcha.ready');
        var harvester = HARVESTERS[args.site].find(function (harvester) { return harvester.sessionName === args.sessionName; });
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
    electron_1.ipcMain.on('captcha.clearQueue', function (event, args) {
        logger.debug('[MAIN] [IPC] captcha.clearQueue');
        HARVESTER_QUEUES[args].length = 0;
        event.sender.send('cleared queue', HARVESTER_QUEUES[args].length);
    });
    electron_1.ipcMain.on('captcha.signIn', function (event, args) {
        var _a;
        logger.debug('[MAIN] [IPC] captcha.signIn');
        var sessionName = args.sessionName;
        index_1.GoogleWindow.create(sessionName);
        index_1.GoogleWindow.load();
        (_a = index_1.GoogleWindow.window) === null || _a === void 0 ? void 0 : _a.once('closed', function () {
            index_1.GoogleWindow.window = null;
            Main_1.default.mainWindow.webContents.send('logged into GoogleWindow', {
                type: args.type
            });
        });
    });
    electron_1.ipcMain.on('captcha.signOut', function (event, args) {
        logger.debug('[MAIN] [IPC] captcha.signOut');
        var sessionName = args.name;
        electron_1.session.fromPartition("persist:" + sessionName).clearStorageData();
        Main_1.default.mainWindow.webContents.send('remove session', sessionName);
    });
    electron_1.ipcMain.on('captcha.request', function (event, args) {
        logger.debug('[MAIN] [IPC] captcha.request');
        var readyHarvesters = HARVESTERS[args.type].filter(function (harvester) { return harvester.state === 'ready'; });
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
    electron_1.ipcMain.on('captcha.response', function (event, args) {
        var _a;
        logger.debug('[MAIN] [IPC] captcha.response');
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('captcha response', {
            id: args.id,
            ts: args.ts,
            token: args.token
        });
        var usedHarvester = HARVESTERS[args.site].filter(function (harvester) { return harvester.sessionName === args.sessionName; })[0];
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
    electron_1.ipcMain.on('captcha.closeWindow', function (event, args) {
        logger.debug('[MAIN] [IPC] captcha.closeWindow');
        var updatedHarvesters = HARVESTERS[args.site].filter(function (harvester) {
            var _a;
            if (harvester.sessionName === args.sessionName) {
                (_a = harvester.window) === null || _a === void 0 ? void 0 : _a.close();
            }
            else {
                return true;
            }
        });
        HARVESTERS[args.site] = updatedHarvesters;
    });
    electron_1.ipcMain.on('import data', function (event, args) { return __awaiter(_this, void 0, void 0, function () {
        var paths, shouldOverwrite;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, electron_1.dialog.showOpenDialog(Main_1.default.mainWindow, {
                        message: "Import " + args.type,
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
                    })];
                case 1:
                    paths = _b.sent();
                    if (paths.filePaths.constructor === Array && paths.filePaths.length >= 1) {
                        shouldOverwrite = Boolean(electron_1.dialog.showMessageBox(Main_1.default.mainWindow, {
                            type: 'question',
                            buttons: ['No', 'Yes'],
                            defaultId: 0,
                            message: 'Would you like to Overwrite your Current Data?'
                        }));
                        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('import data', {
                            'type': args.type,
                            'paths': paths,
                            'overwrite': shouldOverwrite
                        });
                    }
                    return [2];
            }
        });
    }); });
    electron_1.ipcMain.on('export data', function (event, args) {
        var _a;
        var path = electron_1.dialog.showSaveDialog(Main_1.default.mainWindow, {
            message: "Export " + args.type,
            defaultPath: args.type + ".prosper",
            buttonLabel: 'Export',
            filters: [
                {
                    name: 'ProsperAIO File',
                    extensions: ['prosper']
                }
            ]
        });
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('export data', {
            path: path,
            type: args.type
        });
    });
    electron_1.ipcMain.on('task.save', function (event, args) {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('save task', args);
    });
    electron_1.ipcMain.on('task.run', function (event, id) {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('run task', id);
    });
    electron_1.ipcMain.on('task.stop', function (event, id) {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('stop task', id);
    });
    electron_1.ipcMain.on('task.duplicate', function (event, id) {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('duplicate task', id);
    });
    electron_1.ipcMain.on('task.delete', function (event, id) {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('delete task', id);
    });
    electron_1.ipcMain.on('task.runAll', function () {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('run all tasks');
    });
    electron_1.ipcMain.on('task.stopAll', function () {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('stop all tasks');
    });
    electron_1.ipcMain.on('task.deleteAll', function () {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('delete all tasks');
    });
    electron_1.ipcMain.on('task.setStatus', function (event, args) {
        Main_1.default.mainWindow.webContents.send('task.setStatus', args);
    });
    electron_1.ipcMain.on('task.setProductName', function (event, args) {
        Main_1.default.mainWindow.webContents.send('task.setProductName', args);
    });
    electron_1.ipcMain.on('task.setSizeName', function (event, args) {
        Main_1.default.mainWindow.webContents.send('task.setSizeName', args);
    });
    electron_1.ipcMain.on('delete all profiles', function () {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('delete all profiles');
    });
    electron_1.ipcMain.on('proxyList.test', function (event, args) {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('proxyList.test', args);
    });
    electron_1.ipcMain.on('proxyList.testAll', function (event, args) {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('proxyList.testAll', args);
    });
    electron_1.ipcMain.on('proxyList.setStatus', function (event, args) {
        Main_1.default.mainWindow.webContents.send('proxyList.setStatus', args);
    });
    electron_1.ipcMain.on('proxyList.removeItem', function (event, args) {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('proxyList.removeItem', args);
    });
    electron_1.ipcMain.on('proxyList.delete', function (event, args) {
        var _a;
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('proxyList.delete', args);
    });
    electron_1.ipcMain.on('proxyList.edit', function () {
    });
    electron_1.ipcMain.on('setup browser mode', function () {
        var _a;
        Main_1.default.mainWindow.webContents.send('installing browser mode');
        (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('download browser exectutable', {
            path: electron_1.app.getPath('appData') + '/ProsperAIO'
        });
    });
    electron_1.ipcMain.on('check for browser executable', function () {
        Main_1.default.mainWindow.webContents.send('check for browser executable');
    });
    electron_1.ipcMain.on('sync settings', function (event, type) {
        Main_1.default.mainWindow.webContents.send('sync settings', type);
    });
    electron_1.ipcMain.on('reset settings', function () { return __awaiter(_this, void 0, void 0, function () {
        var box;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, electron_1.dialog.showMessageBox(Main_1.default.mainWindow, {
                        type: 'warning',
                        buttons: ['Yes', 'No'],
                        defaultId: 1,
                        message: 'Are You Sure You Want to Perform this Action?',
                        detail: 'This will delete all tasks, profiles, google accounts and any other custom settings you may have made.',
                        cancelId: 1
                    })];
                case 1:
                    box = _b.sent();
                    switch (box.response) {
                        case 0:
                            (_a = Main_1.default.workerWindow) === null || _a === void 0 ? void 0 : _a.webContents.send('reset settings');
                            break;
                        case 1:
                            logger.debug('NO');
                            break;
                    }
                    return [2];
            }
        });
    }); });
    electron_1.ipcMain.on('signout', function () {
        settings.delete('userKey');
        electron_1.app.relaunch();
        electron_1.app.exit();
    });
}
exports.init = init;
//# sourceMappingURL=ipc.js.map