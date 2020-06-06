export let elements = {
	//General
	checkboxes: document.querySelectorAll('.checkbox-label'),
	profileSelector: document.querySelectorAll('.profile-selector'),
	accountSelectors: document.querySelectorAll('.captchaAccount-selector'),
	countrySelectors: document.querySelectorAll('.country-selector'),
	proxyListSelectors: document.querySelectorAll('.proxylist-selector'),
	siteSelectors: document.querySelectorAll('.site-selector'),
	navigationSelectors: document.querySelectorAll('.nav'),
	reloadBtn: document.getElementById('reloadApp'),
	minimizeBtn: document.getElementById('minimizeApp'),
	closeBtn: document.getElementById('closeApp'),

	//Dashboard
	tasksHeader: document.getElementById('tasksHeader'),
	//importTaskBtn: document.getElementById('importTasks'),
	//exportTaskBtn: document.getElementById('exportTasks'),
	globalMonitorDelay: document.getElementById('globalMonitor'),
	globalErrorDelay: document.getElementById('globalError'),
	globalTimeoutDelay: document.getElementById('globalTimeout'),


	taskTable: document.getElementById('taskTable'),
	taskTableBody: document.getElementById('taskTableBody'),

	runAllBtn: document.getElementById('runAll'),
	stopAllBtn: document.getElementById('stopAll'),
	clearTasksBtn: document.getElementById('clearTasks'),

	//Task Creator
	newTask_Site: document.getElementById('taskSite'),
	newTask_Profile: document.getElementById('taskProfile'),
	newTask_Mode: document.getElementById('taskMode'),
	newTask_RestockMode: document.getElementById('newTaskMonitorMode'),
	newTask_CheckoutAttempts: document.getElementById('taskCheckoutAttempts'),
	newTask_Quantity: document.getElementById('taskQuantity'),

	newTask_CartDelay: document.getElementById('taskCartDelay'),
	newTask_CheckoutDelay: document.getElementById('taskCheckoutDelay'),
	newTask_MonitorDelay: document.getElementById('taskMonitorDelay'),
	newTask_ErrorDelay: document.getElementById('taskErrorDelay'),
	newTask_Timeout: document.getElementById('taskTimeoutDelay'),

	newTask_ProxyList: document.getElementById('taskProxyList'),
	newTask_PriceLimit: document.getElementById('taskMaxPrice'),
	newTask_StartDate: document.getElementById('taskStartDate'),
	newTask_StartTime: document.getElementById('taskStartTime'),

	newTask_Restocks: document.getElementById('newTaskRestocks'),
	newTask_SkipCaptcha: document.getElementById('captchaCheckbox'),
	newTask_threeD: document.getElementById('threeDCheckbox'),

	newTask_products: document.getElementById('newTaskProducts'),
	newTask_styles: document.getElementById('newTaskStyles'),
	newTask_sizes: document.getElementById('newTaskSizes'),

	newTask_SearchInput: document.querySelectorAll('input[name="taskSearchInput"]'),
	newTask_Category: document.querySelectorAll('input[name="taskCategory"]'),
	newTask_Size: document.querySelectorAll('input[name="taskSize"]'),
	newTask_Style: document.querySelectorAll('input[name="taskVariant"]'),
	newTask_ProductQty: document.querySelectorAll('input[name="taskProductQty"]'),
	newTask_saveBtn: document.getElementById('taskSaveButton'),

	//Profile Creator
	profilesWrapper: document.getElementById('profilesWrapper'),
	billingFirst: document.getElementById('profileBillingFirst'),
	billingLast: document.getElementById('profileBillingLast'),
	billingEmail: document.getElementById('profileBillingEmail'),
	billingTelephone: document.getElementById('profileBillingTelephone'),
	billingAddress1: document.getElementById('profileBillingAddress1'),
	billingAddress2: document.getElementById('profileBillingAddress2'),
	billingCity: document.getElementById('profileBillingCity'),
	billingZip: document.getElementById('profileBillingZip'),
	billingCountry: document.getElementById('profileBillingCountry'),
	billingState: document.getElementById('profileBillingState'),

	useSameShippingAddress: document.getElementById('sameShippingCheckbox'),

	shippingFirst: document.getElementById('profileShippingFirst'),
	shippingLast: document.getElementById('profileShippingLast'),
	shippingEmail: document.getElementById('profileShippingEmail'),
	shippingTelephone: document.getElementById('profileShippingTelephone'),
	shippingAddress1: document.getElementById('profileShippingAddress1'),
	shippingAddress2: document.getElementById('profileShippingAddress2'),
	shippingCity: document.getElementById('profileShippingCity'),
	shippingZip: document.getElementById('profileShippingZip'),
	shippingCountry: document.getElementById('profileShippingCountry'),
	shippingState: document.getElementById('profileShippingState'),

	paymentType: document.getElementById('profilePaymentType'),
	cardNumber: document.getElementById('profileCardNumber'),
	cardExpiryMonth: document.getElementById('profileExpiryMonth'),
	cardExpiryYear: document.getElementById('profileExpiryYear'),
	cardCvv: document.getElementById('profileCvv'),

	_profileId: document.getElementById('profileId'),
	profileName: document.getElementById('profileName'),
	saveProfileBtn: document.getElementById('profileSaveButton'),
	profileLoader: document.getElementById('profileLoader'),

	//importProfileBtn: document.getElementById('importProfiles'),
	//exportProfileBtn: document.getElementById('exportProfiles'),
	deleteProfileBtn: document.getElementById('profileDeleteButton'),
	clearProfilesBtn: document.getElementById('deleteAllProfiles'),

	// profileElements: [
	// 	document.getElementById('profileId'),
	// 	elements.billingFirst,
	// 	elements.billingLast,
	// 	elements.billingEmail,
	// 	elements.billingTelephone,
	// 	elements.billingAddress1,
	// 	elements.billingAddress2,
	// 	elements.	billingCity,
	// 	elements.billingZip,
	// 	elements.billingCountry,
	// 	elements.billingState,

	// 	elements.shippingFirst,
	// 	elements.shippingLast,
	// 	elements.shippingEmail,
	// 	elements.shippingTelephone,
	// 	elements.shippingAddress1,
	// 	elements.shippingAddress2,
	// 	elements.shippingCity,
	// 	elements.shippingZip,
	// 	elements.shippingCountry,
	// 	elements.shippingState,

	// 	elements.paymentType,
	// 	elements.cardNumber,
	// 	elements.cardExpiryMonth,
	// 	elements.cardExpiryYear,
	// 	elements.cardCvv,

	// 	elements.profileName
	// ],
	//Proxies
	// importProxyBtn: document.getElementById('importProxies'),
	// exportProxyBtn: document.getElementById('exportProxies'),

	proxyHeader: document.getElementById('proxy-header'),

	proxyListName: document.getElementById('proxyListName'),
	massProxyInput: document.getElementById('proxyInput'),
	saveProxyList: document.getElementById('saveProxyListBtn'),

	proxyListSelectorMain: document.getElementById('proxyListSelectorMain'),
	proxyTableName: document.getElementById('proxyTableName'),
	proxyTestSite: document.getElementById('proxySiteSelector'),
	proxyTestTable: document.getElementById('proxyTestResults'),
	proxyTestAll: document.getElementById('proxyTestAll'),
	proxyDeleteList: document.getElementById('proxyDeleteList'),

	//Harvesters
	harverster_Name: document.getElementById('harvesterName'),
	harvester_SaveBtn: document.getElementById('saveHarvesterBtn'),
	harvesterTable: document.getElementById('harvesterTable'),
	harvester_ClearBtn: document.getElementById('clearCaptchaAccounts'),

	//Analytics
	orderTableBody: document.getElementById('orderTableBody'),
	clearAnalyticsBtn: document.getElementById('clearAnalytics'),

	//Settings
	// monitorProxyList: document.getElementById('monitorProxyList'),
	currentBrowserPath: document.getElementById('currentBrowserPath'),
	installBrowserBtn: document.getElementById('browserSetup'),
	resetBtn: document.getElementById('resetAllSettings'),
	signoutBtn: document.getElementById('signout'),
	customDiscord: document.getElementById('discordWebhook'),
	testDiscordBtn: document.getElementById('testDiscordWebhook'),

	//Footer
	version: document.getElementById('version')
};