import { ipcRenderer, remote } from 'electron';
import mousetrap from 'mousetrap';
import settings from 'electron-settings';
import * as content from './content';
import * as profile from './profiles';
import ipc from './ipc';
import { utilities } from '../library/other';
//import { sites } from '../library/configuration';
import { taskDataProps, productProps, profileDataProps } from '../data-types';
import $ from 'jquery';


/* --------- GENERAL --------- */
ipc.init();
ipcRenderer.send('check for browser executable');

let tasks:any = settings.has('tasks') ? settings.get('tasks') : null;
if (!tasks || tasks.constructor === []) settings.set('tasks', {});
if (!settings.has('profiles')) settings.set('profiles', {});

try {
	content.tasks();
	content.profiles();
	content.sites();
	content.countries();
	content.proxySelectors();
	content.harvesters();
	content.orders();
} catch (err) { console.error(err); }

/* --------- assets: BANNER --------- */
var minimizeBtn: HTMLElement = document.getElementById('minimizeApp');
var maximizeBtn: HTMLElement = document.getElementById('maximizeApp');
var closeBtn: HTMLElement = document.getElementById('closeApp');

minimizeBtn.onclick = function (): void { ipcRenderer.send('window.minimize'); };
maximizeBtn.onclick = function(): void { ipcRenderer.send('window.maximize'); };
closeBtn.onclick = function (): void { ipcRenderer.send('window.close'); };

var navigationSelectors: NodeListOf<HTMLElement> = document.querySelectorAll('.nav');
navigationSelectors.forEach((page, i): void => {
	function navigationHandler(): void {
		let selectedPageId: string = page.getAttribute('data-page');
		let selectedPage: HTMLElement = document.getElementById(selectedPageId);

		if (selectedPage.classList.contains('page-hidden')) {
			let activeNavigation: HTMLElement = document.querySelector('.nav-active');
			let activePageId: string = activeNavigation.getAttribute('data-page');
			let activePage: HTMLElement = document.getElementById(activePageId);

			activeNavigation.classList.remove('nav-active');
			page.classList.add('nav-active');

			selectedPage.classList.remove('page-hidden');
			activePage.classList.add('page-hidden');
		}
	}

	page.onclick = navigationHandler;
	mousetrap.bind([`command+${i + 1}`, `ctrl+${i + 1}`], navigationHandler);
});

/* --------- Tasks Page --------- */
var globalMonitorDelay: HTMLInputElement = <HTMLInputElement>document.getElementById('globalMonitor');
var globalErrorDelay: HTMLInputElement = <HTMLInputElement>document.getElementById('globalError');
var globalTimeoutDelay: HTMLInputElement = <HTMLInputElement>document.getElementById('globalTimeout');

if (!settings.has('globalMonitorDelay')) {
	settings.set('globalMonitorDelay', globalMonitorDelay.value);
} else {
	globalMonitorDelay.value = <string>settings.get('globalMonitorDelay');
}

if (!settings.has('globalErrorDelay')) {
	settings.set('globalErrorDelay', globalMonitorDelay.value);
} else {
	globalErrorDelay.value = <string>settings.get('globalErrorDelay');
}

if (!settings.has('globalTimeoutDelay')) {
	settings.set('globalTimeoutDelay', globalTimeoutDelay.value);
} else {
	globalTimeoutDelay.value = <string>settings.get('globalTimeoutDelay');
}

var newTaskButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById('newTaskButton');
var newProfileButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById('newProfileBtn');

newTaskButton.onclick = function():void {
	(<any>$('#newTaskModal')).modal('show');
};
newProfileButton.onclick = function():void {
	(<any>$('#profileModal')).modal('show');
};

globalMonitorDelay.onchange = function (this:HTMLInputElement): void {
	settings.set('globalMonitorDelay', this.value, { prettify: true });
};
globalErrorDelay.onchange = function (this:HTMLInputElement): void {
	settings.set('globalErrorDelay', this.value, { prettify: true });
};
globalTimeoutDelay.onchange = function (this:HTMLInputElement): void {
	settings.set('globalTimeoutDelay', this.value, { prettify: true });
};



var runAllBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('runAll');
var stopAllBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('stopAll');
var clearTasksBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('clearTasks');

runAllBtn.onclick = function (): void { ipcRenderer.send('task.runAll'); };
stopAllBtn.onclick = function (): void { ipcRenderer.send('task.stopAll'); };
clearTasksBtn.onclick = function (): void { ipcRenderer.send('task.deleteAll'); };
// importTaskBtn.onclick = function(): void { ipcRenderer.send('import data', { type: 'Tasks' }); };
// exportTaskBtn.onclick = function(): void { ipcRenderer.send('export data', { type: 'Tasks' }); };

/* --------- Modal: NEW TASK --------- */
var newTask_Site: HTMLInputElement = <HTMLInputElement>document.getElementById('taskSite');
var newTask_Profile: HTMLInputElement = <HTMLInputElement>document.getElementById('taskProfile');
var newTask_Mode: HTMLInputElement = <HTMLInputElement>document.getElementById('taskMode');
var newTask_RestockMode: HTMLInputElement = <HTMLInputElement>document.getElementById('newTaskMonitorMode');
var newTask_CheckoutAttempts: HTMLInputElement = <HTMLInputElement>document.getElementById('taskCheckoutAttempts');
var newTask_Quantity: HTMLInputElement = <HTMLInputElement>document.getElementById('taskQuantity');

var newTask_CartDelay: HTMLInputElement = <HTMLInputElement>document.getElementById('taskCartDelay');
var newTask_CheckoutDelay: HTMLInputElement = <HTMLInputElement>document.getElementById('taskCheckoutDelay');

var newTask_ProxyList: HTMLInputElement = <HTMLInputElement>document.getElementById('taskProxyList');
var newTask_PriceLimit: HTMLInputElement = <HTMLInputElement>document.getElementById('taskMaxPrice');
var newTask_StartDate: HTMLInputElement = <HTMLInputElement>document.getElementById('taskStartDate');
var newTask_StartTime: HTMLInputElement = <HTMLInputElement>document.getElementById('taskStartTime');

var newTask_Restocks: HTMLInputElement = <HTMLInputElement>document.getElementById('newTaskRestocks');
var newTask_SkipCaptcha: HTMLInputElement = <HTMLInputElement>document.getElementById('captchaCheckbox');
var newTask_threeD: HTMLInputElement = <HTMLInputElement>document.getElementById('threeDCheckbox');

var newTask_SearchInput: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskSearchInput"]');
var newTask_Category: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskCategory"]');
var newTask_Size: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskSize"]');
var newTask_Style: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskVariant"]');
var newTask_ProductQty: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskProductQty"]');


newTask_Mode.disabled = true;
newTask_RestockMode.disabled = true;

newTask_SearchInput[0].placeholder = 'Please Select Site.';
newTask_Style[0].disabled = true;
newTask_Category[0].disabled = true;
newTask_Size[0].disabled = true;
newTask_ProductQty[0].disabled = true;
newTask_SearchInput[0].disabled = true;

