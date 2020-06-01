//General
var checkboxes:NodeListOf<HTMLInputElement> = document.querySelectorAll('.checkbox-label');
var profileSelector:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.profile-selector');
var accountSelectors:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.captchaAccount-selector');
var countrySelectors:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.country-selector');
var proxyListSelectors:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.proxylist-selector');
var siteSelectors:NodeListOf<HTMLSelectElement> = document.querySelectorAll('.site-selector');
var navigationSelectors:NodeListOf<HTMLElement> = document.querySelectorAll('.nav');
var reloadBtn:HTMLElement = document.getElementById('reloadApp');
var minimizeBtn:HTMLElement = document.getElementById('minimizeApp');
var closeBtn:HTMLElement = document.getElementById('closeApp');
 
//Dashboard
var tasksHeader:HTMLElement = document.getElementById('tasksHeader');
//var importTaskBtn:HTMLButtonElement = document.getElementById('importTasks');
//var exportTaskBtn:HTMLButtonElement = document.getElementById('exportTasks');
var globalMonitorDelay:any = document.getElementById('globalMonitor');
var globalErrorDelay:any = document.getElementById('globalError');
var globalTimeoutDelay:any = document.getElementById('globalTimeout');


var taskTable:HTMLElement = document.getElementById('taskTable');
var taskTableBody:HTMLElement = document.getElementById('taskTableBody');

var runAllBtn:HTMLElement = document.getElementById('runAll');
var stopAllBtn:HTMLElement = document.getElementById('stopAll');
var clearTasksBtn:HTMLElement = document.getElementById('clearTasks');

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

var newTask_products:any = document.getElementById("newTaskProducts");
var newTask_styles:any = document.getElementById("newTaskStyles");
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
var importProfileBtn:any = document.getElementById('importProfiles');
var exportProfileBtn:any = document.getElementById('exportProfiles');
var deleteProfileBtn:any = document.getElementById('profileDeleteButton');
var clearProfilesBtn:any = document.getElementById('profileDeleteAllButton');

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
var importProxyBtn:any = document.getElementById('importProxies');
var exportProxyBtn:any = document.getElementById('exportProxies');

var proxyListName:any = document.getElementById('proxyListName');
var massProxyInput:any = document.getElementById('proxyInput');
var saveProxyList:any = document.getElementById('saveProxyListBtn');

var proxyListSelectorMain:any = document.getElementById('proxyListSelectorMain');
var proxyTableName:any = document.getElementById('proxyTableName');
var proxyTestSite:any = document.getElementById('proxySiteSelector');
var proxyTestTable:any = document.getElementById('proxyTestResults');

//Harvesters
var harverster_Name:any = document.getElementById('harvesterName');
var harvester_SaveBtn:any = document.getElementById('saveHarvesterBtn');
var harvesterTable:any = document.getElementById('harvesterTable');
var harvester_ClearBtn:any = document.getElementById('clearCaptchaAccounts');

//Analytics
var orderTableBody:any = document.getElementById('orderTableBody');

//Settings
// var monitorProxyList:any = document.getElementById('monitorProxyList');
var currentBrowserPath:any = document.getElementById('currentBrowserPath');
var installBrowserBtn:any = document.getElementById('browserSetup');
var resetBtn:any = document.getElementById('resetAllSettings');
var signoutBtn:any = document.getElementById('signout');
var customDiscord:any = document.getElementById('discordWebhook');
var testDiscordBtn:any = document.getElementById('testDiscordWebhook');

//Footer
var footerVersion:any = document.getElementById('footerVersion');
