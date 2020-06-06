//import './elements';
import { ipcRenderer, remote } from 'electron';
import * as mousetrap from 'mousetrap';
import settings from 'electron-settings';
import { default as content } from './content';
import * as profile from './profiles';
import { default as ipc } from './ipc';
import { utilities } from '../library/other';
//import { sites } from '../library/configuration';

import { elements } from './elements';
console.log(elements);
//General
var checkboxes:NodeListOf<HTMLInputElement> = document.querySelectorAll('.checkbox-label');
var profileSelector:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.profile-selector');
var accountSelectors:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.captchaAccount-selector');
var countrySelectors:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.country-selector');
var proxyListSelectors:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.proxylist-selector');
var siteSelectors:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.site-selector');
var navigationSelectors:NodeListOf<HTMLElement> = document.querySelectorAll('.nav');
var reloadBtn:any = document.getElementById('reloadApp');
var minimizeBtn:any = document.getElementById('minimizeApp');
var closeBtn:any = document.getElementById('closeApp');
 
//Dashboard
var tasksHeader:any = document.getElementById('tasksHeader');
//var importTaskBtn:HTMLButtonElement = document.getElementById('importTasks');
//var exportTaskBtn:HTMLButtonElement = document.getElementById('exportTasks');
var globalMonitorDelay:any = document.getElementById('globalMonitor');
var globalErrorDelay:any = document.getElementById('globalError');
var globalTimeoutDelay:any = document.getElementById('globalTimeout');


var taskTable:any = document.getElementById('taskTable');
var taskTableBody:any = document.getElementById('taskTableBody');

var runAllBtn:any = document.getElementById('runAll');
var stopAllBtn:any = document.getElementById('stopAll');
var clearTasksBtn:any = document.getElementById('clearTasks');

//Task Creator
var newTask_Site:any = document.getElementById('taskSite');
var newTask_Profile:any = document.getElementById('taskProfile');
var newTask_Mode:any = document.getElementById('taskMode');
var newTask_RestockMode:any = document.getElementById('newTaskMonitorMode');
var newTask_CheckoutAttempts:any = document.getElementById('taskCheckoutAttempts');
var newTask_Quantity:any = document.getElementById('taskQuantity');

var newTask_CartDelay:any = document.getElementById('taskCartDelay');
var newTask_CheckoutDelay:any = document.getElementById('taskCheckoutDelay');
var newTask_MonitorDelay:any = document.getElementById('taskMonitorDelay');
var newTask_ErrorDelay:any = document.getElementById('taskErrorDelay');
var newTask_Timeout:any = document.getElementById('taskTimeoutDelay');

var newTask_ProxyList:any = document.getElementById('taskProxyList');
var newTask_PriceLimit:any = document.getElementById('taskMaxPrice');
var newTask_StartDate:any = document.getElementById('taskStartDate');
var newTask_StartTime:any = document.getElementById('taskStartTime');

var newTask_Restocks:any = document.getElementById('newTaskRestocks');
var newTask_SkipCaptcha:any = document.getElementById('captchaCheckbox');
var newTask_threeD:any = document.getElementById('threeDCheckbox');

var newTask_products:any = document.getElementById('newTaskProducts');
var newTask_styles:any = document.getElementById('newTaskStyles');
var newTask_sizes:any = document.getElementById('newTaskSizes');

var newTask_SearchInput:any = document.querySelectorAll('input[name="taskSearchInput"]');
var newTask_Category:any = document.querySelectorAll('input[name="taskCategory"]');
var newTask_Size:any = document.querySelectorAll('input[name="taskSize"]');
var newTask_Style:any = document.querySelectorAll('input[name="taskVariant"]');
var newTask_ProductQty:any = document.querySelectorAll('input[name="taskProductQty"]');

var newTask_saveBtn:any = document.getElementById('taskSaveButton');