var newTask_saveBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('taskSaveButton');
newTask_saveBtn.onclick = function (): void {
	try {


		if (newTask_Mode.value === 'browser' && !settings.has('browser-path')) {
			alert('Browser Mode Not Installed.');
			return;
		}
		let products: productProps[] = [];
		for (let i: number = 0; i < newTask_SearchInput.length; i++) {
			let product: productProps = {
				'searchInput': newTask_SearchInput[i].value,
				'category': newTask_Category[i].value,
				'size': newTask_Size[i].value,
				'style': newTask_Style[i].value,
				'productQty': newTask_ProductQty[i].value
			};
			products.push(product);
		}
		let timerComps: string[] = newTask_StartTime.value.split(':');
		let timerVal: string = timerComps.length === 2 ? newTask_StartTime.value + ':00' : newTask_StartTime.value;
		let taskData: taskDataProps = {
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
	} catch (err) { console.error(err); }
};

/* --------- Page: PROFILES ---------- */
var billingFirst: HTMLInputElement = <HTMLInputElement>document.getElementById('profileBillingFirst');
var billingLast: HTMLInputElement = <HTMLInputElement>document.getElementById('profileBillingLast');
var billingEmail: HTMLInputElement = <HTMLInputElement>document.getElementById('profileBillingEmail');
var billingTelephone: HTMLInputElement = <HTMLInputElement>document.getElementById('profileBillingTelephone');
var billingAddress1: HTMLInputElement = <HTMLInputElement>document.getElementById('profileBillingAddress1');
var billingAddress2: HTMLInputElement = <HTMLInputElement>document.getElementById('profileBillingAddress2');
var billingCity: HTMLInputElement = <HTMLInputElement>document.getElementById('profileBillingCity');
var billingZip: HTMLInputElement = <HTMLInputElement>document.getElementById('profileBillingZip');
var billingCountry: HTMLSelectElement = <HTMLSelectElement>document.getElementById('profileBillingCountry');
var billingState: HTMLSelectElement = <HTMLSelectElement>document.getElementById('profileBillingState');

var useSameShippingAddress: HTMLInputElement = <HTMLInputElement>document.getElementById('sameShippingCheckbox');

var shippingFirst: HTMLInputElement = <HTMLInputElement>document.getElementById('profileShippingFirst');
var shippingLast: HTMLInputElement = <HTMLInputElement>document.getElementById('profileShippingLast');
var shippingEmail: HTMLInputElement = <HTMLInputElement>document.getElementById('profileShippingEmail');
var shippingTelephone: HTMLInputElement = <HTMLInputElement>document.getElementById('profileShippingTelephone');
var shippingAddress1: HTMLInputElement = <HTMLInputElement>document.getElementById('profileShippingAddress1');
var shippingAddress2: HTMLInputElement = <HTMLInputElement>document.getElementById('profileShippingAddress2');
var shippingCity: HTMLInputElement = <HTMLInputElement>document.getElementById('profileShippingCity');
var shippingZip: HTMLInputElement = <HTMLInputElement>document.getElementById('profileShippingZip');
var shippingCountry: HTMLSelectElement = <HTMLSelectElement>document.getElementById('profileShippingCountry');
var shippingState: HTMLSelectElement = <HTMLSelectElement>document.getElementById('profileShippingState');

var paymentType: HTMLInputElement = <HTMLInputElement>document.getElementById('profilePaymentType');
var cardNumber: HTMLInputElement = <HTMLInputElement>document.getElementById('profileCardNumber');
var cardExpiryMonth: HTMLInputElement = <HTMLInputElement>document.getElementById('profileExpiryMonth');
var cardExpiryYear: HTMLInputElement = <HTMLInputElement>document.getElementById('profileExpiryYear');
var cardCvv: HTMLInputElement = <HTMLInputElement>document.getElementById('profileCvv');


var profileId: HTMLInputElement = <HTMLInputElement>document.getElementById('profileId');
var profileName: HTMLInputElement = <HTMLInputElement>document.getElementById('profileName');
var saveProfileBtn: HTMLInputElement = <HTMLInputElement>document.getElementById('profileSaveButton');

var profileElements: Array<HTMLInputElement|HTMLSelectElement> = [
	profileId, profileName,
	billingFirst, billingLast, billingEmail, billingTelephone, billingAddress1, billingAddress2, billingCity, billingZip, billingCountry, billingState,
	shippingFirst, shippingLast, shippingEmail, shippingTelephone, shippingAddress1, shippingAddress2, shippingCity, shippingZip, shippingCountry, shippingState,
	paymentType, cardNumber, cardExpiryMonth, cardExpiryYear, cardCvv
];

var clearProfilesBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('deleteAllProfiles');
//var importProfileBtn:any = document.getElementById('importProfiles');
//var exportProfileBtn:any = document.getElementById('exportProfiles');

billingCountry.onchange = function (this: HTMLInputElement): void {
	try {
		content.states('profileBillingState', this.value);
	} catch (err) { console.error(err); }
};

shippingCountry.onchange = function (this: HTMLInputElement): void {
	try {
		content.states('profileShippingState', this.value);
	} catch (err) { console.error(err); }
};

billingFirst.oninput = function (this: HTMLInputElement): void {
	try {
		if (useSameShippingAddress.checked) shippingFirst.value = this.value;
	} catch (err) { console.error(err); }
};

billingLast.oninput = function (this: HTMLInputElement): void {
	try {
		if (useSameShippingAddress.checked) shippingLast.value = this.value;
	} catch (err) { console.error(err); }
};

billingEmail.oninput = function (this: HTMLInputElement): void {
	if (useSameShippingAddress.checked) shippingEmail.value = this.value;
};

billingTelephone.oninput = function (this: HTMLInputElement): void {
	if (useSameShippingAddress.checked) shippingTelephone.value = this.value;
};

billingAddress1.oninput = function (this: HTMLInputElement): void {
	if (useSameShippingAddress.checked) shippingAddress1.value = this.value;
};

billingAddress2.oninput = function (this: HTMLInputElement): void {
	if (useSameShippingAddress.checked) shippingAddress2.value = this.value;
};

billingCity.oninput = function (this: HTMLInputElement): void {
	if (useSameShippingAddress.checked) shippingCity.value = this.value;
};

billingZip.oninput = function (this: HTMLInputElement): void {
	if (useSameShippingAddress.checked) shippingZip.value = this.value;
};

billingCountry.oninput = function (this: HTMLInputElement): void {
	if (useSameShippingAddress.checked) {
		shippingCountry.value = this.value;
		shippingCountry.onchange(new Event(''));
	}
};

billingState.oninput = function (this: HTMLInputElement): void {
	if (useSameShippingAddress.checked) shippingState.value = this.value;
};

useSameShippingAddress.onchange = function (this: HTMLInputElement): void {
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

cardNumber.onkeyup = function (this: HTMLInputElement): void {
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

saveProfileBtn.onclick = function (): void {
	let profileData: profileDataProps = {
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
	profile.save(profileId.value, profileData);
	content.profiles();
	for (let i: number = 0; i < profileElements.length; i++) {
		profileElements[i].value = profileElements[i].id.includes('Country') ? 'GB' : '';
	}
};

clearProfilesBtn.onclick = function (): void {
	settings.set('profiles', {}, { prettify: true });
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


/* --------- Page: HARVESTERS ----------*/
var harverster_Name: HTMLInputElement = <HTMLInputElement>document.getElementById('harvesterName');
var harvester_SaveBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('saveHarvesterBtn');

harvester_SaveBtn.onclick = function (): void {
	let existingHarvesters: any = settings.has('captchaHarvesters') ? settings.get('captchaHarvesters') : [];
	existingHarvesters.push({
		name: harverster_Name.value
	});
	settings.set('captchaHarvesters', existingHarvesters, { prettify: true });
	content.harvesters();
};

/* --------- Page: PROXIES --------- */
var proxyListName: HTMLInputElement = <HTMLInputElement>document.getElementById('proxyListName');
var massProxyInput: HTMLInputElement = <HTMLInputElement>document.getElementById('proxyInput');
var saveProxyList: HTMLButtonElement = <HTMLButtonElement>document.getElementById('saveProxyListBtn');
var proxyListSelectorMain: HTMLSelectElement = <HTMLSelectElement>document.getElementById('proxyListSelectorMain');
var proxyTestSite: HTMLInputElement = <HTMLInputElement>document.getElementById('proxySiteSelector');
var proxyTestTable: HTMLButtonElement = <HTMLButtonElement>document.getElementById('proxyTestResults');
var proxyTestAll: HTMLButtonElement = <HTMLButtonElement>document.getElementById('proxyTestAll');
var proxyDeleteList: HTMLButtonElement = <HTMLButtonElement> document.getElementById('proxyDeleteList');
// var importProxyBtn:any = document.getElementById('importProxies');
// var exportProxyBtn:any = document.getElementById('exportProxies');

proxyTestAll.onclick = function (): void {
	let listName: HTMLInputElement = <HTMLInputElement>document.getElementById('proxyListSelectorMain');
	if (listName) {
		ipcRenderer.send('proxyList.testAll', {
			baseUrl: proxyTestSite.value,
			listName: listName.value
		});
	}
};

proxyDeleteList.onclick = function (): void {
	let data: any = settings.get('proxies');
	try {
		var proxyHeader: HTMLElement = document.getElementById('proxy-header');
		proxyHeader.innerHTML = `Proxies`;
		proxyTestTable.innerHTML = '';
		delete data[proxyListSelectorMain.value];
		settings.set('proxies', data, { prettify: true });
		proxyListSelectorMain.value = '';
		content.proxySelectors();

	} catch (err) { console.error(err); }
};

saveProxyList.onclick = function (): void {
	let listName: string = proxyListName.value;
	let proxyInput: string[] = massProxyInput.value.split('\n');

	let proxyLists: any = settings.has('proxies') ? settings.get('proxies') : {};
	let listExists: boolean = proxyLists.hasOwnProperty(listName);
	if (!listExists) {
		proxyLists[listName] = {};
		for (let i: number = 0; i < proxyInput.length; i++) {
			let id: string = utilities.generateId(6);
			proxyLists[listName][id] = proxyInput[i];
		}
		settings.set('proxies', proxyLists, { prettify: true });
		proxyListSelectorMain.options.length = 0;
		content.proxySelectors();
		proxyListName.value = '';
		massProxyInput.value = '';
	}

};

// importProxyBtn.onclick = function () { ipcRenderer.send('import data', { type: 'Proxies' }); }
// exportProxyBtn.onclick = function () { ipcRenderer.send('export data', { type: 'Proxies' }); }

if (proxyListSelectorMain.options.length > 0) content.proxies(proxyListSelectorMain.value);
proxyListSelectorMain.onchange = function (this: HTMLSelectElement): void {
	content.proxies(this.value);
};

/* --------- Page: ANALYTICS --------- */
var clearAnalyticsBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('clearAnalytics');

clearAnalyticsBtn.onclick = function (): void {
	settings.set('orders', [], { prettify: true });
	content.orders();
};

/* --------- Page: SETTINGS --------- */
var currentBrowserPath: HTMLInputElement = <HTMLInputElement>document.getElementById('currentBrowserPath');
var installBrowserBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('browserSetup');
var resetBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('resetAllSettings');
var signoutBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('signout');
var customDiscord: HTMLInputElement = <HTMLInputElement>document.getElementById('discordWebhook');
var testDiscordBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('testDiscordWebhook');
var browserPath: HTMLInputElement = <HTMLInputElement>document.getElementById('browserPath');
var version: HTMLElement = document.getElementById('version');

signoutBtn.onclick = function (): void { ipcRenderer.send('signout'); };

currentBrowserPath.value = settings.has('browser-path') ? <string>settings.get('browser-path') : '';

currentBrowserPath.onchange = function (this:HTMLInputElement): void {
	settings.set('browser-path', this.value, { prettify: true });
};

browserPath.onchange = function (this: HTMLInputElement): void {
	currentBrowserPath.value = this.files[0].path;
	currentBrowserPath.onchange(new Event(''));
};

installBrowserBtn.onclick = function (): void { ipcRenderer.send('setup browser mode'); };
resetBtn.onclick = function (): void { ipcRenderer.send('reset settings'); };
// let filePath = settings.has('browser-path') ? settings.get('browser-path') : null;
// let fileName = filePath ? filePath.split('/')[filePath.split('/').length - 1] : null;
// browserPath.value = fileName ? fileName : '';

version.innerHTML = `Version ${remote.app.getVersion()}`;

customDiscord.value = settings.has('discord') ? <string>settings.get('discord') : '';
customDiscord.onchange = function (this:HTMLInputElement): void {
	settings.set('discord', this.value, { prettify: true });
};
testDiscordBtn.onclick = function (): void {
	utilities.sendTestWebhook();
};

