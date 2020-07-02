//import './elements';
import settings from 'electron-settings';
import { ipcRenderer } from 'electron';
import { default as config } from '../library/configuration';
import * as profileActions from './profiles';
const $: Function = require('jquery');
//const dropData = require('../mock-drop');
import { default as dropList } from './droplist';
import { siteDataProps, profileDataProps, UserData } from '../data-types';
import { Mouse } from 'puppeteer-core';

function populateTaskForm(taskData: UserData.task, taskId: string): void {
	newTask_Site.value = taskData.site;
	newTask_Site.onchange(new Event(''));
	newTask_Profile.value = taskData.setup.profile;

	newTask_Mode.value = taskData.setup.mode;
	newTask_RestockMode.value = taskData.setup.restockMode;
	newTask_CheckoutAttempts.value = taskData.setup.checkoutAttempts.toString();

	newTask_CartDelay.value = taskData.delays.cart.toString();
	newTask_CheckoutDelay.value = taskData.delays.checkout.toString();
	newTask_ProxyList.value = taskData.additional.proxyList;
	newTask_PriceLimit.value = taskData.additional.maxPrice.toString();
	newTask_StartDate.value = taskData.additional.timer.split(' ')[0];
	newTask_StartTime.value = taskData.additional.timer.split(' ')[1];

	newTask_Restocks.checked = taskData.additional.monitorRestocks;
	newTask_SkipCaptcha.checked = taskData.additional.skipCaptcha;
	newTask_threeD.checked = taskData.additional.enableThreeDS;

	newTask_SearchInput[0].value = taskData.products[0].searchInput;
	newTask_Category[0].value = taskData.products[0].category;
	newTask_Size[0].value = taskData.products[0].size;
	newTask_Style[0].value = taskData.products[0].style;
	newTask_ProductQty[0].value = taskData.products[0].productQty;

	newTask_id.value = taskId;
}

export function resetTaskForm(): void {
	newTask_Site.value = '';
	newTask_Site.onchange(new Event(''));
	newTask_Profile.value = '';

	newTask_Mode.value = '';
	newTask_RestockMode.value = '';
	newTask_CheckoutAttempts.value = '';

	newTask_CartDelay.value = '0';
	newTask_CheckoutDelay.value = '0';
	newTask_ProxyList.value = '';
	newTask_PriceLimit.value = '0';
	newTask_StartDate.value = '';
	newTask_StartTime.value = '';

	newTask_Restocks.checked = true;
	newTask_SkipCaptcha.checked = false;
	newTask_threeD.checked = false;

	newTask_SearchInput[0].value = '';
	newTask_Category[0].value = '';
	newTask_Size[0].value = '';
	newTask_Style[0].value = '';
	newTask_ProductQty[0].value = '1';

	newTask_id.value = '';
	$('#newTaskModal').modal('hide');
}





var newTask_products: HTMLSelectElement = <HTMLSelectElement>document.getElementById('newTaskProducts');
var newTask_styles: HTMLSelectElement = <HTMLSelectElement>document.getElementById('newTaskStyles');
var newTask_sizes: HTMLSelectElement = <HTMLSelectElement>document.getElementById('newTaskSizes');

var newTask_SearchInput: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskSearchInput"]');
var newTask_Category: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskCategory"]');
var newTask_Size: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskSize"]');
var newTask_Style: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskVariant"]');
var newTask_ProductQty: NodeListOf<HTMLInputElement> = document.querySelectorAll('input[name="taskProductQty"]');

function convertMode(id: string): string {
	switch (id) {
		case 'supreme-request': return 'Fast';
		case 'supreme-browser': return 'Safe';
		case 'kickz-wire': return 'Wire Transfer';
		case 'kickz-paypal': return 'Paypal';
		default: return '';
	}
}

