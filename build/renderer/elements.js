var checkboxes = document.querySelectorAll('.checkbox-label');
var profileSelector = document.querySelectorAll('.profile-selector');
var accountSelectors = document.querySelectorAll('.captchaAccount-selector');
var countrySelectors = document.querySelectorAll('.country-selector');
var proxyListSelectors = document.querySelectorAll('.proxylist-selector');
var navigationSelectors = document.querySelectorAll('.nav');
var reloadBtn = document.getElementById('reloadApp');
var minimizeBtn = document.getElementById('minimizeApp');
var closeBtn = document.getElementById('closeApp');
var tasksHeader = document.getElementById('tasksHeader');
var importTaskBtn = document.getElementById('importTasks');
var exportTaskBtn = document.getElementById('exportTasks');
var globalMonitorDelay = document.getElementById('globalMonitor');
var globalErrorDelay = document.getElementById('globalError');
var globalTimeoutDelay = document.getElementById('globalTimeout');
var taskTable = document.getElementById('taskTable');
var taskTableBody = document.getElementById('taskTableBody');
var runAllBtn = document.getElementById('runAll');
var stopAllBtn = document.getElementById('stopAll');
var clearTasksBtn = document.getElementById('clearTasks');
var newTask_Site = document.getElementById('taskSite');
var newTask_Profile = document.getElementById('taskProfile');
var newTask_Mode = document.getElementById('taskMode');
var newTask_RestockMode = document.getElementById('newTaskMonitorMode');
var newTask_CheckoutAttempts = document.getElementById('taskCheckoutAttempts');
var newTask_Quantity = document.getElementById('taskQuantity');
var newTask_CartDelay = document.getElementById('taskCartDelay');
var newTask_CheckoutDelay = document.getElementById('taskCheckoutDelay');
var newTask_MonitorDelay = document.getElementById('taskMonitorDelay');
var newTask_ErrorDelay = document.getElementById('taskErrorDelay');
var newTask_Timeout = document.getElementById('taskTimeoutDelay');
var newTask_ProxyList = document.getElementById('taskProxyList');
var newTask_PriceLimit = document.getElementById('taskMaxPrice');
var newTask_StartDate = document.getElementById('taskStartDate');
var newTask_StartTime = document.getElementById('taskStartTime');
var newTask_Restocks = document.getElementById('newTaskRestocks');
var newTask_SkipCaptcha = document.getElementById('captchaCheckbox');
var newTask_threeD = document.getElementById('threeDCheckbox');
var newTask_SearchInput = document.querySelectorAll('input[name="taskSearchInput"]');
var newTask_Category = document.querySelectorAll('input[name="taskCategory"]');
var newTask_Size = document.querySelectorAll('input[name="taskSize"]');
var newTask_Style = document.querySelectorAll('input[name="taskVariant"]');
var newTask_ProductQty = document.querySelectorAll('input[name="taskProductQty"]');
var newTask_saveBtn = document.getElementById('taskSaveButton');
var profilesWrapper = document.getElementById('profilesWrapper');
var billingFirst = document.getElementById('profileBillingFirst');
var billingLast = document.getElementById('profileBillingLast');
var billingEmail = document.getElementById('profileBillingEmail');
var billingTelephone = document.getElementById('profileBillingTelephone');
var billingAddress1 = document.getElementById('profileBillingAddress1');
var billingAddress2 = document.getElementById('profileBillingAddress2');
var billingCity = document.getElementById('profileBillingCity');
var billingZip = document.getElementById('profileBillingZip');
var billingCountry = document.getElementById('profileBillingCountry');
var billingState = document.getElementById('profileBillingState');
var useSameShippingAddress = document.getElementById('sameShippingCheckbox');
var shippingFirst = document.getElementById('profileShippingFirst');
var shippingLast = document.getElementById('profileShippingLast');
var shippingEmail = document.getElementById('profileShippingEmail');
var shippingTelephone = document.getElementById('profileShippingTelephone');
var shippingAddress1 = document.getElementById('profileShippingAddress1');
var shippingAddress2 = document.getElementById('profileShippingAddress2');
var shippingCity = document.getElementById('profileShippingCity');
var shippingZip = document.getElementById('profileShippingZip');
var shippingCountry = document.getElementById('profileShippingCountry');
var shippingState = document.getElementById('profileShippingState');
var paymentType = document.getElementById('profilePaymentType');
var cardNumber = document.getElementById('profileCardNumber');
var cardExpiryMonth = document.getElementById('profileExpiryMonth');
var cardExpiryYear = document.getElementById('profileExpiryYear');
var cardCvv = document.getElementById('profileCvv');
var profileName = document.getElementById('profileName');
var saveProfileBtn = document.getElementById('profileSaveButton');
var profileLoader = document.getElementById('profileLoader');
var importProfileBtn = document.getElementById('importProfiles');
var exportProfileBtn = document.getElementById('exportProfiles');
var deleteProfileBtn = document.getElementById('profileDeleteButton');
var clearProfilesBtn = document.getElementById('profileDeleteAllButton');
var profileElements = [
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
var importProxyBtn = document.getElementById('importProxies');
var exportProxyBtn = document.getElementById('exportProxies');
var proxyListName = document.getElementById('proxyListName');
var massProxyInput = document.getElementById('proxyInput');
var saveProxyList = document.getElementById('saveProxyListBtn');
var proxyListSelectorMain = document.getElementById('proxyListSelectorMain');
var proxyTableName = document.getElementById('proxyTableName');
var proxyTestSite = document.getElementById('proxySiteSelector');
var proxyTestTable = document.getElementById('proxyTestResults');
var harverster_Name = document.getElementById('harvesterName');
var harvester_SaveBtn = document.getElementById('saveHarvesterBtn');
var harvester_ControlsWrapper = document.getElementById('harvesterTable');
var harvester_ClearBtn = document.getElementById('clearCaptchaAccounts');
var orderTableBody = document.getElementById('orderTableBody');
var monitorProxyList = document.getElementById('monitorProxyList');
var installBrowserBtn = document.getElementById('browserSetup');
var resetBtn = document.getElementById('resetAllSettings');
var signoutBtn = document.getElementById('signout');
var customDiscord = document.getElementById('discordWebhook');
var testDiscordBtn = document.getElementById('testDiscordWebhook');
var footerVersion = document.getElementById('footerVersion');
//# sourceMappingURL=elements.js.map