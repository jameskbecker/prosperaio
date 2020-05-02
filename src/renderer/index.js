'use strict'
const _ = require('underscore');
const electron = require('electron');
const { ipcRenderer } = electron;
const mousetrap = require('mousetrap');
const settings = require('electron-settings');

const content = require('../src/renderer/content');
const profile = require('../src/renderer/profiles');
const ipc = require('../src/renderer/ipc');
const { utilities } = require('../src/library/other');
const { sites } = require('../src/library/configuration');

/* --------- GENERAL --------- */
ipc.init();
ipcRenderer.send('check for browser executable');
if (!settings.has('tasks')) settings.set('tasks', []);
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
signoutBtn.onclick = function () { ipcRenderer.send('signout'); }
reloadBtn.onclick = function () { ipcRenderer.send('window.reload'); }
minimizeBtn.onclick = function () { ipcRenderer.send('window.minimize'); }
closeBtn.onclick = function () { ipcRenderer.send('window.close'); }

navigationSelectors.forEach((page, i) => {
	function navigationHandler() {
		let selectedPageId = page.getAttribute('data-page');
		let selectedPage = document.getElementById(selectedPageId);

		if (selectedPage.classList.contains('page-hidden')) {
			let activeNavigation = document.querySelector('.nav-active');
			let activePageId = activeNavigation.getAttribute('data-page');
			let activePage = document.getElementById(activePageId);

			activeNavigation.classList.remove('nav-active');
			page.classList.add('nav-active');
			activePage.classList.add('page-hidden');
			selectedPage.classList.remove('page-hidden');
		}
	}

	page.onclick = navigationHandler;
	mousetrap.bind(`command+${i + 1}`, navigationHandler)
});

/* --------- Tasks Page --------- */
importTaskBtn.onclick = function() {
	ipcRenderer.send('import data', {
		type: 'Tasks'
	});
}

exportTaskBtn.onclick = function() {
	ipcRenderer.send('export data', {
		type: 'Tasks'
	});
}

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

globalMonitorDelay.onchange = function () {
	settings.set('globalMonitorDelay', this.value, { prettify: true });
}
globalErrorDelay.onchange = function () {
	settings.set('globalErrorDelay', this.value, { prettify: true });
}
globalTimeoutDelay.onchange = function () {
	settings.set('globalTimeoutDelay', this.value, { prettify: true });
}

runAllBtn.onclick = function () { ipcRenderer.send('task.runAll'); }
stopAllBtn.onclick = function () { ipcRenderer.send('task.stopAll'); }
clearTasksBtn.onclick = function () { ipcRenderer.send('task.deleteAll'); }

/* --------- Modal: NEW TASK --------- */
newTask_Mode.disabled = true;
newTask_RestockMode.disabled = true;

newTask_SearchInput[0].placeholder = "Please Select Site.";
newTask_Style[0].disabled = true;
newTask_Category[0].disabled = true;
newTask_Size[0].disabled = true;
newTask_ProductQty[0].disabled = true;
newTask_SearchInput[0].disabled = true;

newTask_saveBtn.onclick = function () {
	try {
		if (newTask_Mode.value === 'browser' && !settings.has('browser-path')) {
			return alert('Browser Mode Not Installed.');
		}
		let products = [];
		for (let i = 0; i < newTask_SearchInput.length; i++) {
			let product = {
				'searchInput': newTask_SearchInput[i].value,
				'category': newTask_Category[i].value,
				'size': newTask_Size[i].value,
				'style': newTask_Style[i].value,
				'productQty': newTask_ProductQty[i].value
			};
			products.push(product);
		}
		let timerComps = newTask_StartTime.value.split(':');
		let timerVal = timerComps.length === 2 ? newTask_StartTime.value + ':00' : newTask_StartTime.value;
		let taskData = {
			'setup': {
				profile: newTask_Profile.value || '',
				mode: newTask_Mode.value || '',
				restockMode: newTask_RestockMode.value || '',
				checkoutAttempts: parseInt(newTask_CheckoutAttempts.value) || 1,
			},
			'site': newTask_Site.value || '',
			'delays': {
				cart: parseInt(newTask_CartDelay.value) || 0,
				checkout: parseInt(newTask_CheckoutDelay.value) || 0
			},
			'additional': {
				proxyList: newTask_ProxyList.value || '',
				maxPrice: parseInt(newTask_PriceLimit.value) || 0,
				timer: `${newTask_StartDate.value} ${timerVal}` || '',

				monitorRestocks: newTask_Restocks.checked || true,
				skipCaptcha: newTask_SkipCaptcha.checked || false,
				enableThreeDS: newTask_threeD.checked || false
				
			},
			'products': products
		};

		ipcRenderer.send('task.save', {
			data: taskData,
			quantity: parseInt(newTask_Quantity.value)
		})
	} catch(err) { console.error(err); }
};

/* --------- Page: PROFILES ---------- */
billingCountry.onchange = function () {
	try {
		content.states('profileBillingState', this.value);
	} catch(err) { console.error(err); }
}