function renderTaskTable(): void {
	var newTaskButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById('newTaskButton');
	newTaskButton.onclick = function(): void {
		//resetTaskForm();
		$('#newTaskModal').modal('show');
	};

	let tasks: UserData.allTasks = settings.has('tasks') ? <UserData.allTasks><unknown>settings.get('tasks') : {};
	let profiles: any = settings.has('profiles') ? settings.get('profiles') : {};

	var tasksHeader: HTMLElement = document.getElementById('tasksHeader');
	var taskTableBody: HTMLElement = document.getElementById('taskTableBody');

	tasksHeader.innerHTML = `Tasks (${Object.keys(tasks).length} Total)`;
	taskTableBody.innerHTML = '';

	try {
		for (let i: number = 0; i < Object.keys(tasks).length; i++) {
			let taskId: string = Object.keys(tasks)[i];
			let taskRow: HTMLTableRowElement = document.createElement('tr');
			taskRow.className = 'row';

			taskRow.onclick = function (): void {
				populateTaskForm(tasks[taskId], taskId);
				$('#newTaskModal').modal('show');
			};

			
			// let idCell = document.createElement('td');
			// idCell.innerHTML = taskId;
			// idCell.className = 'cell cell-body col-id';
			// taskRow.appendChild(idCell);

			let siteCell: HTMLTableCellElement = document.createElement('td');
			let defaultSiteData: any = config.sites.def;
			let siteData: siteDataProps = defaultSiteData[tasks[taskId].site];
			siteCell.innerHTML = siteData ? siteData.label : '';
			siteCell.className = 'cell cell-body col-site';
			taskRow.appendChild(siteCell);

			let modeCell: HTMLTableCellElement = document.createElement('td');
			modeCell.innerHTML = convertMode(tasks[taskId].setup.mode);
			modeCell.className = 'cell cell-body col-mode';
			taskRow.appendChild(modeCell);

			let productCell: HTMLTableCellElement = document.createElement('td');
			productCell.innerHTML = '' + tasks[taskId].products[0].searchInput;
			productCell.className = 'cell cell-body col-products';
			productCell.setAttribute('data-id', taskId);
			taskRow.appendChild(productCell);

			let sizeCell: HTMLTableCellElement = document.createElement('td');
			sizeCell.innerHTML = '' + tasks[taskId].products[0].size;
			sizeCell.className = 'cell cell-body col-size';
			sizeCell.setAttribute('data-id', taskId);
			taskRow.appendChild(sizeCell);

			let profileCell: HTMLTableCellElement = document.createElement('td');
			profileCell.innerHTML = '' + profiles[tasks[taskId].setup.profile] && profiles[tasks[taskId].setup.profile].profileName ? profiles[tasks[taskId].setup.profile].profileName : '';
			profileCell.className = 'cell cell-body col-profile';
			taskRow.appendChild(profileCell);

			let proxyCell: HTMLTableCellElement = document.createElement('td');
			proxyCell.innerHTML = '' + tasks[taskId].additional.proxyList ? tasks[taskId].additional.proxyList : 'None';
			proxyCell.className = 'cell cell-body col-task-proxy';
			taskRow.appendChild(proxyCell);

			let timerCell: HTMLTableCellElement = document.createElement('td');
			timerCell.innerHTML = '' + tasks[taskId].additional.timer !== ' ' ? tasks[taskId].additional.timer : 'None';
			timerCell.className = 'cell cell-body col-timer';
			taskRow.appendChild(timerCell);

			let statusCell: HTMLTableCellElement = document.createElement('td');
			statusCell.innerHTML = 'Idle.';
			statusCell.className = 'cell cell-body col-status';
			statusCell.setAttribute('data-taskId', taskId);
			taskRow.appendChild(statusCell);

			let actionsCell: HTMLTableCellElement = document.createElement('td');
			actionsCell.className = 'cell cell-body table-row col-actions';

			let startButton: HTMLButtonElement = document.createElement('button');
			startButton.innerHTML = '<i class="fas fa-play"></i>';
			startButton.className = 'action-button';
			startButton.setAttribute('data-taskId', taskId);
			startButton.onclick = function (event: MouseEvent): void {
				event.stopImmediatePropagation();
				ipcRenderer.send('task.run', startButton.getAttribute('data-taskId'));
			};
			actionsCell.appendChild(startButton);

			let stopButton: HTMLButtonElement = document.createElement('button');
			stopButton.innerHTML = '<i class="fas fa-stop"></i>';
			stopButton.className = 'action-button';
			stopButton.setAttribute('data-taskId', taskId);
			stopButton.onclick = function (event: MouseEvent): void {
				event.stopImmediatePropagation();
				ipcRenderer.send('task.stop', taskId);
			};
			actionsCell.appendChild(stopButton);

			let duplicateButton: HTMLButtonElement = document.createElement('button');
			duplicateButton.innerHTML = '<i class="fas fa-clone"></i>';
			duplicateButton.className = 'action-button';
			duplicateButton.setAttribute('data-taskId', taskId);
			duplicateButton.onclick = function (event: MouseEvent): void {
				event.stopImmediatePropagation();
				ipcRenderer.send('task.duplicate', taskId);
			};
			actionsCell.appendChild(duplicateButton);

			let deleteButton: HTMLButtonElement = document.createElement('button');
			deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
			deleteButton.className = 'action-button';
			deleteButton.setAttribute('data-taskId', taskId);
			deleteButton.onclick = function (event: MouseEvent): void {
				event.stopImmediatePropagation();
				ipcRenderer.send('task.delete', taskId);
			};
			actionsCell.appendChild(deleteButton);

			// let moreButton = document.createElement('div');
			// moreButton.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
			// moreButton.className = 'action-button';
			// moreButton.setAttribute('data-taskId', taskId);
			// moreButton.onclick = function () { };
			// actionsCell.appendChild(moreButton);

			taskRow.appendChild(actionsCell);

			taskTableBody.appendChild(taskRow);

		}
	} catch (err) { console.log(err); }
}

