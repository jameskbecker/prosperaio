"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.save = exports.deleteAll = exports.stopAll = exports.runAll = exports.deleteTask = exports.duplicateTask = exports.stopTask = exports.runTask = void 0;
const Worker_1 = require("./Worker");
const electron_settings_1 = __importDefault(require("electron-settings"));
const other_1 = require("./library/other");
const supreme_1 = require("./library/sites/supreme");
function runTask(id) {
    let allTasks = electron_settings_1.default.get('tasks');
    const taskData = allTasks[id];
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
        let tasks = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : {};
        let parentTask;
        for (let i = 0; i < Object.keys(tasks).length; i++) {
            let id = Object.keys(tasks)[i];
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
    let currentTasks = electron_settings_1.default.get('tasks');
    delete currentTasks[id];
    electron_settings_1.default.set('tasks', currentTasks, { prettify: true });
}
exports.deleteTask = deleteTask;
function runAll() {
    let taskData = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : {};
    for (let i = 0; i < Object.keys(taskData).length; i++) {
        let id = Object.keys(taskData)[i];
        runTask(id);
    }
}
exports.runAll = runAll;
function stopAll() {
    for (let i = 0; i < Object.keys(Worker_1.Worker.activeTasks).length; i++) {
        let id = Object.keys(Worker_1.Worker.activeTasks)[i];
        if (Worker_1.Worker.activeTasks[id]) {
            stopTask(id);
        }
        else
            console.log('TASK NOT ACTIVE');
    }
}
exports.stopAll = stopAll;
function deleteAll() {
    let taskData = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : {};
    for (let i = 0; i < Object.keys(taskData).length; i++) {
        let id = Object.keys(taskData)[i];
        deleteTask(id);
    }
}
exports.deleteAll = deleteAll;
function save(options = {}) {
    let allTasks = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : {};
    let id = other_1.utilities.generateId(6);
    allTasks[id] = options;
    electron_settings_1.default.set('tasks', allTasks, { prettify: true });
}
exports.save = save;
//# sourceMappingURL=task-actions.js.map