shippingCountry.onchange = function () {
	try {
		content.states('profileShippingState', this.value);
	} catch(err) { console.error(err); }
}

billingFirst.oninput = function () {
	try {
		if (useSameShippingAddress.checked) shippingFirst.value = this.value;
	} catch(err) { console.error(err); }
}

billingLast.oninput = function () {
	try {
		if (useSameShippingAddress.checked) shippingLast.value = this.value;
	} catch(err) { console.error(err); }
}

billingEmail.oninput = function () {
	if (useSameShippingAddress.checked) shippingEmail.value = this.value;
}

billingTelephone.oninput = function () {
	if (useSameShippingAddress.checked) shippingTelephone.value = this.value;
}

billingAddress1.oninput = function () {
	if (useSameShippingAddress.checked) shippingAddress1.value = this.value;
}

billingAddress2.oninput = function () {
	if (useSameShippingAddress.checked) shippingAddress2.value = this.value;
}

billingCity.oninput = function () {
	if (useSameShippingAddress.checked) shippingCity.value = this.value;
}

billingZip.oninput = function () {
	if (useSameShippingAddress.checked) shippingZip.value = this.value;
}

billingCountry.oninput = function () {
	if (useSameShippingAddress.checked) {
		shippingCountry.value = this.value;
		shippingCountry.onchange();
	}
}

billingState.oninput = function () {
	if (useSameShippingAddress.checked) shippingState.value = this.value;
}

useSameShippingAddress.onchange = function () {
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

cardNumber.onkeyup = function () {
	switch (paymentType.value) {
		case 'master':
		case 'visa':
			this.value = this.value.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
			this.maxLength = 19;
			break;
		case 'american_express':
			this.maxLength = 17;
	}

}

saveProfileBtn.onclick = function () {
	let profileData = {
		billing: {
			"first": billingFirst.value || "",
			"last": billingLast.value || "",
			"email": billingEmail.value || "",
			"telephone": billingTelephone.value || "",
			"address1": billingAddress1.value || "",
			"address2": billingAddress2.value || "",
			"city": billingCity.value || "",
			"zip": billingZip.value || "",
			"country": billingCountry.value || "",
			"state": billingState.value || ""
		},
		shipping: {
			"first": shippingFirst.value || "",
			"last": shippingLast.value || "",
			"email": shippingEmail.value || "",
			"telephone": shippingTelephone.value || "",
			"address1": shippingAddress1.value || "",
			"address2": shippingAddress2.value || "",
			"city": shippingCity.value || "",
			"zip": shippingZip.value || "",
			"country": shippingCountry.value || "",
			"state": shippingState.value || ""
		},
		payment: {
			"type": paymentType.value || "",
			"cardNumber": cardNumber.value || "",
			"expiryMonth": cardExpiryMonth.value || "",
			"expiryYear": cardExpiryYear.value || "",
			"cvv": cardCvv.value || ""
		}
	};

	profile.save(profileName.value, profileData);
	for (let i = 0; i < profileElements.length; i++) {
		profileElements[i].value = profileElements[i].id.includes('Country') ? 'GB' : '';
	}
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
harvester_SaveBtn.onclick = function () {
	let existingHarvesters = settings.has('captchaHarvesters') ? settings.get('captchaHarvesters') : [];
	existingHarvesters.push({
		name: harverster_Name.value
	})
	settings.set('captchaHarvesters', existingHarvesters, { prettify: true });
	content.harvesters();
}

/* --------- Page: PROXIES --------- */
importProxyBtn.onclick = function () {
	ipcRenderer.send('import data', {
		type: 'Proxies'
	});
}

exportProxyBtn.onclick = function () {
	ipcRenderer.send('export data', {
		type: 'Proxies'
	});
}

saveProxyList.onclick = function() {
	let listName = proxyListName.value;
	let proxyInput = massProxyInput.value.split('\n');

	let proxyLists = settings.has('proxies') ? settings.get('proxies') : {};
	let listExists = proxyLists.hasOwnProperty(listName);
	if (!listExists) {
		proxyLists[listName] = {};
		for (let i = 0; i < proxyInput.length; i++) {
			let id = utilities.generateId(6);
			proxyLists[listName][id] = proxyInput[i];
		}
		settings.set('proxies', proxyLists, { prettify: true });
		proxyListSelectorMain.options.length = 0;
		content.proxySelectors();
		proxyListName.value = '';
		massProxyInput.value = '';
	}

}

if (proxyListSelectorMain.options.length > 0) content.proxies(proxyListSelectorMain.value)
proxyListSelectorMain.onchange = function() {
	content.proxies(this.value);
}



/* --------- Page: SETTINGS --------- */
installBrowserBtn.onclick = function () { ipcRenderer.send('setup browser mode'); }
resetBtn.onclick = function () { ipcRenderer.send('reset settings'); }

customDiscord.value = settings.has('discord') ? settings.get('discord') : '';
customDiscord.onchange = function () {
	settings.set('discord', this.value, { prettify: true });
}
testDiscordBtn.onclick = function () {
	utilities.sendTestWebhook();
}