function renderProxyTable(name: string): void {
	try {
		var proxyTestTable: HTMLElement = document.getElementById('proxyTestResults');
		let proxyLists: any = settings.has('proxies') ? settings.get('proxies') : {};
		let list: any = proxyLists[name];
		if (list) {
			// document.getElementById('proxy-header').innerHTML = '';
			// document.getElementById('proxy-header').innerHTML = `Proxies (${Object.keys(list).length} Total)`;
			proxyTestTable.innerHTML = '';
			for (let i: number = 0; i < Object.keys(list).length; i++) {
				let proxyId: string = Object.keys(list)[i];
				let proxyRow: HTMLTableRowElement = document.createElement('tr');
				proxyRow.className = 'row';
				proxyRow.setAttribute('data-row-id', proxyId);


				let ipCell: HTMLTableCellElement = document.createElement('td');
				let splitProxy: string[] = list[proxyId].split(':');
				ipCell.innerHTML = splitProxy[0] ? splitProxy[0] : 'localhost';
				ipCell.className = 'cell cell-body col-proxy';
				proxyRow.appendChild(ipCell);

				let portCell: HTMLTableCellElement = document.createElement('td');
				if (splitProxy.length > 1) portCell.innerHTML = splitProxy[1];
				else portCell.innerHTML = 'None';
				portCell.className = 'cell cell-body col-proxyPort';
				proxyRow.appendChild(portCell);


				let userCell: HTMLTableCellElement = document.createElement('td');
				if (splitProxy.length > 3) userCell.innerHTML = splitProxy[2];
				else userCell.innerHTML = 'None';
				userCell.className = 'cell cell-body col-proxyUser';
				proxyRow.appendChild(userCell);

				let passCell: HTMLTableCellElement = document.createElement('td');
				if (splitProxy.length > 3) passCell.innerHTML = splitProxy[3];
				else passCell.innerHTML = 'None';
				passCell.className = 'cell cell-body col-proxy';
				proxyRow.appendChild(passCell);

				let statusCell: HTMLTableCellElement = document.createElement('td');
				statusCell.className = 'cell cell-body col-status col-proxy';
				statusCell.innerHTML = 'Idle.';
				statusCell.setAttribute('data-proxyId', proxyId);
				proxyRow.appendChild(statusCell);

				let actionsCell: HTMLTableCellElement = document.createElement('td');
				actionsCell.className = 'cell cell-body col-proxy';

				let startButton: HTMLElement = document.createElement('div');
				startButton.innerHTML = '<i class="fas fa-vial"></i>';
				startButton.className = 'action-button';
				startButton.setAttribute('data-proxyId', proxyId);
				startButton.onclick = function (): void {
					ipcRenderer.send('proxyList.test', {
						baseUrl: proxyTestSite.value,
						id: proxyId,
						input: list[proxyId],
					});
				};
				actionsCell.appendChild(startButton);

				let deleteButton: HTMLElement = document.createElement('div');
				deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
				deleteButton.className = 'action-button';
				deleteButton.onclick = function (this: HTMLElement): void {
					delete list[proxyId];
					settings.set('proxies', proxyLists, { prettify: true });
					let row: HTMLTableRowElement = <HTMLTableRowElement>this.parentNode.parentNode;
					row.parentNode.removeChild(row);
				};
				actionsCell.appendChild(deleteButton);
				proxyRow.appendChild(actionsCell);

				proxyTestTable.appendChild(proxyRow);
			}
		}
	}
	catch (error) {

	}
}

