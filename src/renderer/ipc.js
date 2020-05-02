const { ipcRenderer } = require('electron');
const settings = require('electron-settings');
const content = require('./content');
const { logger } = require('../library/other');
const $ = require('jquery');

exports.init = () => {
	ipcRenderer.on('installing browser mode', (event, args) => {
		installBrowserBtn.disabled = true;
		installBrowserBtn.innerHTML = 'Installing Browser Mode...';
	})

	ipcRenderer.on('check for browser executable', (event, args) => {
		if (settings.has('browser-path') && settings.get('browser-path').length > 0) {
			installBrowserBtn.disabled = true;
			installBrowserBtn.innerHTML = 'Installed Browser Mode';
		}
	});

	ipcRenderer.on('task.setStatus', (event, args) => {
		logger.debug('[RENDERER] [IPC] task.setStatus')
		let statusCell = document.querySelector(`.col-status[data-taskId="${args.id}"`);
		statusCell.innerHTML = args.message;
		statusCell.style.color = args.color;
	});

	ipcRenderer.on('task.setProductName', (event, args) => {
		let productCell = `.col-products[data-id="${args.id}"]`;
		document.querySelector(productCell).innerHTML = args.name;
	});

	ipcRenderer.on('task.setSizeName', (event, args) => {
		let productCell = `.col-size[data-id="${args.id}"]`;
		document.querySelector(productCell).innerHTML = args.name;
	})

	ipcRenderer.on('proxyList.setStatus', (event, args) => {
		let statusCell = document.querySelector(`.col-status[data-proxyId="${args.id}"`);
		statusCell.innerHTML = args.message;
		statusCell.style.color = args.type;
	})

	ipcRenderer.on('sync settings', (event, type) => {
		switch (type) {
			case 'task': content.tasks();
			break;
			case 'profiles': content.profiles();
			break;
			case 'proxies': content.proxySelectors();
			break;
			case 'orders': content.orders();
			break;
		}
	})

	// ipcRenderer.on('update tasks', (event, args) => {
	// 	content.addTableRow(taskTable, [
	// 		{
	// 			text: args.id,
	// 			class: 'col-id'
	// 		},
	// 		{
	// 			text: args.setup.profile,
	// 			class: 'col-profile'
	// 		},
	// 		{
	// 			text: args.site.label,
	// 			class: 'col-site'
	// 		},
	// 		{
	// 			text: args.setup.mode,
	// 			class: 'col-mode'
	// 		},
	// 		{
	// 			text: args.products,
	// 			class: 'col-products'
	// 		},
	// 		{
	// 			text: args.additional.proxy,
	// 			class: 'col-taskProxy'
	// 		},
	// 		{
	// 			text: args.products[0].size,
	// 			class: 'col-size'
	// 		},
	// 		{
	// 			text: args.additional.timer,
	// 			class: 'col-timer'
	// 		},
	// 		{
	// 			text: 'Idle',
	// 			class: 'col-status'
	// 		},
	// 		{
	// 			text: 	'Actions',
	// 			class: 'col-actions'
	// 		},

		
	// 	])
	// })

	ipcRenderer.on('logged into google', (event, args) => {
		if (args.type === 'new') {
			googleAccountLoginBtn.children[0].classList.value = 'fas fa-check';
			googleAccountLoginBtn.children[1].innerHTML = 'Linked';
		}
		
	});

	ipcRenderer.on('remove session', (event, args) => {
		let allSessions = settings.get('captcha-sessions');
		allSessions.splice(allSessions.indexOf(args), 1);
		settings.set('captcha-sessions', allSessions);
		content.harvesters();
	});

	ipcRenderer.on('test', (event, args) => {
		event.reply = 'hi';
	})
}