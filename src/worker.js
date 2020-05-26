const electron = require('electron');
const ipcWorker = electron.ipcRenderer;
const puppeteer = require('puppeteer-extra');

const pluginStealth = require("puppeteer-extra-plugin-stealth")
puppeteer.use(pluginStealth())
const settings = require('electron-settings');
const utilities = require('./library/other/utilities');
const taskActions = require('./task-actions');
const { proxyActions } = require('./library/proxies');
const fs = require('fs');

String.prototype.capitalise = function() {
	return this.substring(0, 1).toUpperCase() + this.substring(1);
}

global.activeProxyLists = {};
global.activeTasks = {};
global.monitors = {
	'supreme': {
		kw: null,
		url: {}
	}
}

Object.prototype.contains = function(keyValuePair) {
	let key = Object.keys(keyValuePair)[0];
	 if (this.hasOwnProperty(key) && this[key] === keyValuePair[key]) return true
	 else return false
}


module.exports = {
	init: function() {
		ipcWorker.on('download browser exectutable', async (events, args) => {
			console.log('downloading')
			const browserFetcher = puppeteer.createBrowserFetcher({
				path: args.path
			});
			const browserExecutable = await browserFetcher.download('637110', (downloadedBytes, totalBytes) => {
				console.log(`${downloadedBytes}/${totalBytes}`)
			});
			settings.set('browser-path', browserExecutable.executablePath, {prettify: true});
			ipcWorker.send('check for browser executable');
		});
 
		ipcWorker.on('reset settings', (event, args) => {
			let userKey = settings.has('userKey') ? settings.get('userKey') : '';
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
			settings.set('globalTimeoutDelay', 5000, {prettify: true});

			ipcWorker.send('reload window');
		});	

		ipcWorker.on('import data', (event, options) => { 
			console.log(options);
			fs.readFile(options.paths[0], 'utf8', (error, data) => {
				if (error) {
					alert('An Error Occured. Please Try Again. [1]');
				}
				else {
					try {
						data = JSON.parse(data);
						switch(options.type) {
							case 'Tasks':
								let allTasks = settings.get('tasks');
								for (let i = 0; i < Object.keys(data).length; i++) {
									let taskId = Object.keys(data)[i];
									let newTaskId;
									
									if (!options.overwrite && allTasks.hasOwnProperty(taskId)) {
										newTaskId = utilities.generateId(6);
									}
									else { newTaskId = taskId; }
									allTasks[newTaskId] = data[taskId];
								}
								settings.set('tasks', allTasks, {prettify: true});
								ipcWorker.send('sync settings', 'task');
								break;
							
							case 'Profiles':
								let allProfiles = settings.has('profiles') ? settings.get('profiles') : {};
								
								for (let i = 0; i < Object.keys(data).length; i++) {
									let profileName = Object.keys(data)[i];
									if (options.overwrite || !allProfiles.hasOwnProperty(profileName)) {
										console.log('!')
										allProfiles[profileName] = data[profileName];
									}
								}
								settings.set('profiles', allProfiles, { prettify: true })
								ipcWorker.send('sync settings', 'profiles');
								break;
							
							case 'Proxies':
								let allProxies = settings.has('proxies') ? settings.get('proxies') : {}
								break;
						}
						
						
						
					}
					catch (error) {
						alert('An Error Occured. Please Try Again. [2]');
						console.log(error)
					}
				}
			})
		});

		ipcWorker.on('export data', (event, options) => {
			let data;
			switch(options.type) {
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
				fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error) => {
					if (error) alert(error);
					else alert(`Successfully exported ${options.type}.`);
				})
			}
		})

		ipcWorker.on('export tasks', (event, options) => {
			let data = settings.has('tasks') ? settings.get('tasks') : [];
			fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error) => {
				if (error) {
					alert(error);
				}
				else {
					alert('Successfully Exported Tasks.');
				}
			})
		});

		ipcWorker.on('import profiles', (event, path) => {
			console.log(path);
		});

		ipcWorker.on('export profiles', (event, options) => {
			let data = settings.has('profiles') ? settings.get('profiles') : {};
			fs.writeFile(options.path, JSON.stringify(data, null, '    '), (error) => {
				if (error) {
					alert(error);
				}
				else {
					alert('Successfully Exported Profiles.');
				}
			})
		});

		ipcWorker.on('delete all profiles', (event, args) => {
			settings.set('profiles', {}, { prettify: true });
			ipcWorker.send('sync settings', 'profiles');
		})
		
		ipcWorker.on('save task', (event, args) => {
			for (let i = 0; i < args.quantity; i++) {
				let taskData = args.data;
				let allTasks = settings.has('tasks') ? settings.get('tasks') : {};
				let taskId = utilities.generateId(6);
				allTasks[taskId] = taskData;
				settings.set('tasks', allTasks, {prettify: true});
				ipcWorker.send('sync settings', 'task');
			}
		});

		ipcWorker.on('run task', (event, id) => {
			taskActions.run(id);
		})

		ipcWorker.on('stop task', (event, id) => {
			taskActions.stop(id);
		})

		ipcWorker.on('duplicate task', (event, id) => {
			taskActions.duplicate(id);
			ipcWorker.send('sync settings', 'task');
		});

		ipcWorker.on('delete task', (event, id) => {
			taskActions.delete(id);
			ipcWorker.send('sync settings', 'task');
		})

		ipcWorker.on('run all tasks', (event, id) => {
			taskActions.runAll();
		});

		ipcWorker.on('stop all tasks', (event, id) => {
			taskActions.stopAll();
		});

		ipcWorker.on('delete all tasks', (event, id) => {
			taskActions.deleteAll();
			ipcWorker.send('sync settings', 'task');
		});

		ipcWorker.on('proxyList.test', (event, options) => {
			proxyActions.run(options);
		})

		ipcWorker.on('proxyList.testAll', (event, options) => {
			let allProxies = settings.has('proxies') ? settings.get('proxies') : {};
			if (allProxies.hasOwnProperty(options.listName)) {
				for (let i = 0; i < Object.keys(allProxies[options.listName]).length; i++) {
					let id = Object.keys(allProxies[options.listName])[i];
					proxyActions.run({
						baseUrl: options.baseUrl,
						id,
						input: allProxies[options.listName][id]
					})
				}
			}
		})
	}
}