function renderSites(): void {
	const siteKeys: any = Object.keys(config.sites.def);
	for (let i: number = 0; i < siteKeys.length; i++) {

		let defaultSiteData: any = config.sites.def;
		let site: any = defaultSiteData[siteKeys[i]];
		if (site.enabled) {
			for (let j: any = 0; j < siteSelectors.length; j++) {
				let siteOption: HTMLOptionElement = document.createElement('option');
				siteOption.value = siteKeys[i];
				siteOption.label = site.label;
				siteSelectors[j].add(siteOption);
			}
		}
	}
	newTask_Site.onchange = function (this: HTMLSelectElement): void {
		newTask_Mode.disabled = false;
		newTask_RestockMode.disabled = false;
		let defaultSiteData: any = config.sites.def;
		let selectedSite: any = defaultSiteData[this.value] ? defaultSiteData[this.value] : null;
		if (selectedSite) {
			newTask_Mode.onchange = function (this: HTMLSelectElement): void {
				newTask_RestockMode.options.length = 0;

				let stockMode: HTMLOptionElement = document.createElement('option');
				stockMode.label = 'Stock (Recommended)';
				stockMode.value = 'stock';

				let cartMode: HTMLOptionElement = document.createElement('option');
				cartMode.label = 'Cart';
				cartMode.value = 'cart';

				switch (this.value) {
					case 'kickz-request':
						newTask_RestockMode.add(stockMode);
					case 'supreme-request':
						newTask_RestockMode.add(stockMode);
						newTask_RestockMode.add(cartMode);
						break;
					case 'supreme-browser':
						newTask_RestockMode.add(stockMode);
						break;
					case 'shopify-api':
						newTask_RestockMode.add(stockMode);
						break;
					case 'shopify-frontend':
						newTask_RestockMode.add(stockMode);
						break;
					default: console.log('No Onchange Event for:', this.value);
				}
			};
			newTask_Style[0].disabled = false;
			newTask_Category[0].disabled = false;
			newTask_Size[0].disabled = false;
			newTask_ProductQty[0].disabled = false;
			newTask_SearchInput[0].disabled = false;
			newTask_Mode.options.length = 0;
			let requestMode: HTMLOptionElement = document.createElement('option');

			switch (selectedSite.type) {
				case 'kickz':
					newTask_Style[0].parentElement.style.display = 'none';
					newTask_Category[0].parentElement.style.display = 'none';
					newTask_SearchInput[0].placeholder = 'Enter Product Url.';

					let wireMode: HTMLOptionElement = document.createElement('option');
					wireMode.label = 'Request - Wire Transfer';
					wireMode.value = 'kickz-wire';
					newTask_Mode.add(wireMode);

					let paypalMode: HTMLOptionElement = document.createElement('option');
					paypalMode.label = 'Request - PayPal';
					paypalMode.value = 'kickz-paypal';
					newTask_Mode.add(paypalMode);
					break;

				case 'supreme':

					newTask_Style[0].parentElement.style.display = 'flex';
					newTask_Category[0].parentElement.style.display = 'flex';
					newTask_SearchInput[0].placeholder = 'Eg: +tagless,-tank';

					requestMode.label = 'Fast';
					requestMode.value = 'supreme-request';
					newTask_Mode.add(requestMode);

					let browserMode: HTMLOptionElement = document.createElement('option');
					browserMode.label = 'Safe';
					browserMode.value = 'supreme-browser';
					newTask_Mode.add(browserMode);
					break;

				case 'shopify':
					newTask_Style[0].parentElement.style.display = 'none';
					newTask_Category[0].parentElement.style.display = 'none';
					newTask_SearchInput[0].placeholder = 'Enter Keywords or Product Url.';

					let fastMode: HTMLOptionElement = document.createElement('option');
					fastMode.label = 'API (Fast)';
					fastMode.value = 'shopify-api';
					newTask_Mode.add(fastMode);

					let safeMode: HTMLOptionElement = document.createElement('option');
					safeMode.label = 'Frontend (Safe)';
					safeMode.value = 'shopify-frontend';
					newTask_Mode.add(safeMode);

					break;
				default: console.log(selectedSite.type);
			}
			try {
				newTask_Mode.onchange(new Event(''));
			}
			catch (err) { }

			newTask_styles.onchange = function (this: HTMLSelectElement): void {
				newTask_Style[0].value = this.value;
			};

			newTask_sizes.onchange = function (this: HTMLSelectElement): void {
				newTask_Size[0].value = this.value;
			};

			newTask_sizes.onchange = function (this: HTMLSelectElement): void {
				newTask_Size[0].value = this.value;
			};


			dropList()
				.then((dropData: any): void => {
					if (dropData[selectedSite.type]) {
						newTask_products.options.length = 1;
						let data: any = dropData[selectedSite.type];
						let itemNames: any = Object.keys(data);

						for (let i: number = 0; i < itemNames.length; i++) {
							let option: HTMLOptionElement = document.createElement('option');
							option.label = itemNames[i];
							option.value = itemNames[i];
							newTask_products.options.add(option);
						}

						newTask_products.onchange = function (this: HTMLSelectElement): void {
							newTask_Size[0].value = '';
							// if (!this.value) {
							// 	return customRow.style.display = 'flex';
							// }
							//customRow.style.display = 'none';
							let selectedItem: any = data[this.value] ? data[this.value] : {};
							newTask_SearchInput[0].value = selectedItem.keywords;
							newTask_Category[0].value = selectedItem.category;
							newTask_styles.options.length = 0;
							for (let i: number = 0; i < selectedItem.styles.length; i++) {
								let option: HTMLOptionElement = document.createElement('option');
								option.label = selectedItem.styles[i].name;
								option.value = selectedItem.styles[i].keywords;
								newTask_styles.options.add(option);
							}
							
							try {
								newTask_styles.onchange(new Event(''));
							}
							catch (err) { console.log(err); }

							newTask_sizes.options.length = 4;
							for (let i: number = 0; i < selectedItem.sizes.length; i++) {
								let option: HTMLOptionElement = document.createElement('option');
								option.label = selectedItem.sizes[i].name;
								option.value = selectedItem.sizes[i].keywords;
								newTask_sizes.options.add(option);
							}
							
						};

					}
					else {
						console.log(dropData);
					}
				});

		}
	};
}

function renderCountries(): void {
	var countrySelectors: NodeListOf<HTMLSelectElement> = document.querySelectorAll('.country-selector');
	for (let i: number = 0; i < config.countries.length; i++) {
		for (let j: number = 0; j < countrySelectors.length; j++) {
			let option: HTMLOptionElement = document.createElement('option');
			option.label = config.countries[i].label;
			option.value = config.countries[i].value;
			countrySelectors[j].add(option);
		}
	}
	for (let i: number = 0; i < countrySelectors.length; i++) {
		countrySelectors[i].value = 'gb';
	}
	renderStates('profileBillingState', 'GB');
	renderStates('profileShippingState', 'GB');
}

