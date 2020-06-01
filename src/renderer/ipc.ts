import './elements';
import { ipcRenderer } from 'electron';
import * as settings from 'electron-settings';
import { default as content } from './content';
//const { logger } = require('../library/other');
//const $ = require('jquery');

// declare const installBrowserBtn:any;
// declare const googleAccountLoginBtn:any;
// declare const currentBrowserPath;

interface JsonValue {
	length: any;
}

function init ():void {
	ipcRenderer.on('installing browser mode', ():void => {
		installBrowserBtn.disabled = true;
		installBrowserBtn.innerHTML = 'Installing Browser Mode...';
	});

	ipcRenderer.on('check for browser executable', ():void => {
		let browserPath:any = settings.has('browser-path') ? settings.get('browser-path') : [];
		if (browserPath.length > 0) {
			//installBrowserBtn.disabled = true;
			installBrowserBtn.innerHTML = 'Installed Browser Mode';
			currentBrowserPath.value = settings.has('browser-path') ? settings.get('browser-path') : '';
		}
	});

 ipcRenderer.on('task.setStatus', (event, args):void => {
	 let statusCell:any = document.querySelector(`.col-status[data-taskId="${args.id}"`);
	 statusCell.innerHTML = args.message;
	 statusCell.style.color = args.color;
 });

 ipcRenderer.on('task.setProductName', (event, args):void => {
	 let productCell:any = `.col-products[data-id="${args.id}"]`;
	 document.querySelector(productCell).innerHTML = args.name;
 });

 ipcRenderer.on('task.setSizeName', (event, args):void => {
	 let productCell:any = `.col-size[data-id="${args.id}"]`;
	 document.querySelector(productCell).innerHTML = args.name;
 });

 ipcRenderer.on('proxyList.setStatus', (event, args):void => {
	 let statusCell:any = document.querySelector(`.col-status[data-proxyId="${args.id}"`);
	 statusCell.innerHTML = args.message;
	 statusCell.style.color = args.type;
 });

 ipcRenderer.on('sync settings', (event, type):void => {
	 console.log(type);
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
 });

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

//  ipcRenderer.on('logged into google', (event, args):void => {
// 	 if (args.type === 'new') {
// 		 googleAccountLoginBtn.children[0].classList.value = 'fas fa-check';
// 		 googleAccountLoginBtn.children[1].innerHTML = 'Linked';
// 	 }
	 
//  });

 ipcRenderer.on('remove session', (event, args):void => {
	 let allSessions:any = settings.get('captcha-sessions');
	 allSessions.splice(allSessions.indexOf(args), 1);
	 settings.set('captcha-sessions', allSessions);
	 content.harvesters();
 });
}

export default { init };