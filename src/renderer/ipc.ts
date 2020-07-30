//import './elements';
import { ipcRenderer } from 'electron';
import settings from 'electron-settings';
import * as content from './content';
//const { logger } = require('../library/other');
//const $ = require('jquery');

// declare const installBrowserBtn: any;
// declare const googleAccountLoginBtn: any;
// declare const currentBrowserPath;

//General
var checkboxes: NodeListOf<HTMLInputElement> = document.querySelectorAll('.checkbox-label');
var profileSelector: NodeListOf<HTMLSelectElement> = document.querySelectorAll('.profile-selector');
var accountSelectors: NodeListOf<HTMLSelectElement> = document.querySelectorAll('.captchaAccount-selector');
var countrySelectors: NodeListOf<HTMLSelectElement> = document.querySelectorAll('.country-selector');
var proxyListSelectors: NodeListOf<HTMLSelectElement> = document.querySelectorAll('.proxylist-selector');
var siteSelectors: NodeListOf<HTMLSelectElement> = document.querySelectorAll('.site-selector');
var navigationSelectors: NodeListOf<HTMLElement> = document.querySelectorAll('.nav');
var reloadBtn: any = document.getElementById('reloadApp');
var minimizeBtn: any = document.getElementById('minimizeApp');
var closeBtn: any = document.getElementById('closeApp');

//Dashboard
var tasksHeader: any = document.getElementById('tasksHeader');
//var importTaskBtn:HTMLButtonElement = document.getElementById('importTasks');
//var exportTaskBtn:HTMLButtonElement = document.getElementById('exportTasks');
var globalMonitorDelay: any = document.getElementById('globalMonitor');
var globalErrorDelay: any = document.getElementById('globalError');
var globalTimeoutDelay: any = document.getElementById('globalTimeout');


var taskTable: any = document.getElementById('taskTable');
var taskTableBody: any = document.getElementById('taskTableBody');

var runAllBtn: any = document.getElementById('runAll');
var stopAllBtn: any = document.getElementById('stopAll');
var clearTasksBtn: any = document.getElementById('clearTasks');

//Task Creator
var newTask_Site: any = document.getElementById('taskSite');
var newTask_Profile: any = document.getElementById('taskProfile');
var newTask_Mode: any = document.getElementById('taskMode');
var newTask_RestockMode: any = document.getElementById('newTaskMonitorMode');
var newTask_CheckoutAttempts: any = document.getElementById('taskCheckoutAttempts');
var newTask_Quantity: any = document.getElementById('taskQuantity');

var newTask_CartDelay: any = document.getElementById('taskCartDelay');
var newTask_CheckoutDelay: any = document.getElementById('taskCheckoutDelay');
var newTask_MonitorDelay: any = document.getElementById('taskMonitorDelay');
var newTask_ErrorDelay: any = document.getElementById('taskErrorDelay');
var newTask_Timeout: any = document.getElementById('taskTimeoutDelay');

var newTask_ProxyList: any = document.getElementById('taskProxyList');
var newTask_PriceLimit: any = document.getElementById('taskMaxPrice');
var newTask_StartDate: any = document.getElementById('taskStartDate');
var newTask_StartTime: any = document.getElementById('taskStartTime');

var newTask_Restocks: any = document.getElementById('newTaskRestocks');
var newTask_SkipCaptcha: any = document.getElementById('captchaCheckbox');
var newTask_threeD: any = document.getElementById('threeDCheckbox');

var newTask_products: any = document.getElementById('newTaskProducts');
var newTask_styles: any = document.getElementById('newTaskStyles');
var newTask_sizes: any = document.getElementById('newTaskSizes');

var newTask_SearchInput: any = document.querySelectorAll('input[name="taskSearchInput"]');
var newTask_Category: any = document.querySelectorAll('input[name="taskCategory"]');
var newTask_Size: any = document.querySelectorAll('input[name="taskSize"]');
var newTask_Style: any = document.querySelectorAll('input[name="taskVariant"]');
var newTask_ProductQty: any = document.querySelectorAll('input[name="taskProductQty"]');

var newTask_saveBtn: any = document.getElementById('taskSaveButton');

//Profile Creator
var profilesWrapper: any = document.getElementById('profilesWrapper');
var billingFirst: any = document.getElementById('profileBillingFirst');
var billingLast: any = document.getElementById('profileBillingLast');
var billingEmail: any = document.getElementById('profileBillingEmail');
var billingTelephone: any = document.getElementById('profileBillingTelephone');
var billingAddress1: any = document.getElementById('profileBillingAddress1');
var billingAddress2: any = document.getElementById('profileBillingAddress2');
var billingCity: any = document.getElementById('profileBillingCity');
var billingZip: any = document.getElementById('profileBillingZip');
var billingCountry: any = document.getElementById('profileBillingCountry');
var billingState: any = document.getElementById('profileBillingState');

var useSameShippingAddress: any = document.getElementById('sameShippingCheckbox');

var shippingFirst: any = document.getElementById('profileShippingFirst');
var shippingLast: any = document.getElementById('profileShippingLast');
var shippingEmail: any = document.getElementById('profileShippingEmail');
var shippingTelephone: any = document.getElementById('profileShippingTelephone');
var shippingAddress1: any = document.getElementById('profileShippingAddress1');
var shippingAddress2: any = document.getElementById('profileShippingAddress2');
var shippingCity: any = document.getElementById('profileShippingCity');
var shippingZip: any = document.getElementById('profileShippingZip');
var shippingCountry: any = document.getElementById('profileShippingCountry');
var shippingState: any = document.getElementById('profileShippingState');