function renderStates(selector: string, value: string): void {
	let selectedCountry: any = config.countries.find((country: any): boolean => { return country.value === value; });
	let hasStates: boolean = selectedCountry.hasOwnProperty('states');
	let stateElement: HTMLSelectElement = <HTMLSelectElement>document.getElementById(selector);
	stateElement.options.length = 0;

	if (hasStates) {
		stateElement.disabled = false;
		for (let i: number = 0; i < selectedCountry.states.length; i++) {
			let option: HTMLOptionElement = document.createElement('option');
			option.label = selectedCountry.states[i].label;
			option.value = selectedCountry.states[i].value;
			stateElement.add(option);
		}
	}
	else {
		stateElement.disabled = true;
	}
}

function renderProxyListSelectors(): void {
	let proxyLists: any = settings.has('proxies') ? settings.get('proxies') : {};

	document.querySelectorAll('.proxylist-selector').forEach(function (element: HTMLSelectElement): void {
		element.options.length = 1;
	});

	for (let i: number = 0; i < Object.keys(proxyLists).length; i++) {
		let name: any = Object.keys(proxyLists)[i];

		document.querySelectorAll('.proxylist-selector').forEach(function (element: any): void {
			let option: HTMLOptionElement = document.createElement('option');
			option.label = name;
			option.value = name;
			element.options.add(option);
		});
	}
}

function renderHarvesters(): void {
	var harvesterTable: HTMLElement = document.getElementById('harvesterTable');
	harvesterTable.innerHTML = '';
	let existingHarvesters: any = settings.has('captchaHarvesters') ? settings.get('captchaHarvesters') : [];
	for (let i: number = 0; i < existingHarvesters.length; i++) {
		let harvesterRow: HTMLTableRowElement = document.createElement('tr');
		harvesterRow.className = 'row';

		let nameCell: HTMLTableCellElement = document.createElement('td');
		nameCell.innerHTML = existingHarvesters[i].name;
		nameCell.className = 'cell cell-body col-profile';


		let siteCell: HTMLTableCellElement = document.createElement('td');
		siteCell.className = 'cell cell-body col-site';

		let siteSelector: HTMLSelectElement = document.createElement('select');
		siteSelector.setAttribute('class', 'input');
		config.sites.captcha.forEach((site: any): void => {
			let option: HTMLOptionElement = document.createElement('option');
			option.label = site.label;
			option.value = site.value;
			siteSelector.add(option);
		});

		siteCell.appendChild(siteSelector);


		let actionsCell: HTMLTableCellElement = document.createElement('td');
		actionsCell.className = 'cell cell-body table-row col-actions';

		let launchButton: HTMLElement = document.createElement('div');
		launchButton.innerHTML = '<i class="fas fa-external-link-alt"></i>';
		launchButton.className = 'action-button';
		launchButton.onclick = function (): void {
			ipcRenderer.send('captcha.launch', {
				'sessionName': existingHarvesters[i].name,
				'site': siteSelector.value
			});
		};

		let loginButton: HTMLElement = document.createElement('div');
		loginButton.innerHTML = '<i class="fab fa-youtube"></i>';
		loginButton.className = 'action-button';
		loginButton.onclick = function (): void {
			ipcRenderer.send('captcha.signIn', {
				'sessionName': existingHarvesters[i].name,
				'type': 'renew'
			});
		};

		let deleteButton: HTMLElement = document.createElement('div');
		deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
		deleteButton.className = 'action-button';
		deleteButton.onclick = function (): void {
			try {
				let existingHarvesters2: any = settings.get('captchaHarvesters');
				let newHarvestrerArray: any = existingHarvesters2.filter((harvester: { name: string }): boolean => {
					return harvester.name !== existingHarvesters[i].name;
				});
				settings.set('captchaHarvesters', newHarvestrerArray, { prettify: true });
				renderHarvesters();
			}
			catch (err) { }
		};

		actionsCell.appendChild(launchButton);
		actionsCell.appendChild(loginButton);
		actionsCell.appendChild(deleteButton);

		harvesterRow.appendChild(nameCell);
		harvesterRow.appendChild(siteCell);
		harvesterRow.appendChild(actionsCell);

		harvesterTable.appendChild(harvesterRow);
	}
}


function convertCardType(type: string): string {
	switch(type) {
		case 'visa':
			return '<i class="fab fa-cc-visa fa-2x"></i> **** **** **** ';
		case 'master':
			return '<i class="fab fa-cc-mastercard fa-2x"></i> **** **** **** ';
		case 'american_express':
			return '<i class="fab fa-cc-amex fa-2x"></i> **** ****** *';
		default:
			return '';
	}
}

