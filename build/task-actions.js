var settings = require('electron-settings');
var utilities = require('./library/other').utilities;
var supreme = require('./library/sites').supreme;
var SupremeSafe = supreme.SupremeSafe, SupremeRequest = supreme.SupremeRequest;
function runTask(id) {
    console.log('HELLO');
    var allTasks = settings.get('tasks');
    var taskData = allTasks[id];
    if (!taskData) {
        return console.log('task data undefined');
    }
    if (!activeTasks[id]) {
        switch (taskData.setup.mode) {
            case 'supreme-browser':
                activeTasks[id] = new SupremeSafe(taskData, id);
                return activeTasks[id].run();
            case 'supreme-request':
                activeTasks[id] = new SupremeRequest(taskData, id);
                return activeTasks[id].run();
            default: alert('Configured Site Not Found.');
        }
    }
}
function stopTask(id) {
    console.log('STOPPING', id);
    if (activeTasks[id]) {
        activeTasks[id].callStop();
    }
}
function editTask(id) {
}
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
function deleteTask(id) {
    var currentTasks = settings.get('tasks');
    delete currentTasks[id];
    settings.set('tasks', currentTasks, { prettify: true });
}
function runAll() {
    var taskData = settings.has('tasks') ? settings.get('tasks') : {};
    for (var i = 0; i < Object.keys(taskData).length; i++) {
        var id = Object.keys(taskData)[i];
        runTask(id);
    }
}
function stopAll() {
    for (var i = 0; i < Object.keys(activeTasks).length; i++) {
        var id = Object.keys(activeTasks)[i];
        if (activeTasks[id]) {
            stopTask(id);
        }
        else
            console.log('TASK NOT ACTIVE');
    }
}
function deleteAll() {
    var taskData = settings.has('tasks') ? settings.get('tasks') : {};
    for (var i = 0; i < Object.keys(taskData).length; i++) {
        var id = Object.keys(taskData)[i];
        deleteTask(id);
    }
}
function save(options) {
    if (options === void 0) { options = {}; }
    var allTasks = settings.has('tasks') ? settings.get('tasks') : {};
    var id = utilities.generateId(6);
    allTasks[id] = options;
    settings.set('tasks', allTasks, { prettify: true });
}
module.exports = {
    run: runTask,
    stop: stopTask,
    edit: editTask,
    duplicate: duplicateTask,
    delete: deleteTask,
    runAll: runAll, stopAll: stopAll, deleteAll: deleteAll
};
//# sourceMappingURL=task-actions.js.map