var paymentType: any = document.getElementById('profilePaymentType');
var cardNumber: any = document.getElementById('profileCardNumber');
var cardExpiryMonth: any = document.getElementById('profileExpiryMonth');
var cardExpiryYear: any = document.getElementById('profileExpiryYear');
var cardCvv: any = document.getElementById('profileCvv');

var _profileId: any = document.getElementById('profileId');
var profileName: any = document.getElementById('profileName');
var saveProfileBtn: any = document.getElementById('profileSaveButton');
var profileLoader: any = document.getElementById('profileLoader');

//var importProfileBtn: any = document.getElementById('importProfiles');
//var exportProfileBtn: any = document.getElementById('exportProfiles');
var deleteProfileBtn: any = document.getElementById('profileDeleteButton');
var clearProfilesBtn: any = document.getElementById('deleteAllProfiles');

var profileElements: any = [
	document.getElementById('profileId'),
	billingFirst,
	billingLast,
	billingEmail,
	billingTelephone,
	billingAddress1,
	billingAddress2,
	billingCity,
	billingZip,
	billingCountry,
	billingState,

	shippingFirst,
	shippingLast,
	shippingEmail,
	shippingTelephone,
	shippingAddress1,
	shippingAddress2,
	shippingCity,
	shippingZip,
	shippingCountry,
	shippingState,

	paymentType,
	cardNumber,
	cardExpiryMonth,
	cardExpiryYear,
	cardCvv,

	profileName
];
//Proxies
// var importProxyBtn: any = document.getElementById('importProxies');
// var exportProxyBtn: any = document.getElementById('exportProxies');

var proxyHeader: any = document.getElementById('proxy-header');

var proxyListName: any = document.getElementById('proxyListName');
var massProxyInput: any = document.getElementById('proxyInput');
var saveProxyList: any = document.getElementById('saveProxyListBtn');

var proxyListSelectorMain: any = document.getElementById('proxyListSelectorMain');
var proxyTableName: any = document.getElementById('proxyTableName');
var proxyTestSite: any = document.getElementById('proxySiteSelector');
var proxyTestTable: any = document.getElementById('proxyTestResults');
var proxyTestAll: any = document.getElementById('proxyTestAll');
var proxyDeleteList: any = document.getElementById('proxyDeleteList');

//Harvesters
var harverster_Name: any = document.getElementById('harvesterName');
var harvester_SaveBtn: any = document.getElementById('saveHarvesterBtn');
var harvesterTable: any = document.getElementById('harvesterTable');
var harvester_ClearBtn: any = document.getElementById('clearCaptchaAccounts');

//Analytics
var orderTableBody: any = document.getElementById('orderTableBody');
var clearAnalyticsBtn: any = document.getElementById('clearAnalytics');

//Settings
// var monitorProxyList: any = document.getElementById('monitorProxyList');
var currentBrowserPath: any = document.getElementById('currentBrowserPath');
var installBrowserBtn: any = document.getElementById('browserSetup');
var resetBtn: any = document.getElementById('resetAllSettings');
var signoutBtn: any = document.getElementById('signout');
var customDiscord: any = document.getElementById('discordWebhook');
var testDiscordBtn: any = document.getElementById('testDiscordWebhook');

//Footer
var version: any = document.getElementById('version');


interface JsonValue {
	length: any;
}

function init(): void {
	ipcRenderer.on('installing browser mode', (): void => {
		installBrowserBtn.disabled = true;
		installBrowserBtn.innerHTML = 'Installing Safe Mode...';
	});

	ipcRenderer.on('check for browser executable', (): void => {
		let browserPath: string = settings.has('browser-path') ? <string>settings.get('browser-path') : '';
		if (browserPath.length > 0) {
			//installBrowserBtn.disabled = true;
			installBrowserBtn.innerHTML = 'Installed Safe Mode';
			currentBrowserPath.value = settings.has('browser-path') ? settings.get('browser-path') : '';
		}
	});

	ipcRenderer.on('task.setStatus', (event, args): void => {
		let statusCell: any = document.querySelector(`.col-status[data-taskId="${args.id}"`);
		statusCell.innerHTML = args.message;
		statusCell.style.color = args.color;
	});

	ipcRenderer.on('task.setProductName', (event, args): void => {
		let productCell: any = `.col-products[data-id="${args.id}"]`;
		document.querySelector(productCell).innerHTML = args.name;
	});

	ipcRenderer.on('task.setSizeName', (event, args): void => {
		let productCell: any = `.col-size[data-id="${args.id}"]`;
		document.querySelector(productCell).innerHTML = args.name;
	});

	ipcRenderer.on('proxyList.setStatus', (event, args): void => {
		let statusCell: any = document.querySelector(`.col-status[data-proxyId="${args.id}"`);
		statusCell.innerHTML = args.message;
		statusCell.style.color = args.type;
	});

	ipcRenderer.on('sync settings', (event, type): void => {
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

	//  ipcRenderer.on('logged into google', (event, args): void => {
	// 	 if (args.type === 'new') {
	// 		 googleAccountLoginBtn.children[0].classList.value = 'fas fa-check';
	// 		 googleAccountLoginBtn.children[1].innerHTML = 'Linked';
	// 	 }

	//  });

	ipcRenderer.on('remove session', (event, args): void => {
		let allSessions: any = settings.get('captcha-sessions');
		allSessions.splice(allSessions.indexOf(args), 1);
		settings.set('captcha-sessions', allSessions);
		content.harvesters();
	});
}

export default { init };