function renderProfileSelectors(): void {
	let existingProfiles: UserData.allProfiles = settings.has('profiles') ? <UserData.allProfiles><undefined>settings.get('profiles') : {};
	let profileTableBody: HTMLTableElement = <HTMLTableElement>document.getElementById('profileTableBody');
	profileTableBody.innerHTML = '';
	for (let i: number = 0; i < Object.keys(existingProfiles).length; i++) {
		let profileId: string = Object.keys(existingProfiles)[i];
		let profileRow: HTMLTableRowElement = document.createElement('tr');
		profileRow.className = 'row';
		profileRow.setAttribute('data-id', (profileId ? profileId : ''));
		profileRow.onclick = function (this: HTMLElement, event: MouseEvent): void {

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


			let profiles: any = settings.has('profiles') ? settings.get('profiles') : {};
			const profileData: any = profiles[this.dataset.id];
			profileId.value = this.dataset.id ? this.dataset.id : '';
			profileName.value = profileData.profileName ? profileData.profileName : '';

			try {
				billingFirst.value = profileData.billing.first;
				billingLast.value = profileData.billing.last;
				billingEmail.value = profileData.billing.email;
				billingTelephone.value = profileData.billing.telephone;
				billingAddress1.value = profileData.billing.address1;
				billingAddress2.value = profileData.billing.address2;
				billingCity.value = profileData.billing.city;
				billingZip.value = profileData.billing.zip;
				billingCountry.value = profileData.billing.country;
				billingState.value = profileData.billing.state;

				shippingFirst.value = profileData.shipping.first;
				shippingLast.value = profileData.shipping.last;
				shippingEmail.value = profileData.shipping.email;
				shippingTelephone.value = profileData.shipping.telephone;
				shippingAddress1.value = profileData.shipping.address1;
				shippingAddress2.value = profileData.shipping.address2;
				shippingCity.value = profileData.shipping.city;
				shippingZip.value = profileData.shipping.zip;
				shippingCountry.value = profileData.shipping.country;
				shippingState.value = profileData.shipping.state;

				paymentType.value = profileData.payment.type;
				cardNumber.value = profileData.payment.cardNumber;
				cardExpiryMonth.value = profileData.payment.expiryMonth;
				cardExpiryYear.value = profileData.payment.expiryYear;
				cardCvv.value = profileData.payment.cvv;


				(<any>$('#profileModal')).modal('show');
			}
			catch (error) { console.error(error); }
		};

		let profileCell: HTMLTableCellElement = document.createElement('td');
		profileCell.innerHTML = existingProfiles[profileId].profileName ? existingProfiles[profileId].profileName : '';
		profileCell.className = 'cell cell-body col-profile';
		profileRow.appendChild(profileCell);

		let nameCell: HTMLTableCellElement = document.createElement('td');
		nameCell.innerHTML = `${existingProfiles[profileId].billing.first} ${existingProfiles[profileId].billing.last}`;
		nameCell.className = 'cell cell-body col-site';
		profileRow.appendChild(nameCell);

		let addressCell: HTMLTableCellElement = document.createElement('td');
		addressCell.innerHTML = `${existingProfiles[profileId].billing.address1} ${existingProfiles[profileId].billing.address2} ${existingProfiles[profileId].billing.country} ${existingProfiles[profileId].billing.state}`;
		addressCell.className = 'cell cell-body col-products';
		profileRow.appendChild(addressCell);

		let cardCell: HTMLTableCellElement = document.createElement('td');
		cardCell.innerHTML = `${convertCardType(existingProfiles[profileId].payment.type)}${existingProfiles[profileId].payment.cardNumber.substr(-4)}`;
		cardCell.className = 'cell cell-body col-status';
		profileRow.appendChild(cardCell);

		let actionsCell: HTMLTableCellElement = document.createElement('td');
		actionsCell.className = 'cell cell-body table-row col-actions';


		let editButton: HTMLElement = document.createElement('div');
		editButton.innerHTML = '<i class="fas fa-edit"></i>';
		editButton.className = 'action-button';
		editButton.setAttribute('data-id', (profileId ? profileId : ''));
		editButton.onclick = function (event: MouseEvent): void {
			event.stopImmediatePropagation();
		};

		//actionsCell.appendChild(editButton);

		let duplicateButton: HTMLElement = document.createElement('div');
		duplicateButton.innerHTML = '<i class="fas fa-clone"></i>';
		duplicateButton.className = 'action-button';
		duplicateButton.setAttribute('data-id', profileId ? profileId : '');
		duplicateButton.onclick = function (this: HTMLElement, event: MouseEvent): void {
			event.stopImmediatePropagation();
			let profiles: any = settings.has('profiles') ? settings.get('profiles') : {};
			const profileData: profileDataProps = profiles[this.dataset.id];
			profileActions.save(null, profileData);
			renderProfileSelectors();
		};
		actionsCell.appendChild(duplicateButton);

		let deleteButton: HTMLElement = document.createElement('div');
		deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
		deleteButton.className = 'action-button';
		deleteButton.onclick = function (event: MouseEvent): void {
			event.stopImmediatePropagation();
			let existingProfiles2: any = settings.get('profiles');
			delete existingProfiles2[profileId];
			settings.set('profiles', existingProfiles2, { prettify: true });
			renderProfileSelectors();

		};
		actionsCell.appendChild(deleteButton);

		profileRow.appendChild(actionsCell);

		(<any>document.getElementById('profileTableBody')).appendChild(profileRow);
		// 	let profileContainer = document.createElement('div');
		// 	profileContainer.setAttribute('class', 'panel panel-light panel-fixed-25');

		// 	let profileTitle = document.createElement('h2');
		// 	profileTitle.setAttribute('class', 'panel-title');
		// 	profileTitle.innerHTML = `<i></i><span>${profileId}</span>`;

		// /* ----------------------------------------------------------------------------- */
		// 	let nameRow = document.createElement('div');
		// 	nameRow.setAttribute('class', 'container');

		// 	let nameWrapper = document.createElement('div');
		// 	nameWrapper.setAttribute('class', 'container-element');

		// 	let fullName = document.createElement('label');
		// 	fullName.innerHTML = `${existingProfiles[profileId].billing.first} ${existingProfiles[profileId].billing.last}`;

		// 	nameWrapper.appendChild(fullName)
		// 	nameRow.appendChild(nameWrapper);

		// /* ----------------------------------------------------------------------------- */
		// 	let typeRow = document.createElement('div');
		// 	typeRow.setAttribute('class', 'container');

		// 	let typeWrapper = document.createElement('div');
		// 	typeWrapper.setAttribute('class', 'container-element');

		// 	let cardType = document.createElement('label');
		// 	cardType.innerHTML = `${existingProfiles[profileId].billing.address1} ${existingProfiles[profileId].billing.address2}`;
		// 	typeWrapper.appendChild(cardType)
		// 	typeRow.appendChild(typeWrapper);

		// /* ----------------------------------------------------------------------------- */

		// 	let numberRow = document.createElement('div');
		// 	numberRow.setAttribute('class', 'container');

		// 	let maskedNumberWrapper = document.createElement('div');
		// 	maskedNumberWrapper.setAttribute('class', 'container-element');

		// 	let maskedNumber = document.createElement('label');
		// 	maskedNumber.innerHTML = '**** **** **** ' + existingProfiles[profileId].payment.cardNumber.substr(-4)

		// 	maskedNumberWrapper.appendChild(maskedNumber)
		// 	numberRow.appendChild(maskedNumberWrapper);

		// /* ----------------------------------------------------------------------------- */

		// 	let optionsRow = document.createElement('div');
		// 	optionsRow.setAttribute('class', 'container');

		// 	let editBtnWrapper = document.createElement('div');
		// 	editBtnWrapper.setAttribute('class', 'container-element');
		// 	let editBtn = document.createElement('button');
		// 	editBtn.setAttribute('class', 'btn btn-transparent');
		// 	editBtn.setAttribute('data-name', profileId)
		// 	editBtn.innerHTML = '<i class="fas fa-edit"></i><span>Edit</span>';
		// 	editBtn.onclick = function () {
		// 		const profileData = settings.get('profiles')[this.dataset.name]
		// 		document.getElementById('profileName').value = this.dataset.name;
		// 		try {
		// 			billingFirst.value = profileData.billing.first
		// 			billingLast.value = profileData.billing.last
		// 			billingEmail.value = profileData.billing.email
		// 			billingTelephone.value = profileData.billing.telephone
		// 			billingAddress1.value = profileData.billing.address1
		// 			billingAddress2.value = profileData.billing.address2
		// 			billingCity.value = profileData.billing.city
		// 			billingZip.value = profileData.billing.zip
		// 			billingCountry.value = profileData.billing.country
		// 			billingState.value = profileData.billing.state

		// 			shippingFirst.value = profileData.shipping.first
		// 			shippingLast.value = profileData.shipping.last
		// 			shippingEmail.value = profileData.shipping.email
		// 			shippingTelephone.value = profileData.shipping.telephone
		// 			shippingAddress1.value = profileData.shipping.address1
		// 			shippingAddress2.value = profileData.shipping.address2
		// 			shippingCity.value = profileData.shipping.city
		// 			shippingZip.value = profileData.shipping.zip
		// 			shippingCountry.value = profileData.shipping.country
		// 			shippingState.value = profileData.shipping.state

		// 			paymentType.value = profileData.payment.type
		// 			cardNumber.value = profileData.payment.cardNumber
		// 			cardExpiryMonth.value = profileData.payment.expiryMonth
		// 			cardExpiryYear.value = profileData.payment.expiryYear
		// 			cardCvv.value = profileData.payment.cvv


		// 			$('#profileModal').modal('show')
		// 		}
		// 		catch(error) { console.error(error)}
		// 	}

		// 	editBtnWrapper.appendChild(editBtn)
		// 	optionsRow.appendChild(editBtnWrapper);

		// 	let deleteBtnWrapper = document.createElement('div');
		// 	deleteBtnWrapper.setAttribute('class', 'container-element');
		// 	let deleteBtn = document.createElement('button');
		// 	deleteBtn.setAttribute('class', 'btn btn-transparent');
		// 	deleteBtn.innerHTML = '<i class="fas fa-trash"></i><span>Delete</span>';
		// 	deleteBtn.onclick = function () {
		// 		let existingProfiles2 = settings.get('profiles');
		// 		delete existingProfiles2[profileId];
		// 		settings.set('profiles', existingProfiles2, { prettify: true})
		// 		renderProfileSelectors()
		// 	}


		// 	deleteBtnWrapper.appendChild(deleteBtn)
		// 	optionsRow.appendChild(deleteBtnWrapper);

		// /* ----------------------------------------------------------------------------- */

		// 	profileContainer.appendChild(profileTitle);
		// 	profileContainer.appendChild(nameRow);
		// 	profileContainer.appendChild(typeRow);
		// 	profileContainer.appendChild(numberRow);
		//   profileContainer.appendChild(optionsRow);

		// 	profilesWrapper.appendChild(profileContainer);

	}
	profileSelector.forEach((element: HTMLSelectElement): void => {
		element.options.length = 0;
		let existingProfiles: any = settings.has('profiles') ? settings.get('profiles') : {};
		for (let i: number = 0; i < Object.keys(existingProfiles).length; i++) {
			let profileId: string = Object.keys(existingProfiles)[i];
			let option: HTMLOptionElement = document.createElement('option');
			option.value = profileId;
			option.label = existingProfiles[profileId].profileName || 'Nameless Profile';
			element.options.add(option);
		}
	});
}

