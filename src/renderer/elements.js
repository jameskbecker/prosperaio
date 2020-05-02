//General
const checkboxes = document.querySelectorAll('.checkbox-label');
const profileSelector = document.querySelectorAll('.profile-selector');
const accountSelectors = document.querySelectorAll('.captchaAccount-selector');
const countrySelectors = document.querySelectorAll('.country-selector');
const proxyListSelectors = document.querySelectorAll('.proxylist-selector');
const navigationSelectors = document.querySelectorAll('.nav');
const reloadBtn = document.getElementById('reloadApp');
const minimizeBtn = document.getElementById('minimizeApp');
const closeBtn = document.getElementById('closeApp');
 
//Dashboard
const tasksHeader = document.getElementById('tasksHeader');
const importTaskBtn = document.getElementById('importTasks');
const exportTaskBtn = document.getElementById('exportTasks');
const globalMonitorDelay = document.getElementById('globalMonitor');
const globalErrorDelay = document.getElementById('globalError');
const globalTimeoutDelay = document.getElementById('globalTimeout');


const taskTable = document.getElementById('taskTable');
const taskTableBody = document.getElementById('taskTableBody');

const runAllBtn = document.getElementById('runAll');
const stopAllBtn = document.getElementById('stopAll');
const clearTasksBtn = document.getElementById('clearTasks');

//Task Creator
const newTask_Site = document.getElementById('taskSite');
const newTask_Profile = document.getElementById('taskProfile');
const newTask_Mode = document.getElementById('taskMode');
const newTask_RestockMode = document.getElementById('newTaskMonitorMode');
const newTask_CheckoutAttempts = document.getElementById('taskCheckoutAttempts');
const newTask_Quantity = document.getElementById('taskQuantity');

const newTask_CartDelay = document.getElementById('taskCartDelay');
const newTask_CheckoutDelay = document.getElementById('taskCheckoutDelay');
const newTask_MonitorDelay = document.getElementById('taskMonitorDelay');
const newTask_ErrorDelay = document.getElementById('taskErrorDelay');
const newTask_Timeout = document.getElementById('taskTimeoutDelay');

const newTask_ProxyList = document.getElementById('taskProxyList');
const newTask_PriceLimit = document.getElementById('taskMaxPrice');
const newTask_StartDate = document.getElementById('taskStartDate');
const newTask_StartTime = document.getElementById('taskStartTime');

const newTask_Restocks = document.getElementById('newTaskRestocks');
const newTask_SkipCaptcha = document.getElementById('captchaCheckbox');
const newTask_threeD = document.getElementById('threeDCheckbox')


const newTask_SearchInput = document.querySelectorAll('input[name="taskSearchInput"]');
const newTask_Category = document.querySelectorAll('select[name="taskCategory"]');
const newTask_Size = document.querySelectorAll('select[name="taskSize"]');
const newTask_Style = document.querySelectorAll('input[name="taskVariant"]');
const newTask_ProductQty = document.querySelectorAll('input[name="taskProductQty"]');

const newTask_saveBtn = document.getElementById('taskSaveButton');

//Profile Creator
const profilesWrapper = document.getElementById('profilesWrapper');
const billingFirst = document.getElementById('profileBillingFirst');
const billingLast = document.getElementById('profileBillingLast');
const billingEmail = document.getElementById('profileBillingEmail');
const billingTelephone = document.getElementById('profileBillingTelephone');
const billingAddress1 = document.getElementById('profileBillingAddress1');
const billingAddress2 = document.getElementById('profileBillingAddress2');
const billingCity = document.getElementById('profileBillingCity');
const billingZip = document.getElementById('profileBillingZip');
const billingCountry = document.getElementById('profileBillingCountry');
const billingState = document.getElementById('profileBillingState'); 

const useSameShippingAddress = document.getElementById('sameShippingCheckbox');

const shippingFirst = document.getElementById('profileShippingFirst');
const shippingLast = document.getElementById('profileShippingLast');
const shippingEmail = document.getElementById('profileShippingEmail');
const shippingTelephone = document.getElementById('profileShippingTelephone');
const shippingAddress1 = document.getElementById('profileShippingAddress1');
const shippingAddress2 = document.getElementById('profileShippingAddress2');
const shippingCity = document.getElementById('profileShippingCity');
const shippingZip = document.getElementById('profileShippingZip');
const shippingCountry = document.getElementById('profileShippingCountry');
const shippingState = document.getElementById('profileShippingState');

const paymentType = document.getElementById('profilePaymentType');
const cardNumber = document.getElementById('profileCardNumber');
const cardExpiryMonth = document.getElementById('profileExpiryMonth');
const cardExpiryYear = document.getElementById('profileExpiryYear');
const cardCvv = document.getElementById('profileCvv');

const profileName = document.getElementById('profileName');
const saveProfileBtn = document.getElementById('profileSaveButton');
const profileLoader = document.getElementById('profileLoader');
const importProfileBtn = document.getElementById('importProfiles');
const exportProfileBtn = document.getElementById('exportProfiles');
const deleteProfileBtn = document.getElementById('profileDeleteButton');
const clearProfilesBtn = document.getElementById('profileDeleteAllButton');

const profileElements = [
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
]
//Proxies
const importProxyBtn = document.getElementById('importProxies');
const exportProxyBtn = document.getElementById('exportProxies');

const proxyListName = document.getElementById('proxyListName');
const massProxyInput = document.getElementById('proxyInput');
const saveProxyList = document.getElementById('saveProxyListBtn');

const proxyListSelectorMain = document.getElementById('proxyListSelectorMain');
const proxyTableName = document.getElementById('proxyTableName');
const proxyTestSite = document.getElementById('proxySiteSelector');
const proxyTestTable = document.getElementById('proxyTestResults');

//Harvesters
const harverster_Name = document.getElementById('harvesterName');
const harvester_SaveBtn = document.getElementById('saveHarvesterBtn');
const harvester_ControlsWrapper = document.getElementById('harvesterControlsWrapper');
const harvester_ClearBtn = document.getElementById('clearCaptchaAccounts');

//Analytics
const orderTableBody = document.getElementById('orderTableBody');

//Settings
const installBrowserBtn = document.getElementById('browserSetup');
const resetBtn = document.getElementById('resetAllSettings');
const signoutBtn = document.getElementById('signout');
const customDiscord = document.getElementById('discordWebhook');
const testDiscordBtn = document.getElementById('testDiscordWebhook');

//Footer
const footerVersion = document.getElementById('footerVersion');