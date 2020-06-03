"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./elements");
var electron_1 = require("electron");
var electron_settings_1 = __importDefault(require("electron-settings"));
var content_1 = __importDefault(require("./content"));
var checkboxes = document.querySelectorAll('.checkbox-label');
var profileSelector = document.querySelectorAll('.profile-selector');
var accountSelectors = document.querySelectorAll('.captchaAccount-selector');
var countrySelectors = document.querySelectorAll('.country-selector');
var proxyListSelectors = document.querySelectorAll('.proxylist-selector');
var siteSelectors = document.querySelectorAll('.site-selector');
var navigationSelectors = document.querySelectorAll('.nav');
var reloadBtn = document.getElementById('reloadApp');
var minimizeBtn = document.getElementById('minimizeApp');
var closeBtn = document.getElementById('closeApp');
var tasksHeader = document.getElementById('tasksHeader');
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
var newTask_products = document.getElementById('newTaskProducts');
var newTask_styles = document.getElementById('newTaskStyles');
var newTask_sizes = document.getElementById('newTaskSizes');
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
var _profileId = document.getElementById('profileId');
var profileName = document.getElementById('profileName');
var saveProfileBtn = document.getElementById('profileSaveButton');
var profileLoader = document.getElementById('profileLoader');
var deleteProfileBtn = document.getElementById('profileDeleteButton');
var clearProfilesBtn = document.getElementById('deleteAllProfiles');
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
var proxyHeader = document.getElementById('proxy-header');
var proxyListName = document.getElementById('proxyListName');
var massProxyInput = document.getElementById('proxyInput');
var saveProxyList = document.getElementById('saveProxyListBtn');
var proxyListSelectorMain = document.getElementById('proxyListSelectorMain');
var proxyTableName = document.getElementById('proxyTableName');
var proxyTestSite = document.getElementById('proxySiteSelector');
var proxyTestTable = document.getElementById('proxyTestResults');
var proxyTestAll = document.getElementById('proxyTestAll');
var proxyDeleteList = document.getElementById('proxyDeleteList');
var harverster_Name = document.getElementById('harvesterName');
var harvester_SaveBtn = document.getElementById('saveHarvesterBtn');
var harvesterTable = document.getElementById('harvesterTable');
var harvester_ClearBtn = document.getElementById('clearCaptchaAccounts');
var orderTableBody = document.getElementById('orderTableBody');
var clearAnalyticsBtn = document.getElementById('clearAnalytics');
var currentBrowserPath = document.getElementById('currentBrowserPath');
var installBrowserBtn = document.getElementById('browserSetup');
var resetBtn = document.getElementById('resetAllSettings');
var signoutBtn = document.getElementById('signout');
var customDiscord = document.getElementById('discordWebhook');
var testDiscordBtn = document.getElementById('testDiscordWebhook');
var version = document.getElementById('version');
function init() {
    electron_1.ipcRenderer.on('installing browser mode', function () {
        installBrowserBtn.disabled = true;
        installBrowserBtn.innerHTML = 'Installing Browser Mode...';
    });
    electron_1.ipcRenderer.on('check for browser executable', function () {
        var browserPath = electron_settings_1.default.has('browser-path') ? electron_settings_1.default.get('browser-path') : [];
        if (browserPath.length > 0) {
            installBrowserBtn.innerHTML = 'Installed Browser Mode';
            currentBrowserPath.value = electron_settings_1.default.has('browser-path') ? electron_settings_1.default.get('browser-path') : '';
        }
    });
    electron_1.ipcRenderer.on('task.setStatus', function (event, args) {
        var statusCell = document.querySelector(".col-status[data-taskId=\"" + args.id + "\"");
        statusCell.innerHTML = args.message;
        statusCell.style.color = args.color;
    });
    electron_1.ipcRenderer.on('task.setProductName', function (event, args) {
        var productCell = ".col-products[data-id=\"" + args.id + "\"]";
        document.querySelector(productCell).innerHTML = args.name;
    });
    electron_1.ipcRenderer.on('task.setSizeName', function (event, args) {
        var productCell = ".col-size[data-id=\"" + args.id + "\"]";
        document.querySelector(productCell).innerHTML = args.name;
    });
    electron_1.ipcRenderer.on('proxyList.setStatus', function (event, args) {
        var statusCell = document.querySelector(".col-status[data-proxyId=\"" + args.id + "\"");
        statusCell.innerHTML = args.message;
        statusCell.style.color = args.type;
    });
    electron_1.ipcRenderer.on('sync settings', function (event, type) {
        console.log(type);
        switch (type) {
            case 'task':
                content_1.default.tasks();
                break;
            case 'profiles':
                content_1.default.profiles();
                break;
            case 'proxies':
                content_1.default.proxySelectors();
                break;
            case 'orders':
                content_1.default.orders();
                break;
        }
    });
    electron_1.ipcRenderer.on('remove session', function (event, args) {
        var allSessions = electron_settings_1.default.get('captcha-sessions');
        allSessions.splice(allSessions.indexOf(args), 1);
        electron_settings_1.default.set('captcha-sessions', allSessions);
        content_1.default.harvesters();
    });
}
exports.default = { init: init };
//# sourceMappingURL=ipc.js.map