//Profile Creator
var profilesWrapper:any = document.getElementById('profilesWrapper');
var billingFirst:any = document.getElementById('profileBillingFirst');
var billingLast:any = document.getElementById('profileBillingLast');
var billingEmail:any = document.getElementById('profileBillingEmail');
var billingTelephone:any = document.getElementById('profileBillingTelephone');
var billingAddress1:any = document.getElementById('profileBillingAddress1');
var billingAddress2:any = document.getElementById('profileBillingAddress2');
var billingCity:any = document.getElementById('profileBillingCity');
var billingZip:any = document.getElementById('profileBillingZip');
var billingCountry:any = document.getElementById('profileBillingCountry');
var billingState:any = document.getElementById('profileBillingState'); 

var useSameShippingAddress:any = document.getElementById('sameShippingCheckbox');

var shippingFirst:any = document.getElementById('profileShippingFirst');
var shippingLast:any = document.getElementById('profileShippingLast');
var shippingEmail:any = document.getElementById('profileShippingEmail');
var shippingTelephone:any = document.getElementById('profileShippingTelephone');
var shippingAddress1:any = document.getElementById('profileShippingAddress1');
var shippingAddress2:any = document.getElementById('profileShippingAddress2');
var shippingCity:any = document.getElementById('profileShippingCity');
var shippingZip:any = document.getElementById('profileShippingZip');
var shippingCountry:any = document.getElementById('profileShippingCountry');
var shippingState:any = document.getElementById('profileShippingState');

var paymentType:any = document.getElementById('profilePaymentType');
var cardNumber:any = document.getElementById('profileCardNumber');
var cardExpiryMonth:any = document.getElementById('profileExpiryMonth');
var cardExpiryYear:any = document.getElementById('profileExpiryYear');
var cardCvv:any = document.getElementById('profileCvv');

var _profileId:any = document.getElementById('profileId');
var profileName:any = document.getElementById('profileName');
var saveProfileBtn:any = document.getElementById('profileSaveButton');
var profileLoader:any = document.getElementById('profileLoader');

//var importProfileBtn:any = document.getElementById('importProfiles');
//var exportProfileBtn:any = document.getElementById('exportProfiles');
var deleteProfileBtn:any = document.getElementById('profileDeleteButton');
var clearProfilesBtn:any = document.getElementById('deleteAllProfiles');

