var ipcWorker = window.require('electron');
var puppeteer = window.require('puppeteer');
var settings = window.require('electron-settings');
var utilities = window.require('./library/other').utilities;
var taskActions = window.require('./task-actions');
var proxyActions = window.require('./library/proxies').proxyActions;
var fs = window.require('fs');
String.prototype.capitalise = function () {
    return this.substring(0, 1).toUpperCase() + this.substring(1);
};
global.activeProxyLists = {};
global.activeTasks = {};
global.monitors = {
    'supreme': {
        kw: null,
        url: {}
    }
};
Object.prototype.contains = function (keyValuePair) {
    var key = Object.keys(keyValuePair)[0];
    if (this.hasOwnProperty(key) && this[key] === keyValuePair[key])
        return true;
    else
        return false;
};
function init() {
    ipcWorker.on('download browser exectutable', function (events, args) {
        console.log('downloading');
        var browserFetcher = puppeteer.createBrowserFetcher({
            path: args.path
        });
        browserFetcher.download('637110')
            .then(function (browserExecutable) {
            settings.set('browser-path', browserExecutable.executablePath, { prettify: true });
            ipcWorker.send('check for browser executable');
        });
    });
    ipcWorker.on('reset settings', function () {
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
        ipcWorker.send('reload window');
    });
    ipcWorker.on('import data', function (event, options) {
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
                                    newTaskId = utilities.generateId(6);
                                }
                                else {
                                    newTaskId = taskId;
                                }
                                allTasks[newTaskId] = data[taskId];
                            }
                            settings.set('tasks', allTasks, { prettify: true });
                            ipcWorker.send('sync settings', 'task');
                            break;
                        case 'Profiles':
                            var allProfiles = settings.has('profiles') ? settings.get('profiles') : {};
                            for (var i = 0; i < Object.keys(data).length; i++) {
                                var profileName_1 = Object.keys(data)[i];
                                if (options.overwrite || !allProfiles.hasOwnProperty(profileName_1)) {
                                    console.log('!');
                                    allProfiles[profileName_1] = data[profileName_1];
                                }
                            }
                            settings.set('profiles', allProfiles, { prettify: true });
                            ipcWorker.send('sync settings', 'profiles');
                            break;
                        case 'Proxies':
                            var allProxies = settings.has('proxies') ? settings.get('proxies') : {};
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
    ipcWorker.on('export data', function (event, options) {
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
    ipcWorker.on('export tasks', function (event, options) {
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
    ipcWorker.on('import profiles', function (event, path) {
        console.log(path);
    });
    ipcWorker.on('export profiles', function (event, options) {
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
    ipcWorker.on('delete all profiles', function () {
        settings.set('profiles', {}, { prettify: true });
        ipcWorker.send('sync settings', 'profiles');
    });
    ipcWorker.on('save task', function (event, args) {
        for (var i = 0; i < args.quantity; i++) {
            var taskData = args.data;
            var allTasks = settings.has('tasks') ? settings.get('tasks') : {};
            var taskId = utilities.generateId(6);
            allTasks[taskId] = taskData;
            settings.set('tasks', allTasks, { prettify: true });
            ipcWorker.send('sync settings', 'task');
        }
    });
    ipcWorker.on('run task', function (event, id) {
        taskActions.run(id);
    });
    ipcWorker.on('stop task', function (event, id) {
        taskActions.stop(id);
    });
    ipcWorker.on('duplicate task', function (event, id) {
        taskActions.duplicate(id);
        ipcWorker.send('sync settings', 'task');
    });
    ipcWorker.on('delete task', function (event, id) {
        taskActions.delete(id);
        ipcWorker.send('sync settings', 'task');
    });
    ipcWorker.on('run all tasks', function () {
        taskActions.runAll();
    });
    ipcWorker.on('stop all tasks', function () {
        taskActions.stopAll();
    });
    ipcWorker.on('delete all tasks', function () {
        taskActions.deleteAll();
        ipcWorker.send('sync settings', 'task');
    });
    ipcWorker.on('proxyList.test', function (event, options) {
        proxyActions.run(options);
    });
    ipcWorker.on('proxyList.testAll', function (event, options) {
        var allProxies = settings.has('proxies') ? settings.get('proxies') : {};
        if (allProxies.hasOwnProperty(options.listName)) {
            for (var i = 0; i < Object.keys(allProxies[options.listName]).length; i++) {
                var id = Object.keys(allProxies[options.listName])[i];
                proxyActions.run({
                    baseUrl: options.baseUrl,
                    id: id,
                    input: allProxies[options.listName][id]
                });
            }
        }
    });
}
module.exports = init;
//# sourceMappingURL=worker.js.map