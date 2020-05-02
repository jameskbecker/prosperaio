const settings = require('electron-settings');
const { Kickz, SupremeRequest, SupremeBrowser, SupremeHybrid } = require('../sites');
const { utilities } = require('../other');

function save (options = {}) {
	let allTasks = settings.has('tasks') ? settings.get('tasks') : {};
	let id = utilities.generateId(6);
	allTasks[id] = options;
	settings.set('tasks', allTasks, { prettify: true });
}

function runTask (id) {
	let allTasks = settings.get('tasks');
	const taskData = allTasks[id];
	if (!taskData) {
		console.log('task data undefined');
	}
	else {
		if (!activeTasks[id]) {
			switch (taskData.setup.mode) {
				case 'kickz-wire':
					activeTasks[id] = new Kickz(taskData, id);
					return activeTasks[id].run();
				case 'kickz-paypal':
					activeTasks[id] = new Kickz(taskData, id);
					return activeTasks[id].run();

				case 'supreme-browser':
					activeTasks[id] = new SupremeBrowser(taskData, id);
					return activeTasks[id].run();

				case 'supreme-hybrid':
					activeTasks[id] = new SupremeHybrid(taskData, id);
					return activeTasks[id].run();
			
				case 'supreme-request':
					activeTasks[id] = new SupremeRequest(taskData, id);
					return activeTasks[id].run();

				default: alert('Configured Site Not Found.')
			}
		}
	}

}

function stopTask (id) {
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
	for (id in activeTasks) {
		if (activeTasks[id]) {
			activeTasks[id].callStop();
		}
	}
}

function deleteAll() {
	let taskData = settings.has('tasks') ? settings.get('tasks') : {};
	for (let i = 0; i < Object.keys(taskData).length; i++) {
		let id = Object.keys(taskData)[i];
		deleteTask(id)
	}
}
module.exports = {
	run: 	runTask,
	stop: stopTask,
	edit: editTask,
	duplicate: duplicateTask,
	delete: deleteTask,
	runAll, stopAll, deleteAll
}