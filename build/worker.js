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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
require("./structure.extensions");
var electron_1 = require("electron");
var settings = __importStar(require("electron-settings"));
var index_1 = require("./library/other/index");
var taskActions = __importStar(require("./task-actions"));
var proxies_1 = require("./library/proxies");
var fs = __importStar(require("fs"));
var Worker = (function () {
    function Worker() {
    }
    Worker.worker = function () {
        electron_1.ipcRenderer.on('reset settings', function () {
            var userKey = settings.has('userKey') ? settings.get('userKey') : '';
            settings.deleteAll();
            settings.set('profiles', {});
            settings.set('tasks', {});
            settings.set('proxies', {});
            settings.set('browser-path', '');
            settings.set('userKey', userKey);
            settings.set('discord', '');
            settings.set('captchaHarvesters', []);
            settings.set('globalMonitorDelay', 1000);
            settings.set('globalErrorDelay', 1000);
            settings.set('globalTimeoutDelay', 5000, { prettify: true });
            electron_1.ipcRenderer.send('reload window');
        });
        electron_1.ipcRenderer.on('import data', function (_event, options) {
            console.log(options);
            fs.readFile(options.paths[0], 'utf8', function (error, data) {
                if (error) {
                    alert('An Error Occured. Please Try Again. [1]');
                }
                else {
                    try {
                        data = JSON.parse(data);
                        switch (options.type) {
                            case 'Tasks':
                                var allTasks = settings.get('tasks');
                                for (var i = 0; i < Object.keys(data).length; i++) {
                                    var taskId = Object.keys(data)[i];
                                    var newTaskId = void 0;
                                    if (!options.overwrite && allTasks.hasOwnProperty(taskId)) {
                                        newTaskId = index_1.utilities.generateId(6);
                                    }
                                    else {
                                        newTaskId = taskId;
                                    }
                                    allTasks[newTaskId] = data[taskId];
                                }
                                settings.set('tasks', allTasks, { prettify: true });
                                electron_1.ipcRenderer.send('sync settings', 'task');
                                break;
                            case 'Profiles':
                                var allProfiles = settings.has('profiles') ? settings.get('profiles') : {};
                                for (var i = 0; i < Object.keys(data).length; i++) {
                                    var profileName = Object.keys(data)[i];
                                    if (options.overwrite || !allProfiles.hasOwnProperty(profileName)) {
                                        console.log('!');
                                        allProfiles[profileName] = data[profileName];
                                    }
                                }
                                settings.set('profiles', allProfiles, { prettify: true });
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
        electron_1.ipcRenderer.on('export data', function (_event, options) {
            var data;
            switch (options.type) {
                case 'Tasks':
                    data = settings.has('tasks') ? settings.get('tasks') : {};
                    break;
                case 'Profiles':
                    data = settings.has('profiles') ? settings.get('profiles') : {};
                    break;
                case 'Proxies':
                    break;
            }
            if (data) {
                fs.writeFile(options.path, JSON.stringify(data, null, '    '), function (error) {
                    if (error)
                        alert(error);
                    else
                        alert("Successfully exported " + options.type + ".");
                });
            }
        });
        electron_1.ipcRenderer.on('export tasks', function (_event, options) {
            var data = settings.has('tasks') ? settings.get('tasks') : [];
            fs.writeFile(options.path, JSON.stringify(data, null, '    '), function (error) {
                if (error) {
                    alert(error);
                }
                else {
                    alert('Successfully Exported Tasks.');
                }
            });
        });
        electron_1.ipcRenderer.on('import profiles', function (_event, path) {
            console.log(path);
        });
        electron_1.ipcRenderer.on('export profiles', function (_event, options) {
            var data = settings.has('profiles') ? settings.get('profiles') : {};
            fs.writeFile(options.path, JSON.stringify(data, null, '    '), function (error) {
                if (error) {
                    alert(error);
                }
                else {
                    alert('Successfully Exported Profiles.');
                }
            });
        });
        electron_1.ipcRenderer.on('delete all profiles', function () {
            settings.set('profiles', {}, { prettify: true });
            electron_1.ipcRenderer.send('sync settings', 'profiles');
        });
        electron_1.ipcRenderer.on('save task', function (_event, args) {
            for (var i = 0; i < args.quantity; i++) {
                var taskData = args.data;
                var allTasks = settings.has('tasks') ? settings.get('tasks') : {};
                var taskId = index_1.utilities.generateId(6);
                allTasks[taskId] = taskData;
                settings.set('tasks', allTasks, { prettify: true });
                electron_1.ipcRenderer.send('sync settings', 'task');
            }
        });
        electron_1.ipcRenderer.on('run task', function (_event, id) {
            taskActions.runTask(id);
        });
        electron_1.ipcRenderer.on('stop task', function (_event, id) {
            taskActions.stopTask(id);
        });
        electron_1.ipcRenderer.on('duplicate task', function (_event, id) {
            taskActions.duplicateTask(id);
            electron_1.ipcRenderer.send('sync settings', 'task');
        });
        electron_1.ipcRenderer.on('delete task', function (_event, id) {
            taskActions.deleteTask(id);
            electron_1.ipcRenderer.send('sync settings', 'task');
        });
        electron_1.ipcRenderer.on('run all tasks', function () {
            taskActions.runAll();
        });
        electron_1.ipcRenderer.on('stop all tasks', function () {
            taskActions.stopAll();
        });
        electron_1.ipcRenderer.on('delete all tasks', function () {
            taskActions.deleteAll();
            electron_1.ipcRenderer.send('sync settings', 'task');
        });
        electron_1.ipcRenderer.on('proxyList.test', function (_event, options) {
            proxies_1.proxyActions.run(options);
        });
        electron_1.ipcRenderer.on('proxyList.testAll', function (_event, options) {
            var allProxies = settings.has('proxies') ? settings.get('proxies') : {};
            if (allProxies.hasOwnProperty(options.listName)) {
                for (var i = 0; i < Object.keys(allProxies[options.listName]).length; i++) {
                    var id = Object.keys(allProxies[options.listName])[i];
                    proxies_1.proxyActions.run({
                        baseUrl: options.baseUrl,
                        id: id,
                        input: allProxies[options.listName][id]
                    });
                }
            }
        });
    };
    Worker.activeProxyLists = {};
    Worker.activeTasks = {};
    Worker.monitors = { 'supreme': { kw: null, url: {} } };
    return Worker;
}());
exports.Worker = Worker;
//# sourceMappingURL=Worker.js.map