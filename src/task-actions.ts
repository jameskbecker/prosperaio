import { Worker } from './Worker';
import * as settings from 'electron-settings';
import { utilities } from './library/other';

//Bot Module Imports
import { SupremeSafe, SupremeRequest } from './library/sites/supreme';

export function runTask (id:any):void {
	let allTasks:any = settings.get('tasks');
	const taskData:any = allTasks[id];
	if (!taskData) {
		return console.log('task data undefined');
	}
	if (!Worker.activeTasks[id]) {
		switch (taskData.setup.mode) {
			case 'supreme-browser':
				Worker.activeTasks[id] = new SupremeSafe(taskData, id);
				return Worker.activeTasks[id].run();
		
			case 'supreme-request':
				Worker.activeTasks[id] = new SupremeRequest(taskData, id);
				return Worker.activeTasks[id].run();

			default: alert('Configured Site Not Found.');
		}
	}	

}

export function stopTask (id:any):void {
	console.log('STOPPING', id);
	if (Worker.activeTasks[id]) {
		Worker.activeTasks[id].callStop();
	}
}

// function editTask (id) {

// }

export function duplicateTask (parentId:any):void {
	try {
		let tasks:any = settings.has('tasks') ? settings.get('tasks') : {};
		let parentTask:any;
		for (let i:any = 0; i < Object.keys(tasks).length; i++) {
			let id:any = Object.keys(tasks)[i];
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

export function deleteTask(id:any):void {
	let currentTasks:any = settings.get('tasks');
	delete currentTasks[id];
	settings.set('tasks', currentTasks, { prettify: true });
}

export function runAll():void {
	let taskData:any = settings.has('tasks') ? settings.get('tasks') : {};
	for (let i:any = 0; i < Object.keys(taskData).length; i++) {
		let id:any = Object.keys(taskData)[i];
		runTask(id);
	}
}

export function stopAll():void {
	for (let i:any = 0; i < Object.keys(Worker.activeTasks).length; i++) {
		let id:any = Object.keys(Worker.activeTasks)[i];
		if (Worker.activeTasks[id]) {
		 stopTask(id);
		}
		else console.log('TASK NOT ACTIVE');
	}
}

export function deleteAll():void {
	let taskData:any = settings.has('tasks') ? settings.get('tasks') : {};
	for (let i:any = 0; i < Object.keys(taskData).length; i++) {
		let id:any = Object.keys(taskData)[i];
		deleteTask(id);
	}
}

export function save (options:any = {}):void {
	let allTasks:any = settings.has('tasks') ? settings.get('tasks') : {};
	let id:any = utilities.generateId(6);
	allTasks[id] = options;
	settings.set('tasks', allTasks, { prettify: true });
}