// function addTableRow(table, data = []) {
// 	if (typeof data !== 'object' || data.length < 1) return;
// 	let row = document.createElement('tr');
// 	row.classList.add('row');
// 	for (let i = 0; i < data.length; i++) {
// 		let cell = document.createElement('td');
// 		cell.classList.add('cell');
// 		cell.classList.add('cell-body');
// 		cell.classList.add(data[i].class);
// 		cell.innerHTML = data[i].text;
// 		row.appendChild(cell);
// 	}
// 	table.appendChild(row);
// }

function renderOrderTable(): void {
	var orderTableBody: HTMLElement = document.getElementById('orderTableBody');
	let orders: any = settings.has('orders') ? settings.get('orders') : [];
	orderTableBody.innerHTML = '';

	try {
		for (let i: number = 0; i < orders.length; i++) {
			let orderRow: HTMLTableRowElement = document.createElement('tr');
			orderRow.className = 'row';


			let dateCell: HTMLTableCellElement = document.createElement('td');
			dateCell.innerHTML = orders[i].date;
			dateCell.className = 'cell cell-body col-id';
			orderRow.appendChild(dateCell);

			let storeCell: HTMLTableCellElement = document.createElement('td');
			storeCell.innerHTML = orders[i].site;
			storeCell.className = 'cell cell-body col-site';
			orderRow.appendChild(storeCell);

			let productCell: HTMLTableCellElement = document.createElement('td');
			productCell.innerHTML = orders[i].product;
			productCell.className = 'cell cell-body col-products';
			productCell.style.justifyContent = 'center';
			orderRow.appendChild(productCell);

			let orderNumberCell: HTMLTableCellElement = document.createElement('td');
			orderNumberCell.innerHTML = orders[i].orderNumber;
			orderNumberCell.className = 'cell cell-body col-order';
			orderRow.appendChild(orderNumberCell);

			let actionsCell: HTMLTableCellElement = document.createElement('td');
			actionsCell.className = 'cell cell-body table-row col-actions-sm';

			let deleteButton: HTMLElement = document.createElement('div');
			deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
			deleteButton.className = 'action-button';

			actionsCell.appendChild(deleteButton);

			orderRow.appendChild(actionsCell);
			orderTableBody.appendChild(orderRow);

		}
	} catch (err) { console.log(err); }
}