var profileElements:any = [
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
// var importProxyBtn:any = document.getElementById('importProxies');
// var exportProxyBtn:any = document.getElementById('exportProxies');

var proxyHeader:any = document.getElementById('proxy-header');

var proxyListName:any = document.getElementById('proxyListName');
var massProxyInput:any = document.getElementById('proxyInput');
var saveProxyList:any = document.getElementById('saveProxyListBtn');

var proxyListSelectorMain:any = document.getElementById('proxyListSelectorMain');
var proxyTableName:any = document.getElementById('proxyTableName');
var proxyTestSite:any = document.getElementById('proxySiteSelector');
var proxyTestTable:any = document.getElementById('proxyTestResults');
var proxyTestAll:any = document.getElementById('proxyTestAll');
var proxyDeleteList:any = document.getElementById('proxyDeleteList');

//Harvesters
var harverster_Name:any = document.getElementById('harvesterName');
var harvester_SaveBtn:any = document.getElementById('saveHarvesterBtn');
var harvesterTable:any = document.getElementById('harvesterTable');
var harvester_ClearBtn:any = document.getElementById('clearCaptchaAccounts');

//Analytics
var orderTableBody:any = document.getElementById('orderTableBody');
var clearAnalyticsBtn:any = document.getElementById('clearAnalytics');

//Settings
// var monitorProxyList:any = document.getElementById('monitorProxyList');
var currentBrowserPath:any = document.getElementById('currentBrowserPath');
var installBrowserBtn:any = document.getElementById('browserSetup');
var resetBtn:any = document.getElementById('resetAllSettings');
var signoutBtn:any = document.getElementById('signout');
var customDiscord:any = document.getElementById('discordWebhook');
var testDiscordBtn:any = document.getElementById('testDiscordWebhook');

//Footer
var version:any = document.getElementById('version');




/* --------- GENERAL --------- */
interface JsonValue {
	length: any;
}

ipc.init();
ipcRenderer.send('check for browser executable');
let tasks: any = settings.has('tasks') ? settings.get('tasks'): null;
if (!tasks || tasks.constructor === []) settings.set('tasks', {});
if (!settings.has('profiles')) settings.set('profiles', {});

//footerVersion.innerHTML = 'Version 3.4.0'
try {
	content.tasks();
	content.profiles();
	content.sites();
	content.countries();
	content.proxySelectors();
	content.harvesters();
	content.orders();
} catch(err) { console.error(err); }

/* --------- assets: BANNER --------- */
signoutBtn.onclick = function ():void { ipcRenderer.send('signout'); };
//reloadBtn.onclick = function ():void { ipcRenderer.send('window.reload'); };
minimizeBtn.onclick = function ():void { ipcRenderer.send('window.minimize'); };
closeBtn.onclick = function ():void { ipcRenderer.send('window.close'); };

navigationSelectors.forEach((page, i):void => {
	function navigationHandler():void {
		let selectedPageId:any = page.getAttribute('data-page');
		let selectedPage:any = document.getElementById(selectedPageId);

		if (selectedPage.classList.contains('page-hidden')) {
			let activeNavigation:any = document.querySelector('.nav-active');
			let activePageId:any = activeNavigation.getAttribute('data-page');
			let activePage:any = document.getElementById(activePageId);

			activeNavigation.classList.remove('nav-active');
			page.classList.add('nav-active');

			selectedPage.classList.remove('page-hidden');
			activePage.classList.add('page-hidden');
		}
	}

	page.onclick = navigationHandler;
	mousetrap.bind(`command+${i + 1}`, navigationHandler);
});

/* --------- Tasks Page --------- */
// importTaskBtn.onclick = function() {
// 	ipcRenderer.send('import data', {
// 		type: 'Tasks'
// 	});
// }

// exportTaskBtn.onclick = function() {
// 	ipcRenderer.send('export data', {
// 		type: 'Tasks'
// 	});
// }

if (!settings.has('globalMonitorDelay')) {
	settings.set('globalMonitorDelay', globalMonitorDelay.value);
} else {
	globalMonitorDelay.value = settings.get('globalMonitorDelay');
}

if (!settings.has('globalErrorDelay')) {
	settings.set('globalErrorDelay', globalMonitorDelay.value);
} else {
	globalErrorDelay.value = settings.get('globalErrorDelay');
}

if (!settings.has('globalTimeoutDelay')) {
	settings.set('globalTimeoutDelay', globalTimeoutDelay.value);
} else {
	globalTimeoutDelay.value = settings.get('globalTimeoutDelay');
}

globalMonitorDelay.onchange = function ():void {
	settings.set('globalMonitorDelay', this.value, { prettify: true });
};
globalErrorDelay.onchange = function ():void {
	settings.set('globalErrorDelay', this.value, { prettify: true });
};
globalTimeoutDelay.onchange = function ():void {
	settings.set('globalTimeoutDelay', this.value, { prettify: true });
};

runAllBtn.onclick = function ():void { ipcRenderer.send('task.runAll'); };
stopAllBtn.onclick = function ():void { ipcRenderer.send('task.stopAll'); };
clearTasksBtn.onclick = function ():void { ipcRenderer.send('task.deleteAll'); };

/* --------- Modal: NEW TASK --------- */
newTask_Mode.disabled = true;
newTask_RestockMode.disabled = true;

newTask_SearchInput[0].placeholder = 'Please Select Site.';
newTask_Style[0].disabled = true;
newTask_Category[0].disabled = true;
newTask_Size[0].disabled = true;
newTask_ProductQty[0].disabled = true;
newTask_SearchInput[0].disabled = true;

newTask_saveBtn.onclick = function ():void {
	try {
		if (newTask_Mode.value === 'browser' && !settings.has('browser-path')) {
			alert('Browser Mode Not Installed.');
			return;
		}
		let products:any = [];
		for (let i:any = 0; i < newTask_SearchInput.length; i++) {
			let product:any = {
				'searchInput': newTask_SearchInput[i].value,
				'category': newTask_Category[i].value,
				'size': newTask_Size[i].value,
				'style': newTask_Style[i].value,
				'productQty': newTask_ProductQty[i].value
			};
			products.push(product);
		}
		let timerComps:any = newTask_StartTime.value.split(':');
		let timerVal:any = timerComps.length === 2 ? newTask_StartTime.value + ':00' : newTask_StartTime.value;
		let taskData:any = {
			'setup': {
				profile: newTask_Profile.value ? newTask_Profile.value : '',
				mode: newTask_Mode.value ? newTask_Mode.value : '',
				restockMode: newTask_RestockMode.value ? newTask_RestockMode.value : '',
				checkoutAttempts: newTask_CheckoutAttempts.value ? parseInt(newTask_CheckoutAttempts.value) : 1,
			},
			'site': newTask_Site.value ? newTask_Site.value : '',
			'delays': {
				cart: newTask_CartDelay.value ? parseInt(newTask_CartDelay.value) : 0,
				checkout: newTask_CheckoutDelay.value ? parseInt(newTask_CheckoutDelay.value) : 0
			},
			'additional': {
				proxyList: newTask_ProxyList.value ? newTask_ProxyList.value : '',
				maxPrice: newTask_PriceLimit.value ? parseInt(newTask_PriceLimit.value) : 0,
				timer: newTask_StartDate.value ? `${newTask_StartDate.value} ${timerVal}` : ' ',

				monitorRestocks: newTask_Restocks ? newTask_Restocks.checked : true,
				skipCaptcha: newTask_SkipCaptcha ? newTask_SkipCaptcha.checked : false,
				enableThreeDS: newTask_threeD ? newTask_threeD.checked : false
				
			},
			'products': products
		};

		ipcRenderer.send('task.save', {
			data: taskData,
			quantity: parseInt(newTask_Quantity.value)
		});
	} catch(err) { console.error(err); }
};

/* --------- Page: PROFILES ---------- */
billingCountry.onchange = function ():void {
	try {
		content.states('profileBillingState', this.value);
	} catch(err) { console.error(err); }
};

shippingCountry.onchange = function ():void {
	try {
		content.states('profileShippingState', this.value);
	} catch(err) { console.error(err); }
};

billingFirst.oninput = function ():void {
	try {
		if (useSameShippingAddress.checked) shippingFirst.value = this.value;
	} catch(err) { console.error(err); }
};

billingLast.oninput = function ():void {
	try {
		if (useSameShippingAddress.checked) shippingLast.value = this.value;
	} catch(err) { console.error(err); }
};

billingEmail.oninput = function ():void {
	if (useSameShippingAddress.checked) shippingEmail.value = this.value;
};

billingTelephone.oninput = function ():void {
	if (useSameShippingAddress.checked) shippingTelephone.value = this.value;
};

billingAddress1.oninput = function ():void {
	if (useSameShippingAddress.checked) shippingAddress1.value = this.value;
};

billingAddress2.oninput = function ():void {
	if (useSameShippingAddress.checked) shippingAddress2.value = this.value;
};

billingCity.oninput = function ():void {
	if (useSameShippingAddress.checked) shippingCity.value = this.value;
};

billingZip.oninput = function ():void {
	if (useSameShippingAddress.checked) shippingZip.value = this.value;
};

billingCountry.oninput = function ():void {
	if (useSameShippingAddress.checked) {
		shippingCountry.value = this.value;
		shippingCountry.onchange(new Event(''));
	}
};

billingState.oninput = function ():void {
	if (useSameShippingAddress.checked) shippingState.value = this.value;
};

useSameShippingAddress.onchange = function ():void {
	shippingFirst.value = this.checked ? billingFirst.value : '';
	shippingFirst.disabled = this.checked ? true : false;

	shippingLast.value = this.checked ? billingLast.value : '';
	shippingLast.disabled = this.checked ? true : false;

	shippingEmail.value = this.checked ? billingEmail.value : '';
	shippingEmail.disabled = this.checked ? true : false;

	shippingTelephone.value = this.checked ? billingTelephone.value : '';
	shippingTelephone.disabled = this.checked ? true : false;

	shippingAddress1.value = this.checked ? billingAddress1.value : '';
	shippingAddress1.disabled = this.checked ? true : false;

	shippingAddress2.value = this.checked ? billingAddress2.value : '';
	shippingAddress2.disabled = this.checked ? true : false;

	shippingCity.value = this.checked ? billingCity.value : '';
	shippingCity.disabled = this.checked ? true : false;

	shippingZip.value = this.checked ? billingZip.value : '';
	shippingZip.disabled = this.checked ? true : false;

	shippingCountry.value = this.checked ? billingCountry.value : 'GB';
	shippingCountry.disabled = this.checked ? true : false;
	content.states('profileShippingState', shippingCountry.value);
	
	shippingState.value = this.checked ? billingState.value : '';
	//shippingState.disabled = this.checked ? true : false;
};

cardNumber.onkeyup = function ():void {
	switch (paymentType.value) {
		case 'master':
		case 'visa':
			this.value = this.value.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
			this.maxLength = 19;
			break;
		case 'american_express':
			this.maxLength = 17;
	}

};

saveProfileBtn.onclick = function ():void {
	let profileData:any = {
		profileName: profileName.value,
		billing: {
			'first': billingFirst.value,
			'last': billingLast.value,
			'email': billingEmail.value,
			'telephone': billingTelephone.value,
			'address1': billingAddress1.value,
			'address2': billingAddress2.value,
			'city': billingCity.value,
			'zip': billingZip.value,
			'country': billingCountry.value,
			'state': billingState.value
		},
		shipping: {
			'first': shippingFirst.value,
			'last': shippingLast.value,
			'email': shippingEmail.value,
			'telephone': shippingTelephone.value,
			'address1': shippingAddress1.value,
			'address2': shippingAddress2.value,
			'city': shippingCity.value,
			'zip': shippingZip.value,
			'country': shippingCountry.value,
			'state': shippingState.value
		},
		payment: {
			'type': paymentType.value,
			'cardNumber': cardNumber.value,
			'expiryMonth': cardExpiryMonth.value,
			'expiryYear': cardExpiryYear.value,
			'cvv': cardCvv.value
		}
	};
	let profileId: any = document.getElementById('profileId');
	profile.save(profileId.value, profileData);
	content.profiles();
	for (let i:any = 0; i < profileElements.length; i++) {
		profileElements[i].value = profileElements[i].id.includes('Country') ? 'GB' : '';
	}
};

clearProfilesBtn.onclick = function():void {
	settings.set('profiles', {}, {prettify: true});
	content.profiles();
};

// importProfileBtn.onclick = function () {
// 	ipcRenderer.send('import data', {
// 		type: 'Profiles'
// 	});
// }

// exportProfileBtn.onclick = function () {
// 	ipcRenderer.send('export data', {
// 		type: 'Profiles'
// 	});
// }

// deleteProfileBtn.onclick = function () {
// 	profile.delete(profileLoader.value);
// }

// profileLoader.onchange = function () {
// 	let profileData = settings.has('profiles') ? settings.get(`profiles.${this.value}`) : {};
// 	let billingData = profileData.billing;
// 	let shippingData = profileData.shipping;
// 	let paymentData = profileData.payment;
	
// 	billingFirst.value = billingData.first;
// 	billingLast.value = billingData.last;
// 	billingEmail.value = billingData.email;
// 	billingTelephone.value = billingData.telephone;
// 	billingAddress1.value = billingData.address1;
// 	billingAddress2.value = billingData.address2;
// 	billingCity.value = billingData.city;
// 	billingZip.value = billingData.zip;
// 	billingCountry.value = billingData.country;
// 	billingState.value = billingData.state;

// 	shippingFirst.value = shippingData.first;
// 	shippingLast.value = shippingData.last;
// 	shippingEmail.value = shippingData.email;
// 	shippingTelephone.value = shippingData.telephone;
// 	shippingAddress1.value = shippingData.address1;
// 	shippingAddress2.value = shippingData.address2;
// 	shippingCity.value = shippingData.city;
// 	shippingZip.value = shippingData.zip;
// 	shippingCountry.value = shippingData.country;
// 	shippingState.value = shippingData.state;

// 	paymentType.value = paymentData.type;
// 	cardNumber.value = paymentData.cardNumber;
// 	cardExpiryMonth.value = paymentData.expiryMonth;
// 	cardExpiryYear.value = paymentData.expiryYear;
// 	cardCvv.value = paymentData.cvv;

// 	profileName.value = this.value;
// }

// clearProfilesBtn.onclick = function () {
// 	ipcRenderer.send('delete all profiles');
// }
/* --------- Page: HARVESTERS ----------*/
harvester_SaveBtn.onclick = function ():void {
	let existingHarvesters:any = settings.has('captchaHarvesters') ? settings.get('captchaHarvesters') : [];
	existingHarvesters.push({
		name: harverster_Name.value
	});
	settings.set('captchaHarvesters', existingHarvesters, { prettify: true });
	content.harvesters();
};

/* --------- Page: PROXIES --------- */
// importProxyBtn.onclick = function () {
// 	ipcRenderer.send('import data', {
// 		type: 'Proxies'
// 	});
// }

// exportProxyBtn.onclick = function () {
// 	ipcRenderer.send('export data', {
// 		type: 'Proxies'
// 	});
// }

proxyTestAll.onclick = function():void {
	let listName:any = document.getElementById('proxyListSelectorMain');
	if (listName) {
		ipcRenderer.send('proxyList.testAll', {
			baseUrl: proxyTestSite.value,
			listName: listName.value
		});
	}
};

proxyDeleteList.onclick = function():void {
	let data:any = settings.get('proxies');
	try {
		
		proxyHeader.innerHTML = `Proxies`;
		proxyTestTable.innerHTML = '';
		delete data[proxyListSelectorMain.value];
		settings.set('proxies', data, {prettify:true});
		proxyListSelectorMain.value = '';	
		content.proxySelectors();
		
	} catch(err) { console.error(err); }
};

saveProxyList.onclick = function():void {
	let listName:any = proxyListName.value;
	let proxyInput:any = massProxyInput.value.split('\n');

	let proxyLists:any = settings.has('proxies') ? settings.get('proxies') : {};
	let listExists:any = proxyLists.hasOwnProperty(listName);
	if (!listExists) {
		proxyLists[listName] = {};
		for (let i:any = 0; i < proxyInput.length; i++) {
			let id:any = utilities.generateId(6);
			proxyLists[listName][id] = proxyInput[i];
		}
		settings.set('proxies', proxyLists, { prettify: true });
		proxyListSelectorMain.options.length = 0;
		content.proxySelectors();
		proxyListName.value = '';
		massProxyInput.value = '';
	}

};

if (proxyListSelectorMain.options.length > 0) content.proxies(proxyListSelectorMain.value);
proxyListSelectorMain.onchange = function():void {
	content.proxies(this.value);
};




clearAnalyticsBtn.onclick = function():void {
	settings.set('orders', [], {prettify:true});
	content.orders();
};

/* --------- Page: SETTINGS --------- */
// monitorProxyList.value = settings.has('monitorProxyList') ? settings.get('monitorProxyList') : '';
// monitorProxyList.onchange = function():void {
// 	settings.set('monitorProxyList', this.value, { prettify: true });
// };

let browserPath:any = document.getElementById('browserPath');
// let filePath = settings.has('browser-path') ? settings.get('browser-path') : null;
// let fileName = filePath ? filePath.split('/')[filePath.split('/').length - 1] : null;
// browserPath.value = fileName ? fileName : '';
currentBrowserPath.value = settings.has('browser-path') ? settings.get('browser-path') : '';

currentBrowserPath.onchange = function():void {
	settings.set('browser-path', this.value, {prettify: true});
};

browserPath.onchange = function():void {
	currentBrowserPath.value = this.files[0].path;
	currentBrowserPath.onchange(new Event(''));
};

installBrowserBtn.onclick = function ():void { ipcRenderer.send('setup browser mode'); };
resetBtn.onclick = function ():void { ipcRenderer.send('reset settings'); };

version.innerHTML = `Version ${remote.app.getVersion()}`;

customDiscord.value = settings.has('discord') ? settings.get('discord') : '';
customDiscord.onchange = function ():void {
	settings.set('discord', this.value, { prettify: true });
};
testDiscordBtn.onclick = function ():void {
	utilities.sendTestWebhook();
};

