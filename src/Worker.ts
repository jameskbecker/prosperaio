import './structure.extensions';
import { ipcRenderer as ipcWorker } from 'electron';
import  puppeteer from 'puppeteer-core';
import settings from 'electron-settings';
import { utilities } from './library/other/index';
import * as taskActions from './task-actions';
import { proxyActions } from './library/proxies';
import * as fs from 'fs';

export class Worker {
	static activeProxyLists: any = {};
	static activeTasks: any = {};
	static monitors: any = { 'supreme': { kw: null, url: {} } };

	static worker(): void {
		ipcWorker.on('download browser exectutable', function (_events: any, args: any): void {
			console.log('downloading');
			const browserFetcher: any = puppeteer.createBrowserFetcher({
				path: args.path
			});
			browserFetcher.download('637110')
				.then((browserExecutable: any): void => {
					settings.set('browser-path', browserExecutable.executablePath, { prettify: true });
					ipcWorker.send('check for browser executable');
				});

		});

		ipcWorker.on('reset settings', (): void => {
			let userKey: any = settings.has('userKey') ? settings.get('userKey') : '';
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

		ipcWorker.on('import data', (_event: any, options: any): void => {
			console.log(options);
			fs.readFile(options.paths[0], 'utf8', (error: any, data: any): void => {
				if (error) {
					alert('An Error Occured. Please Try Again. [1]');
				}
				else {
					try {
						data = JSON.parse(data);
						switch (options.type) {
							case 'Tasks':
								let allTasks: any = settings.get('tasks');
								for (let i: any = 0; i < Object.keys(data).length; i++) {
									let taskId: any = Object.keys(data)[i];
									let newTaskId: any;

									if (!options.overwrite && allTasks.hasOwnProperty(taskId)) {
										newTaskId = utilities.generateId(6);
									}
									else { newTaskId = taskId; }
									allTasks[newTaskId] = data[taskId];
								}
								settings.set('tasks', allTasks, { prettify: true });
								ipcWorker.send('sync settings', 'task');
								break;

							case 'Profiles':
								let allProfiles: any = settings.has('profiles') ? settings.get('profiles') : {};

								for (let i: any = 0; i < Object.keys(data).length; i++) {
									let profileName: any = Object.keys(data)[i];
									if (options.overwrite || !allProfiles.hasOwnProperty(profileName)) {
										console.log('!');
										allProfiles[profileName] = data[profileName];
									}
								}
								settings.set('profiles', allProfiles, { prettify: true });
								ipcWorker.send('sync settings', 'profiles');
								break;

							case 'Proxies':
								//let allProxies = settings.has('proxies') ? settings.get('proxies') : {};
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

		ipcWorker.on('export data', (_event: any, options: any): void => {
			let data: any;
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
				fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error: any): void => {
					if (error) alert(error);
					else alert(`Successfully exported ${options.type}.`);
				});
			}
		});

		ipcWorker.on('export tasks', (_event: any, options: any): void => {
			let data: any = settings.has('tasks') ? settings.get('tasks') : [];
			fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error: any): void => {
				if (error) {
					alert(error);
				}
				else {
					alert('Successfully Exported Tasks.');
				}
			});
		});

		ipcWorker.on('import profiles', (_event: any, path: any): void => {
			console.log(path);
		});

		ipcWorker.on('export profiles', (_event: any, options: any): void => {
			let data: any = settings.has('profiles') ? settings.get('profiles') : {};
			fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error: any): any => {
				if (error) {
					alert(error);
				}
				else {
					alert('Successfully Exported Profiles.');
				}
			});
		});

		ipcWorker.on('delete all profiles', (): void => {
			settings.set('profiles', {}, { prettify: true });
			ipcWorker.send('sync settings', 'profiles');
		});

		ipcWorker.on('save task', (_event: any, args: any): void => {
			for (let i: any = 0; i < args.quantity; i++) {
				let taskData: any = args.data;
				let allTasks: any = settings.has('tasks') ? settings.get('tasks') : {};
				let taskId: any = utilities.generateId(6);
				allTasks[taskId] = taskData;
				settings.set('tasks', allTasks, { prettify: true });
				ipcWorker.send('sync settings', 'task');
			}
		});

		ipcWorker.on('run task', (_event: any, id: any): void => {
			taskActions.runTask(id);
		});

		ipcWorker.on('stop task', (_event: any, id: any): void => {
			taskActions.stopTask(id);
		});

		ipcWorker.on('duplicate task', (_event: any, id: any): void => {
			taskActions.duplicateTask(id);
			ipcWorker.send('sync settings', 'task');
		});

		ipcWorker.on('delete task', (_event: any, id: any): void => {
			taskActions.deleteTask(id);
			ipcWorker.send('sync settings', 'task');
		});

		ipcWorker.on('run all tasks', (): void => {
			taskActions.runAll();
		});

		ipcWorker.on('stop all tasks', (): void => {
			taskActions.stopAll();
		});

		ipcWorker.on('delete all tasks', (): void => {
			taskActions.deleteAll();
			ipcWorker.send('sync settings', 'task');
		});

		ipcWorker.on('proxyList.test', (_event: any, options: any): void => {
			proxyActions.run(options);
		});

		ipcWorker.on('proxyList.testAll', (_event: any, options: any): void => {
			let allProxies: any = settings.has('proxies') ? settings.get('proxies') : {};
			if (allProxies.hasOwnProperty(options.listName)) {
				for (let i: any = 0; i < Object.keys(allProxies[options.listName]).length; i++) {
					let id: any = Object.keys(allProxies[options.listName])[i];
					proxyActions.run({
						baseUrl: options.baseUrl,
						id,
						input: allProxies[options.listName][id]
					});
				}
			}
		});
	}
}
/*

var activeProxyLists:any = {};
var activeTasks:any = {};
var monitors:any = {
	'supreme': {
		kw: null,
		url: {}
	}
};




function init():void {
	ipcWorker.on(
		'download browser exectutable',

		function (_events:any, args:any):void {
			console.log('downloading');
			const browserFetcher:any = puppeteer.createBrowserFetcher({
				path: args.path
			});
			browserFetcher.download('637110')
			.then((browserExecutable:any):void => {
				settings.set('browser-path', browserExecutable.executablePath, { prettify: true });
				ipcWorker.send('check for browser executable');
			});

		});

	ipcWorker.on('reset settings', ():void => {
		let userKey:any = settings.has('userKey') ? settings.get('userKey') : '';
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

	ipcWorker.on('import data', (_event:any, options:any):void => {
		console.log(options);
		fs.readFile(options.paths[0], 'utf8', (error:any, data:any):void => {
			if (error) {
				alert('An Error Occured. Please Try Again. [1]');
			}
			else {
				try {
					data = JSON.parse(data);
					switch (options.type) {
						case 'Tasks':
							let allTasks:any = settings.get('tasks');
							for (let i:any = 0; i < Object.keys(data).length; i++) {
								let taskId:any = Object.keys(data)[i];
								let newTaskId:any;

								if (!options.overwrite && allTasks.hasOwnProperty(taskId)) {
									newTaskId = utilities.generateId(6);
								}
								else { newTaskId = taskId; }
								allTasks[newTaskId] = data[taskId];
							}
							settings.set('tasks', allTasks, { prettify: true });
							ipcWorker.send('sync settings', 'task');
							break;

						case 'Profiles':
							let allProfiles:any = settings.has('profiles') ? settings.get('profiles') : {};

							for (let i:any = 0; i < Object.keys(data).length; i++) {
								let profileName:any = Object.keys(data)[i];
								if (options.overwrite || !allProfiles.hasOwnProperty(profileName)) {
									console.log('!');
									allProfiles[profileName] = data[profileName];
								}
							}
							settings.set('profiles', allProfiles, { prettify: true });
							ipcWorker.send('sync settings', 'profiles');
							break;

						case 'Proxies':
							//let allProxies = settings.has('proxies') ? settings.get('proxies') : {};
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

	ipcWorker.on('export data', (_event:any, options:any):void => {
		let data:any;
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
			fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error:any):void => {
				if (error) alert(error);
				else alert(`Successfully exported ${options.type}.`);
			});
		}
	});

	ipcWorker.on('export tasks', (_event:any, options:any):void => {
		let data:any = settings.has('tasks') ? settings.get('tasks') : [];
		fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error:any):void => {
			if (error) {
				alert(error);
			}
			else {
				alert('Successfully Exported Tasks.');
			}
		});
	});

	ipcWorker.on('import profiles', (_event:any, path:any):void => {
		console.log(path);
	});

	ipcWorker.on('export profiles', (_event:any, options:any):void => {
		let data:any = settings.has('profiles') ? settings.get('profiles') : {};
		fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error:any):any => {
			if (error) {
				alert(error);
			}
			else {
				alert('Successfully Exported Profiles.');
			}
		});
	});

	ipcWorker.on('delete all profiles', ():void => {
		settings.set('profiles', {}, { prettify: true });
		ipcWorker.send('sync settings', 'profiles');
	});

	ipcWorker.on('save task', (_event:any, args:any):void => {
		for (let i:any = 0; i < args.quantity; i++) {
			let taskData:any = args.data;
			let allTasks:any = settings.has('tasks') ? settings.get('tasks') : {};
			let taskId:any = utilities.generateId(6);
			allTasks[taskId] = taskData;
			settings.set('tasks', allTasks, { prettify: true });
			ipcWorker.send('sync settings', 'task');
		}
	});

	ipcWorker.on('run task', (_event:any, id:any):void => {
		taskActions.run(id);
	});

	ipcWorker.on('stop task', (_event:any, id:any):void => {
		taskActions.stop(id);
	});

	ipcWorker.on('duplicate task', (_event:any, id:any):void => {
		taskActions.duplicate(id);
		ipcWorker.send('sync settings', 'task');
	});

	ipcWorker.on('delete task', (_event:any, id:any):void => {
		taskActions.delete(id);
		ipcWorker.send('sync settings', 'task');
	});

	ipcWorker.on('run all tasks', ():void => {
		taskActions.runAll();
	});

	ipcWorker.on('stop all tasks', ():void => {
		taskActions.stopAll();
	});

	ipcWorker.on('delete all tasks', ():void => {
		taskActions.deleteAll();
		ipcWorker.send('sync settings', 'task');
	});

	ipcWorker.on('proxyList.test', (_event:any, options:any):void => {
		proxyActions.run(options);
	});

	ipcWorker.on('proxyList.testAll', (_event:any, options:any):void => {
		let allProxies:any = settings.has('proxies') ? settings.get('proxies') : {};
		if (allProxies.hasOwnProperty(options.listName)) {
			for (let i:any = 0; i < Object.keys(allProxies[options.listName]).length; i++) {
				let id:any = Object.keys(allProxies[options.listName])[i];
				proxyActions.run({
					baseUrl: options.baseUrl,
					id,
					input: allProxies[options.listName][id]
				});
			}
		}
	});
}
export default { init };
*/