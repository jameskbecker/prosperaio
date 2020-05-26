const settings = require('electron-settings');
const { ipcRenderer } = require('electron');
const { countries, sites } = require('../library/configuration');
const $ = require('jquery');
const dropData = require('../mock-drop');
let selectedItem;
function convertMode(id) {
	let modes = {
		'supreme-request': 'Fast',
		'supreme-browser': 'Safe',
		'kickz-wire': 'Wire Transfer',
		'kickz-paypal': 'Paypal'
	}
	return modes.hasOwnProperty(id) ? modes[id] : null
}

function renderTaskTable() {
	let tasks = settings.has('tasks') ? settings.get('tasks') : {};
	tasksHeader.innerHTML = `Tasks (${Object.keys(tasks).length} Total)`;
	taskTableBody.innerHTML = '';

	try {
		for (let i = 0; i < Object.keys(tasks).length; i++) {
			let taskRow = document.createElement('tr');
			taskRow.className = 'row';

			let taskId = Object.keys(tasks)[i];
			// let idCell = document.createElement('td');
			// idCell.innerHTML = taskId;
			// idCell.className = 'cell cell-body col-id';
			// taskRow.appendChild(idCell);

			let siteCell = document.createElement('td');
			siteCell.innerHTML = sites.default[tasks[taskId].site].label;
			siteCell.className = 'cell cell-body col-site';
			taskRow.appendChild(siteCell);

			let modeCell = document.createElement('td');
			modeCell.innerHTML = convertMode(tasks[taskId].setup.mode);
			modeCell.className = 'cell cell-body col-mode';
			taskRow.appendChild(modeCell);

			let searchInputCell = document.createElement('td');
			searchInputCell.innerHTML = tasks[taskId].products[0].searchInput;
			searchInputCell.className = 'cell cell-body col-products';
			searchInputCell.setAttribute('data-id', taskId);
			taskRow.appendChild(searchInputCell);






			let sizeCell = document.createElement('td');
			sizeCell.innerHTML = tasks[taskId].products[0].size;
			sizeCell.className = 'cell cell-body col-size';
			sizeCell.setAttribute('data-id', taskId);
			taskRow.appendChild(sizeCell);

			let profileCell = document.createElement('td');
			profileCell.innerHTML = tasks[taskId].setup.profile;
			profileCell.className = 'cell cell-body col-profile';
			taskRow.appendChild(profileCell);

			let proxyCell = document.createElement('td');
			proxyCell.innerHTML = tasks[taskId].additional.proxyList ? tasks[taskId].additional.proxyList : 'None';
			proxyCell.className = 'cell cell-body col-task-proxy';
			taskRow.appendChild(proxyCell);



			let timerCell = document.createElement('td');
			timerCell.innerHTML = tasks[taskId].additional.timer !== ' ' ? tasks[taskId].additional.timer : 'None';
			timerCell.className = 'cell cell-body col-timer';
			taskRow.appendChild(timerCell);

			let statusCell = document.createElement('td');
			statusCell.innerHTML = 'Idle.';
			statusCell.className = 'cell cell-body col-status';
			statusCell.setAttribute('data-taskId', taskId);
			taskRow.appendChild(statusCell);

			let actionsCell = document.createElement('td');
			actionsCell.className = 'cell cell-body table-row col-actions';

			let startButton = document.createElement('div');
			startButton.innerHTML = '<i class="fas fa-play"></i>';
			startButton.className = 'action-button';
			startButton.setAttribute('data-taskId', taskId);
			startButton.onclick = function () {
				stopButton.style.color = 'var(--primary-color)';
				startButton.style.color = 'var(--secondary-color)';
				
				startButton.setAttribute('disabled', true);
				stopButton.setAttribute('disabled', false);
				
				startButton.style.opacity = 0.2;
				stopButton.style.opacity = 0.5;
				
				ipcRenderer.send('task.run', startButton.getAttribute('data-taskId'));
			};
			actionsCell.appendChild(startButton);

			let stopButton = document.createElement('div');
			stopButton.innerHTML = '<i class="fas fa-stop"></i>';
			stopButton.className = 'action-button';
			
			stopButton.style.color = 'var(--secondary-color)';
			stopButton.setAttribute('disabled', true);
			stopButton.style.opacity = 0.2;

			
			stopButton.setAttribute('data-taskId', taskId);
			stopButton.onclick = function () {
				startButton.style.color = 'var(--primary-color)';
				stopButton.style.color = 'var(--secondary-color)';
				
				stopButton.setAttribute('disabled', true);
				startButton.setAttribute('disabled', false);
				
				startButton.style.opacity = 0.5;
				stopButton.style.opacity = 0.2;
			
				
				ipcRenderer.send('task.stop', taskId)
			};
			actionsCell.appendChild(stopButton);

			// let editButton = document.createElement('div');
			// editButton.innerHTML = '<i class="fas fa-edit"></i>';
			// editButton.className = 'action-button';
			// editButton.setAttribute('data-taskId', taskId);
			// editButton.onclick = function () { 
			// 	require('jquery')('#newTaskModal').modal('show');
			// 	let tasks = settings.get('tasks');

			// 	newTask_Site.value = tasks[taskId].site;
			// 	newTask_Profile.value = tasks[taskId].setup.profile;
			// 	newTask_CheckoutAttempts.value = tasks[taskId].setup.checkoutAttempts;
			// 	newTask_Quantity.value = '1';
			// 	newTask_Mode.value = tasks[taskId].setup.mode;
			// 	newTask_RestockMode.value = tasks[taskId].setup.restockMode;

			// 	newTask_CartDelay.value = tasks[taskId].delays.cart;
			// 	newTask_CheckoutDelay.value = tasks[taskId].delays.checkout;

			// 	newTask_ProxyList.value;
			// 	newTask_PriceLimit.value;
			// 	newTask_StartDate.value;
			// 	newTask_StartTime.value;

			// 	newTask_Restocks.checked = tasks[taskId].additional.monitorRestocks;
			// 	newTask_SkipCaptcha.checked = tasks[taskId].additional.skipCaptcha;
			// 	newTask_threeD.checked = tasks[taskId].additional.enableThreeDS;

			// 	newTask_SearchInput[0].value = tasks[taskId].products[0].searchInput;
			// 	newTask_Style[0].value = tasks[taskId].products[0].style;
			// 	newTask_Category[0].value = tasks[taskId].products[0].category;
			// 	newTask_Size[0].value = tasks[taskId].products[0].size;
			// 	newTask_ProductQty[0].value = tasks[taskId].products[0].productQty;
			// };
			//actionsCell.appendChild(editButton);

			let duplicateButton = document.createElement('div');
			duplicateButton.innerHTML = '<i class="fas fa-clone"></i>';
			duplicateButton.className = 'action-button';
			duplicateButton.setAttribute('data-taskId', taskId);
			duplicateButton.onclick = function () {
				ipcRenderer.send('task.duplicate', taskId)
			};
			actionsCell.appendChild(duplicateButton);

			let deleteButton = document.createElement('div');
			deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
			deleteButton.className = 'action-button';
			deleteButton.setAttribute('data-taskId', taskId);
			deleteButton.onclick = function () {
				ipcRenderer.send('task.delete', taskId)
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

		};
	} catch (err) { console.log(err) }
}

function renderProxyTable(name) {
	try {
		let proxyLists = settings.has('proxies') ? settings.get('proxies') : {};
		let list = proxyLists[name];
		if (list) {
			document.getElementById('proxy-header').innerHTML = '';
			document.getElementById('proxy-header').innerHTML = `Proxies (${Object.keys(list).length} Total)`;
			proxyTestTable.innerHTML = '';
			for (let i = 0; i < Object.keys(list).length; i++) {
				let proxyId = Object.keys(list)[i]
				let proxyRow = document.createElement('tr');
				proxyRow.className = 'row';
				proxyRow.setAttribute('data-row-id', proxyId)

				let splitProxy = list[proxyId].split(':');
				let ipCell = document.createElement('td');
				ipCell.innerHTML = splitProxy[0] ? splitProxy[0] : 'localhost';
				ipCell.className = 'cell cell-body col-proxy';
				proxyRow.appendChild(ipCell);

				let portCell = document.createElement('td');
				if (splitProxy.length > 1) portCell.innerHTML = splitProxy[1];
				else portCell.innerHTML = 'None';
				portCell.className = 'cell cell-body col-proxyPort';
				proxyRow.appendChild(portCell);


				let userCell = document.createElement('td');
				if (splitProxy.length > 3) userCell.innerHTML = splitProxy[2];
				else userCell.innerHTML = 'None';
				userCell.className = 'cell cell-body col-proxyUser';
				proxyRow.appendChild(userCell);

				let passCell = document.createElement('td');
				if (splitProxy.length > 3) passCell.innerHTML = splitProxy[3];
				else passCell.innerHTML = 'None';
				passCell.className = 'cell cell-body col-proxy';
				proxyRow.appendChild(passCell);

				let statusCell = document.createElement('td');
				statusCell.className = 'cell cell-body col-status col-proxy';
				statusCell.innerHTML = 'Idle.'
				statusCell.setAttribute('data-proxyId', proxyId);
				proxyRow.appendChild(statusCell);

				let actionsCell = document.createElement('td');
				actionsCell.className = 'cell cell-body col-proxy';

				let startButton = document.createElement('div');
				startButton.innerHTML = '<i class="fas fa-vial"></i>';
				startButton.className = 'action-button';
				startButton.setAttribute('data-proxyId', proxyId);
				startButton.onclick = function () {
					ipcRenderer.send('proxyList.test', {
						baseUrl: proxyTestSite.value,
						id: proxyId,
						input: list[proxyId],
					})
				};
				actionsCell.appendChild(startButton);

				let deleteButton = document.createElement('div');
				deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
				deleteButton.className = 'action-button';
				deleteButton.onclick = function () {
					delete list[proxyId];
					settings.set('proxies', proxyLists, { prettify: true })
					let row = this.parentNode.parentNode
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

function renderSites() {
	const siteKeys = Object.keys(sites.default);
	for (let i = 0; i < siteKeys.length; i++) {
		let site = sites.default[siteKeys[i]];
		if (site.enabled) {
			for (let j = 0; j < document.querySelectorAll('.site-selector').length; j++) {
				let siteOption = document.createElement('option');
				siteOption.value = siteKeys[i];
				siteOption.label = site.label;
				document.querySelectorAll('.site-selector')[j].add(siteOption);
			};
		}
	}
	newTask_Site.onchange = function () {
		newTask_Mode.disabled = false;
		newTask_RestockMode.disabled = false;
		let selectedSite = sites.default[this.value] || null;
		if (selectedSite) {
			newTask_Mode.onchange = function () {
				newTask_RestockMode.options.length = 0;

				let stockMode = document.createElement('option');
				stockMode.label = 'Stock (Recommended)';
				stockMode.value = 'stock';

				let cartMode = document.createElement('option');
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
						newTask_Headless.disabled = false;
						newTask_UseProxy.checked = false;
						newTask_UseProxy.disabled = true;
						newTask_UseProxy.onchange();
						break;
					case 'shopify-api':
						newTask_RestockMode.add(stockMode);
						break;
					case 'shopify-frontend':
						newTask_RestockMode.add(stockMode);
						break;
					default: console.log('No Onchange Event for:', this.value)
				}
			}
			newTask_Style[0].disabled = false;
			newTask_Category[0].disabled = false;
			newTask_Size[0].disabled = false;
			newTask_ProductQty[0].disabled = false;
			newTask_SearchInput[0].disabled = false;
			newTask_Mode.options.length = 0;
			let requestMode = document.createElement('option');
			if (dropData[selectedSite.type]) {
				document.getElementById("newTaskProducts").options.length = 1;
				let data = dropData[selectedSite.type];
				let itemNames = Object.keys(data);

				for (let i = 0; i < itemNames.length; i++) {
					let option = document.createElement('option');
					option.label = itemNames[i];
					option.value = itemNames[i];
					document.getElementById("newTaskProducts").options.add(option)
				}

				document.getElementById("newTaskProducts").onchange = function () {
					newTask_Size[0].value = '';
					// if (!this.value) {
					// 	return customRow.style.display = 'flex';
					// }
					//customRow.style.display = 'none';
					selectedItem = data[this.value] || {};
					newTask_SearchInput[0].value = selectedItem.keywords;
					newTask_Category[0].value = selectedItem.category;
					let styles = document.getElementById("newTaskStyles");
					styles.options.length = 0;
					for (let i = 0; i < selectedItem.styles.length; i++) {
						let option = document.createElement('option');
						option.label = selectedItem.styles[i].name;
						option.value = selectedItem.styles[i].keywords;
						styles.options.add(option);
					}
					styles.onchange = function () {
						newTask_Style[0].value = this.value;

					}
					try { styles.onchange(); } catch (err) { console.log(err) }
					let sizes = document.getElementById('newTaskSizes');
					sizes.options.length = 5;
					for (let i = 0; i < selectedItem.sizes.length; i++) {
						let option = document.createElement('option');
						option.label = selectedItem.sizes[i].name;
						option.value = selectedItem.sizes[i].keywords;
						sizes.options.add(option);
					}
					sizes.onchange = function () {
						newTask_Size[0].value = this.value;
					}
				}

			}
			switch (selectedSite.type) {
				case 'kickz':
					newTask_Style[0].parentElement.style.display = 'none';
					newTask_Category[0].parentElement.style.display = 'none';
					newTask_SearchInput[0].placeholder = "Enter Product Url.";

					let wireMode = document.createElement('option');
					wireMode.label = 'Request - Wire Transfer';
					wireMode.value = 'kickz-wire';
					newTask_Mode.add(wireMode);

					let paypalMode = document.createElement('option');
					paypalMode.label = 'Request - PayPal';
					paypalMode.value = 'kickz-paypal';
					newTask_Mode.add(paypalMode);
					break;

				case 'supreme':

					newTask_Style[0].parentElement.style.display = 'flex';
					newTask_Category[0].parentElement.style.display = 'flex';
					newTask_SearchInput[0].placeholder = "Enter Keywords.";

					requestMode.label = 'Fast';
					requestMode.value = 'supreme-request';
					newTask_Mode.add(requestMode);

					let browserMode = document.createElement('option');
					browserMode.label = 'Safe';
					browserMode.value = 'supreme-browser';
					newTask_Mode.add(browserMode);
					break;

				case 'shopify':
					newTask_Style[0].parentElement.style.display = 'none';
					newTask_Category[0].parentElement.style.display = 'none';
					newTask_SearchInput[0].placeholder = "Enter Keywords or Product Url.";

					let fastMode = document.createElement('option');
					fastMode.label = 'API (Fast)';
					fastMode.value = 'shopify-api';
					newTask_Mode.add(fastMode);

					let safeMode = document.createElement('option');
					safeMode.label = 'Frontend (Safe)';
					safeMode.value = 'shopify-frontend';
					newTask_Mode.add(safeMode);

					break;
				default: console.log(selectedSite.type)
			}
			try {
				newTask_Mode.onchange();
			}
			catch (err) { }


		}
	}
}

function renderCountries() {
	for (let i = 0; i < countries.length; i++) {
		for (let j = 0; j < countrySelectors.length; j++) {
			let option = document.createElement('option')
			option.label = countries[i].label;
			option.value = countries[i].value;
			countrySelectors[j].add(option);
		}
	}
	for (let i = 0; i < countrySelectors.length; i++) {
		countrySelectors[i].value = 'gb';
	}
	renderStates('profileBillingState', 'GB');
	renderStates('profileShippingState', 'GB');
}

function renderStates(selector, value) {
	let selectedCountry = countries.filter(country => { return country.value === value })[0];
	let hasStates = selectedCountry.hasOwnProperty('states');
	console.log(document.getElementById(selector))
	document.getElementById(selector).options.length = 0;

	if (hasStates) {
		document.getElementById(selector).disabled = false;
		for (let i = 0; i < selectedCountry.states.length; i++) {
			let option = document.createElement('option');
			option.label = selectedCountry.states[i].label;
			option.value = selectedCountry.states[i].value;
			document.getElementById(selector).add(option)
		}
	}
	else {
		document.getElementById(selector).disabled = true;
	}
}

function renderProxyListSelectors() {
	let proxyLists = settings.has('proxies') ? settings.get('proxies') : {};

	document.querySelectorAll('.proxylist-selector').forEach(function (element) {
		element.options.length = 1;
	});

	for (let i = 0; i < Object.keys(proxyLists).length; i++) {
		let name = Object.keys(proxyLists)[i]

		document.querySelectorAll('.proxylist-selector').forEach(function (element) {
			let option = document.createElement('option');
			option.label = name;
			option.value = name;
			element.options.add(option);
		});
	};
}

function renderHarvesters() {
	harvesterTable.innerHTML = '';
	let existingHarvesters = settings.has('captchaHarvesters') ? settings.get('captchaHarvesters') : [];
	for (let i = 0; i < existingHarvesters.length; i++) {
		let harvesterRow = document.createElement('tr');
		harvesterRow.className = 'row';

		let nameCell = document.createElement('td');
		nameCell.innerHTML = existingHarvesters[i].name;
		nameCell.className = 'cell cell-body col-profile';
		

		let siteCell = document.createElement('td');
		siteCell.className = 'cell cell-body col-site';
		
		let siteSelector = document.createElement('select');
		siteSelector.setAttribute('class', 'input');
		sites.captcha.forEach(site => {
			let option = document.createElement('option');
			option.label = site.label;
			option.value = site.value;
			siteSelector.add(option);
		})
		
		siteCell.appendChild(siteSelector);
		

		let actionsCell = document.createElement('td');
		actionsCell.className = 'cell cell-body table-row col-actions';

		let launchButton = document.createElement('div');
		launchButton.innerHTML = '<i class="fas fa-external-link-alt"></i>';
		launchButton.className = 'action-button';
		launchButton.onclick = function () {
			ipcRenderer.send('captcha.launch', {
				'sessionName': existingHarvesters[i].name,
				'site': siteSelector.value
			})
		}
	
		let loginButton = document.createElement('div');
		loginButton.innerHTML = '<i class="fab fa-youtube"></i>';
		loginButton.className = 'action-button';
		loginButton.onclick = function () {
			ipcRenderer.send('captcha.signIn', {
				'sessionName': existingHarvesters[i].name,
				'type': 'renew'
			})
		}

		let deleteButton = document.createElement('div');
		deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
		deleteButton.className = 'action-button';
		deleteButton.onclick = function () {
			try {
				existingHarvesters2 = settings.get('captchaHarvesters');
				let newHarvestrerArray = existingHarvesters2.filter((harvester, index) => {
					return harvester.name !== existingHarvesters[i].name
				})
				settings.set('captchaHarvesters', newHarvestrerArray, { prettify: true });
				renderHarvesters()
			} 
			catch (err) { }
		}
		
		actionsCell.appendChild(launchButton);
		actionsCell.appendChild(loginButton);
		actionsCell.appendChild(deleteButton);

		harvesterRow.appendChild(nameCell);
		harvesterRow.appendChild(siteCell);
		harvesterRow.appendChild(actionsCell);

		harvesterTable.appendChild(harvesterRow);
	}
}

function renderProfileSelectors() {
	let existingProfiles = settings.has('profiles') ? settings.get('profiles') : {};

	document.getElementById('profileTableBody').innerHTML = '';
	for (let i = 0; i < Object.keys(existingProfiles).length; i++) {
		let profileName = Object.keys(existingProfiles)[i];
		let profileRow = document.createElement('tr');
		profileRow.className = 'row';


		let profileCell = document.createElement('td');
		profileCell.innerHTML = profileName;
		profileCell.className = 'cell cell-body col-profile';
		profileRow.appendChild(profileCell);

		let nameCell = document.createElement('td');
		nameCell.innerHTML = `${existingProfiles[profileName].billing.first} ${existingProfiles[profileName].billing.last}`;
		nameCell.className = 'cell cell-body col-site';
		profileRow.appendChild(nameCell);

		let addressCell = document.createElement('td');
		addressCell.innerHTML = `${existingProfiles[profileName].billing.address1} ${existingProfiles[profileName].billing.address2}`;
		addressCell.className = 'cell cell-body col-products';
		profileRow.appendChild(addressCell);

		let cardCell = document.createElement('td');
		cardCell.innerHTML = '**** **** **** ' + existingProfiles[profileName].payment.cardNumber.substr(-4);
		cardCell.className = 'cell cell-body col-status';
		profileRow.appendChild(cardCell);

		let actionsCell = document.createElement('td');
		actionsCell.className = 'cell cell-body table-row col-actions';


		let editButton = document.createElement('div');
		editButton.innerHTML = '<i class="fas fa-edit"></i>';
		editButton.className = 'action-button';
		editButton.setAttribute('data-name', profileName)
		editButton.onclick = function () {
			const profileData = settings.get('profiles')[this.dataset.name]
			document.getElementById('profileName').value = this.dataset.name;
			try {
				billingFirst.value = profileData.billing.first
				billingLast.value = profileData.billing.last
				billingEmail.value = profileData.billing.email
				billingTelephone.value = profileData.billing.telephone
				billingAddress1.value = profileData.billing.address1
				billingAddress2.value = profileData.billing.address2
				billingCity.value = profileData.billing.city
				billingZip.value = profileData.billing.zip
				billingCountry.value = profileData.billing.country
				billingState.value = profileData.billing.state

				shippingFirst.value = profileData.shipping.first
				shippingLast.value = profileData.shipping.last
				shippingEmail.value = profileData.shipping.email
				shippingTelephone.value = profileData.shipping.telephone
				shippingAddress1.value = profileData.shipping.address1
				shippingAddress2.value = profileData.shipping.address2
				shippingCity.value = profileData.shipping.city
				shippingZip.value = profileData.shipping.zip
				shippingCountry.value = profileData.shipping.country
				shippingState.value = profileData.shipping.state

				paymentType.value = profileData.payment.type
				cardNumber.value = profileData.payment.cardNumber
				cardExpiryMonth.value = profileData.payment.expiryMonth
				cardExpiryYear.value = profileData.payment.expiryYear
				cardCvv.value = profileData.payment.cvv


				$('#profileModal').modal('show')
			}
			catch (error) { console.error(error) }
		}

		actionsCell.appendChild(editButton)

		let duplicateButton = document.createElement('div');
		duplicateButton.innerHTML = '<i class="fas fa-clone"></i>';
		duplicateButton.className = 'action-button';
		duplicateButton.onclick = function () {

		};
		actionsCell.appendChild(duplicateButton);

		let deleteButton = document.createElement('div');
		deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
		deleteButton.className = 'action-button';
		deleteButton.onclick = function () {
			let existingProfiles2 = settings.get('profiles');
			delete existingProfiles2[profileName];
			settings.set('profiles', existingProfiles2, { prettify: true })
			renderProfileSelectors()

		};
		actionsCell.appendChild(deleteButton)

		profileRow.appendChild(actionsCell);

		document.getElementById('profileTableBody').appendChild(profileRow)
		// 	let profileContainer = document.createElement('div');
		// 	profileContainer.setAttribute('class', 'panel panel-light panel-fixed-25');

		// 	let profileTitle = document.createElement('h2');
		// 	profileTitle.setAttribute('class', 'panel-title');
		// 	profileTitle.innerHTML = `<i></i><span>${profileName}</span>`;

		// /* ----------------------------------------------------------------------------- */
		// 	let nameRow = document.createElement('div');
		// 	nameRow.setAttribute('class', 'container');

		// 	let nameWrapper = document.createElement('div');
		// 	nameWrapper.setAttribute('class', 'container-element');

		// 	let fullName = document.createElement('label');
		// 	fullName.innerHTML = `${existingProfiles[profileName].billing.first} ${existingProfiles[profileName].billing.last}`;

		// 	nameWrapper.appendChild(fullName)
		// 	nameRow.appendChild(nameWrapper);

		// /* ----------------------------------------------------------------------------- */
		// 	let typeRow = document.createElement('div');
		// 	typeRow.setAttribute('class', 'container');

		// 	let typeWrapper = document.createElement('div');
		// 	typeWrapper.setAttribute('class', 'container-element');

		// 	let cardType = document.createElement('label');
		// 	cardType.innerHTML = `${existingProfiles[profileName].billing.address1} ${existingProfiles[profileName].billing.address2}`;
		// 	typeWrapper.appendChild(cardType)
		// 	typeRow.appendChild(typeWrapper);

		// /* ----------------------------------------------------------------------------- */

		// 	let numberRow = document.createElement('div');
		// 	numberRow.setAttribute('class', 'container');

		// 	let maskedNumberWrapper = document.createElement('div');
		// 	maskedNumberWrapper.setAttribute('class', 'container-element');

		// 	let maskedNumber = document.createElement('label');
		// 	maskedNumber.innerHTML = '**** **** **** ' + existingProfiles[profileName].payment.cardNumber.substr(-4)

		// 	maskedNumberWrapper.appendChild(maskedNumber)
		// 	numberRow.appendChild(maskedNumberWrapper);

		// /* ----------------------------------------------------------------------------- */

		// 	let optionsRow = document.createElement('div');
		// 	optionsRow.setAttribute('class', 'container');

		// 	let editBtnWrapper = document.createElement('div');
		// 	editBtnWrapper.setAttribute('class', 'container-element');
		// 	let editBtn = document.createElement('button');
		// 	editBtn.setAttribute('class', 'btn btn-transparent');
		// 	editBtn.setAttribute('data-name', profileName)
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
		// 		delete existingProfiles2[profileName];
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
	profileSelector.forEach(element => {
		element.options.length = 0;
		let existingProfiles = settings.has('profiles') ? settings.get('profiles') : {};
		for (let i = 0; i < Object.keys(existingProfiles).length; i++) {
			let profileName = Object.keys(existingProfiles)[i]
			let option = document.createElement('option');
			option.value = profileName;
			option.label = profileName;
			element.options.add(option);
		}
	})
}

function addTableRow(table, data = []) {
	if (typeof data !== 'object' || data.length < 1) return;
	let row = document.createElement('tr');
	row.classList.add('row');
	for (let i = 0; i < data.length; i++) {
		let cell = document.createElement('td');
		cell.classList.add('cell')
		cell.classList.add('cell-body')
		cell.classList.add(data[i].class);
		cell.innerHTML = data[i].text;
		row.appendChild(cell);
	}
	table.appendChild(row);
}

function renderOrderTable() {
	let orders = settings.has('orders') ? settings.get('orders') : [];
	orderTableBody.innerHTML = '';

	try {
		for (let i = 0; i < orders.length; i++) {
			let orderRow = document.createElement('tr');
			orderRow.className = 'row';


			let dateCell = document.createElement('td');
			dateCell.innerHTML = orders[i].date;
			dateCell.className = 'cell cell-body col-id';
			orderRow.appendChild(dateCell);

			let storeCell = document.createElement('td');
			storeCell.innerHTML = orders[i].site;
			storeCell.className = 'cell cell-body col-site';
			orderRow.appendChild(storeCell);

			let productCell = document.createElement('td');
			productCell.innerHTML = orders[i].product;
			productCell.className = 'cell cell-body col-products';
			productCell.style.justifyContent = 'center'
			orderRow.appendChild(productCell);

			let orderNumberCell = document.createElement('td');
			orderNumberCell.innerHTML = orders[i].orderNumber;
			orderNumberCell.className = 'cell cell-body col-order';
			orderRow.appendChild(orderNumberCell);

			let actionsCell = document.createElement('td');
			actionsCell.className = 'cell cell-body table-row col-actions-sm';

			let deleteButton = document.createElement('div');
			deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
			deleteButton.className = 'action-button';

			actionsCell.appendChild(deleteButton);

			orderRow.appendChild(actionsCell);
			orderTableBody.appendChild(orderRow);

		};
	} catch (err) { console.log(err) }
}

function setProxyLists() {

}

module.exports = {
	"tasks": renderTaskTable,
	"profiles": renderProfileSelectors,
	"proxies": renderProxyTable,
	"proxySelectors": renderProxyListSelectors,
	"sites": renderSites,
	"countries": renderCountries,
	"states": renderStates,
	"orders": renderOrderTable,
	"harvesters": renderHarvesters
}