// function setProxyLists() {

// }


export const tasks: Function = renderTaskTable;
export const profiles: Function = renderProfileSelectors;
export const proxies: Function = renderProxyTable;
export const proxySelectors: Function = renderProxyListSelectors;
export const sites: Function = renderSites;
export const countries: Function = renderCountries;
export const states: Function = renderStates;
export const orders: Function = renderOrderTable;
export const harvesters: Function = renderHarvesters;


//General

var profileSelector: NodeListOf<HTMLSelectElement> = document.querySelectorAll('.profile-selector');

var siteSelectors: NodeListOf<HTMLSelectElement> = document.querySelectorAll('.site-selector');

//Dashboard




//Task Creator
var newTask_Site: HTMLSelectElement = <HTMLSelectElement>document.getElementById('taskSite');
var newTask_Profile: HTMLSelectElement = <HTMLSelectElement>document.getElementById('taskProfile');
var newTask_Mode: HTMLSelectElement = <HTMLSelectElement>document.getElementById('taskMode');
var newTask_RestockMode: HTMLSelectElement = <HTMLSelectElement>document.getElementById('newTaskMonitorMode');
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

var newTask_id: HTMLInputElement = <HTMLInputElement>document.getElementById('taskId');

//Profile Creator


var proxyTestSite: HTMLSelectElement = <HTMLSelectElement>document.getElementById('proxySiteSelector');




//Analytics
