const settings = require('electron-settings');
const { utilities } = require('./library/other');

//Bot Module Imports
const { supreme } = require('./library/sites');
const { SupremeHybrid, SupremeRequest } = supreme;

function runTask (id) {
	let allTasks = settings.get('tasks');
	const taskData = allTasks[id];
	if (!taskData) {
		return console.log('task data undefined');
	}
	if (!activeTasks[id]) {
		switch (taskData.setup.mode) {
			case 'supreme-browser':
				activeTasks[id] = new SupremeHybrid(taskData, id);
				return activeTasks[id].run();
		
			case 'supreme-request':
				activeTasks[id] = new SupremeRequest(taskData, id);
				return activeTasks[id].run();

			default: alert('Configured Site Not Found.')
		}
	}

}

function stopTask (id) {
	console.log('STOPPING', id)
	if (activeTasks[id]) {
		activeTasks[id].callStop();
	}
}

function editTask (id) {

}

function duplicateTask (parentId) {
	try {
		let tasks = settings.has('tasks') ? settings.get('tasks') : {};
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
	} catch(error) { }
}

function deleteTask(id) {
	let currentTasks = settings.get('tasks');
	delete currentTasks[id]
	settings.set('tasks', currentTasks, { prettify: true });
}

function runAll() {
	let taskData = settings.has('tasks') ? settings.get('tasks') : {};
	for (let i = 0; i < Object.keys(taskData).length; i++) {
		let id = Object.keys(taskData)[i];
		runTask(id)
	}
}

function stopAll() {
	for (let i = 0; i < Object.keys(activeTasks).length; i++) {
		let id = Object.keys(activeTasks)[i];
		if (activeTasks[id]) {
		 stopTask(id)
		}
		else console.log('TASK NOT ACTIVE')
	}
}

function deleteAll() {
	let taskData = settings.has('tasks') ? settings.get('tasks') : {};
	for (let i = 0; i < Object.keys(taskData).length; i++) {
		let id = Object.keys(taskData)[i];
		deleteTask(id)
	}
}

function save (options = {}) {
	let allTasks = settings.has('tasks') ? settings.get('tasks') : {};
	let id = utilities.generateId(6);
	allTasks[id] = options;
	settings.set('tasks', allTasks, { prettify: true });
}

module.exports = {
	run: 	runTask,
	stop: stopTask,
	edit: editTask,
	duplicate: duplicateTask,
	delete: deleteTask,
	runAll, stopAll, deleteAll
}