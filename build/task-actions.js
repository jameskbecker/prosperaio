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
exports.save = exports.deleteAll = exports.stopAll = exports.runAll = exports.deleteTask = exports.duplicateTask = exports.stopTask = exports.runTask = void 0;
var Worker_1 = require("./Worker");
var settings = __importStar(require("electron-settings"));
var other_1 = require("./library/other");
var supreme_1 = require("./library/sites/supreme");
function runTask(id) {
    var allTasks = settings.get('tasks');
    var taskData = allTasks[id];
    if (!taskData) {
        return console.log('task data undefined');
    }
    if (!Worker_1.Worker.activeTasks[id]) {
        switch (taskData.setup.mode) {
            case 'supreme-browser':
                Worker_1.Worker.activeTasks[id] = new supreme_1.SupremeSafe(taskData, id);
                return Worker_1.Worker.activeTasks[id].run();
            case 'supreme-request':
                Worker_1.Worker.activeTasks[id] = new supreme_1.SupremeRequest(taskData, id);
                return Worker_1.Worker.activeTasks[id].run();
            default: alert('Configured Site Not Found.');
        }
    }
}
exports.runTask = runTask;
function stopTask(id) {
    console.log('STOPPING', id);
    if (Worker_1.Worker.activeTasks[id]) {
        Worker_1.Worker.activeTasks[id].callStop();
    }
}
exports.stopTask = stopTask;
function duplicateTask(parentId) {
    try {
        var tasks = settings.has('tasks') ? settings.get('tasks') : {};
        var parentTask = void 0;
        for (var i = 0; i < Object.keys(tasks).length; i++) {
            var id = Object.keys(tasks)[i];
            if (id === parentId) {
                parentTask = tasks[id];
                break;
            }
        }
        if (parentTask) {
            save(parentTask);
        }
    }
    catch (error) { }
}
exports.duplicateTask = duplicateTask;
function deleteTask(id) {
    var currentTasks = settings.get('tasks');
    delete currentTasks[id];
    settings.set('tasks', currentTasks, { prettify: true });
}
exports.deleteTask = deleteTask;
function runAll() {
    var taskData = settings.has('tasks') ? settings.get('tasks') : {};
    for (var i = 0; i < Object.keys(taskData).length; i++) {
        var id = Object.keys(taskData)[i];
        runTask(id);
    }
}
exports.runAll = runAll;
function stopAll() {
    for (var i = 0; i < Object.keys(Worker_1.Worker.activeTasks).length; i++) {
        var id = Object.keys(Worker_1.Worker.activeTasks)[i];
        if (Worker_1.Worker.activeTasks[id]) {
            stopTask(id);
        }
        else
            console.log('TASK NOT ACTIVE');
    }
}
exports.stopAll = stopAll;
function deleteAll() {
    var taskData = settings.has('tasks') ? settings.get('tasks') : {};
    for (var i = 0; i < Object.keys(taskData).length; i++) {
        var id = Object.keys(taskData)[i];
        deleteTask(id);
    }
}
exports.deleteAll = deleteAll;
function save(options) {
    if (options === void 0) { options = {}; }
    var allTasks = settings.has('tasks') ? settings.get('tasks') : {};
    var id = other_1.utilities.generateId(6);
    allTasks[id] = options;
    settings.set('tasks', allTasks, { prettify: true });
}
exports.save = save;
//# sourceMappingURL=task-actions.js.map