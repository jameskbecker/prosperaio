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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
require("./structure.extensions");
const electron_1 = require("electron");
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const electron_settings_1 = __importDefault(require("electron-settings"));
const index_1 = require("./library/other/index");
const taskActions = __importStar(require("./task-actions"));
const proxies_1 = require("./library/proxies");
const fs = __importStar(require("fs"));
class Worker {
    static worker() {
        electron_1.ipcRenderer.on('download browser exectutable', function (_events, args) {
            console.log('downloading');
            const browserFetcher = puppeteer_core_1.default.createBrowserFetcher({
                path: args.path
            });
            browserFetcher.download('637110')
                .then((browserExecutable) => {
                electron_settings_1.default.set('browser-path', browserExecutable.executablePath, { prettify: true });
                electron_1.ipcRenderer.send('check for browser executable');
            });
        });
        electron_1.ipcRenderer.on('reset settings', () => {
            let userKey = electron_settings_1.default.has('userKey') ? electron_settings_1.default.get('userKey') : '';
            electron_settings_1.default.deleteAll();
            electron_settings_1.default.set('profiles', {});
            electron_settings_1.default.set('tasks', {});
            electron_settings_1.default.set('proxies', {});
            electron_settings_1.default.set('browser-path', '');
            electron_settings_1.default.set('userKey', userKey);
            electron_settings_1.default.set('discord', '');
            electron_settings_1.default.set('captchaHarvesters', []);
            electron_settings_1.default.set('globalMonitorDelay', 1000);
            electron_settings_1.default.set('globalErrorDelay', 1000);
            electron_settings_1.default.set('globalTimeoutDelay', 5000, { prettify: true });
            electron_1.ipcRenderer.send('reload window');
        });
        electron_1.ipcRenderer.on('import data', (_event, options) => {
            console.log(options);
            fs.readFile(options.paths[0], 'utf8', (error, data) => {
                if (error) {
                    alert('An Error Occured. Please Try Again. [1]');
                }
                else {
                    try {
                        data = JSON.parse(data);
                        switch (options.type) {
                            case 'Tasks':
                                let allTasks = electron_settings_1.default.get('tasks');
                                for (let i = 0; i < Object.keys(data).length; i++) {
                                    let taskId = Object.keys(data)[i];
                                    let newTaskId;
                                    if (!options.overwrite && allTasks.hasOwnProperty(taskId)) {
                                        newTaskId = index_1.utilities.generateId(6);
                                    }
                                    else {
                                        newTaskId = taskId;
                                    }
                                    allTasks[newTaskId] = data[taskId];
                                }
                                electron_settings_1.default.set('tasks', allTasks, { prettify: true });
                                electron_1.ipcRenderer.send('sync settings', 'task');
                                break;
                            case 'Profiles':
                                let allProfiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
                                for (let i = 0; i < Object.keys(data).length; i++) {
                                    let profileName = Object.keys(data)[i];
                                    if (options.overwrite || !allProfiles.hasOwnProperty(profileName)) {
                                        console.log('!');
                                        allProfiles[profileName] = data[profileName];
                                    }
                                }
                                electron_settings_1.default.set('profiles', allProfiles, { prettify: true });
                                electron_1.ipcRenderer.send('sync settings', 'profiles');
                                break;
                            case 'Proxies':
                                break;
                        }
                    }
                    catch (error) {
                        alert('An Error Occured. Please Try Again. [2]');
                        console.log(error);
                    }
                }
            });
        });
        electron_1.ipcRenderer.on('export data', (_event, options) => {
            let data;
            switch (options.type) {
                case 'Tasks':
                    data = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : {};
                    break;
                case 'Profiles':
                    data = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
                    break;
                case 'Proxies':
                    break;
            }
            if (data) {
                fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error) => {
                    if (error)
                        alert(error);
                    else
                        alert(`Successfully exported ${options.type}.`);
                });
            }
        });
        electron_1.ipcRenderer.on('export tasks', (_event, options) => {
            let data = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : [];
            fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error) => {
                if (error) {
                    alert(error);
                }
                else {
                    alert('Successfully Exported Tasks.');
                }
            });
        });
        electron_1.ipcRenderer.on('import profiles', (_event, path) => {
            console.log(path);
        });
        electron_1.ipcRenderer.on('export profiles', (_event, options) => {
            let data = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
            fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error) => {
                if (error) {
                    alert(error);
                }
                else {
                    alert('Successfully Exported Profiles.');
                }
            });
        });
        electron_1.ipcRenderer.on('delete all profiles', () => {
            electron_settings_1.default.set('profiles', {}, { prettify: true });
            electron_1.ipcRenderer.send('sync settings', 'profiles');
        });
        electron_1.ipcRenderer.on('save task', (_event, args) => {
            for (let i = 0; i < args.quantity; i++) {
                let taskData = args.data;
                let allTasks = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : {};
                let taskId;
                if (args.taskId)
                    taskId = args.taskId;
                else
                    taskId = index_1.utilities.generateId(6);
                allTasks[taskId] = taskData;
                electron_settings_1.default.set('tasks', allTasks, { prettify: true });
                electron_1.ipcRenderer.send('sync settings', 'task');
            }
        });
        electron_1.ipcRenderer.on('run task', (_event, id) => {
            taskActions.runTask(id);
        });
        electron_1.ipcRenderer.on('stop task', (_event, id) => {
            taskActions.stopTask(id);
        });
        electron_1.ipcRenderer.on('duplicate task', (_event, id) => {
            taskActions.duplicateTask(id);
            electron_1.ipcRenderer.send('sync settings', 'task');
        });
        electron_1.ipcRenderer.on('delete task', (_event, id) => {
            taskActions.deleteTask(id);
            electron_1.ipcRenderer.send('sync settings', 'task');
        });
        electron_1.ipcRenderer.on('run all tasks', () => {
            taskActions.runAll();
        });
        electron_1.ipcRenderer.on('stop all tasks', () => {
            taskActions.stopAll();
        });
        electron_1.ipcRenderer.on('delete all tasks', () => {
            taskActions.deleteAll();
            electron_1.ipcRenderer.send('sync settings', 'task');
        });
        electron_1.ipcRenderer.on('proxyList.test', (_event, options) => {
            proxies_1.proxyActions.run(options);
        });
        electron_1.ipcRenderer.on('proxyList.testAll', (_event, options) => {
            let allProxies = electron_settings_1.default.has('proxies') ? electron_settings_1.default.get('proxies') : {};
            if (allProxies.hasOwnProperty(options.listName)) {
                for (let i = 0; i < Object.keys(allProxies[options.listName]).length; i++) {
                    let id = Object.keys(allProxies[options.listName])[i];
                    proxies_1.proxyActions.run({
                        baseUrl: options.baseUrl,
                        id,
                        input: allProxies[options.listName][id]
                    });
                }
            }
        });
    }
}
exports.Worker = Worker;
Worker.activeProxyLists = {};
Worker.activeTasks = {};
Worker.monitors = { 'supreme': { kw: null, url: {} } };
//# sourceMappingURL=Worker.js.map