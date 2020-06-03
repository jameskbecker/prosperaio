"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var mousetrap = __importStar(require("mousetrap"));
var electron_settings_1 = __importDefault(require("electron-settings"));
var content_1 = __importDefault(require("./content"));
var profile = __importStar(require("./profiles"));
var ipc_1 = __importDefault(require("./ipc"));
var other_1 = require("../library/other");
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
ipc_1.default.init();
electron_1.ipcRenderer.send('check for browser executable');
var tasks = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : null;
if (!tasks || tasks.constructor === [])
    electron_settings_1.default.set('tasks', {});
if (!electron_settings_1.default.has('profiles'))
    electron_settings_1.default.set('profiles', {});
try {
    content_1.default.tasks();
    content_1.default.profiles();
    content_1.default.sites();
    content_1.default.countries();
    content_1.default.proxySelectors();
    content_1.default.harvesters();
    content_1.default.orders();
}
catch (err) {
    console.error(err);
}
signoutBtn.onclick = function () { electron_1.ipcRenderer.send('signout'); };
minimizeBtn.onclick = function () { electron_1.ipcRenderer.send('window.minimize'); };
closeBtn.onclick = function () { electron_1.ipcRenderer.send('window.close'); };
navigationSelectors.forEach(function (page, i) {
    function navigationHandler() {
        var selectedPageId = page.getAttribute('data-page');
        var selectedPage = document.getElementById(selectedPageId);
        if (selectedPage.classList.contains('page-hidden')) {
            var activeNavigation = document.querySelector('.nav-active');
            var activePageId = activeNavigation.getAttribute('data-page');
            var activePage = document.getElementById(activePageId);
            activeNavigation.classList.remove('nav-active');
            page.classList.add('nav-active');
            selectedPage.classList.remove('page-hidden');
            activePage.classList.add('page-hidden');
        }
    }
    page.onclick = navigationHandler;
    mousetrap.bind("command+" + (i + 1), navigationHandler);
});
if (!electron_settings_1.default.has('globalMonitorDelay')) {
    electron_settings_1.default.set('globalMonitorDelay', globalMonitorDelay.value);
}
else {
    globalMonitorDelay.value = electron_settings_1.default.get('globalMonitorDelay');
}
if (!electron_settings_1.default.has('globalErrorDelay')) {
    electron_settings_1.default.set('globalErrorDelay', globalMonitorDelay.value);
}
else {
    globalErrorDelay.value = electron_settings_1.default.get('globalErrorDelay');
}
if (!electron_settings_1.default.has('globalTimeoutDelay')) {
    electron_settings_1.default.set('globalTimeoutDelay', globalTimeoutDelay.value);
}
else {
    globalTimeoutDelay.value = electron_settings_1.default.get('globalTimeoutDelay');
}
globalMonitorDelay.onchange = function () {
    electron_settings_1.default.set('globalMonitorDelay', this.value, { prettify: true });
};
globalErrorDelay.onchange = function () {
    electron_settings_1.default.set('globalErrorDelay', this.value, { prettify: true });
};
globalTimeoutDelay.onchange = function () {
    electron_settings_1.default.set('globalTimeoutDelay', this.value, { prettify: true });
};
runAllBtn.onclick = function () { electron_1.ipcRenderer.send('task.runAll'); };
stopAllBtn.onclick = function () { electron_1.ipcRenderer.send('task.stopAll'); };
clearTasksBtn.onclick = function () { electron_1.ipcRenderer.send('task.deleteAll'); };
newTask_Mode.disabled = true;
newTask_RestockMode.disabled = true;
newTask_SearchInput[0].placeholder = 'Please Select Site.';
newTask_Style[0].disabled = true;
newTask_Category[0].disabled = true;
newTask_Size[0].disabled = true;
newTask_ProductQty[0].disabled = true;
newTask_SearchInput[0].disabled = true;
newTask_saveBtn.onclick = function () {
    try {
        if (newTask_Mode.value === 'browser' && !electron_settings_1.default.has('browser-path')) {
            alert('Browser Mode Not Installed.');
            return;
        }
        var products = [];
        for (var i = 0; i < newTask_SearchInput.length; i++) {
            var product = {
                'searchInput': newTask_SearchInput[i].value,
                'category': newTask_Category[i].value,
                'size': newTask_Size[i].value,
                'style': newTask_Style[i].value,
                'productQty': newTask_ProductQty[i].value
            };
            products.push(product);
        }
        var timerComps = newTask_StartTime.value.split(':');
        var timerVal = timerComps.length === 2 ? newTask_StartTime.value + ':00' : newTask_StartTime.value;
        var taskData = {
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
                timer: newTask_StartDate.value ? newTask_StartDate.value + " " + timerVal : ' ',
                monitorRestocks: newTask_Restocks ? newTask_Restocks.checked : true,
                skipCaptcha: newTask_SkipCaptcha ? newTask_SkipCaptcha.checked : false,
                enableThreeDS: newTask_threeD ? newTask_threeD.checked : false
            },
            'products': products
        };
        electron_1.ipcRenderer.send('task.save', {
            data: taskData,
            quantity: parseInt(newTask_Quantity.value)
        });
    }
    catch (err) {
        console.error(err);
    }
};
billingCountry.onchange = function () {
    try {
        content_1.default.states('profileBillingState', this.value);
    }
    catch (err) {
        console.error(err);
    }
};
shippingCountry.onchange = function () {
    try {
        content_1.default.states('profileShippingState', this.value);
    }
    catch (err) {
        console.error(err);
    }
};
billingFirst.oninput = function () {
    try {
        if (useSameShippingAddress.checked)
            shippingFirst.value = this.value;
    }
    catch (err) {
        console.error(err);
    }
};
billingLast.oninput = function () {
    try {
        if (useSameShippingAddress.checked)
            shippingLast.value = this.value;
    }
    catch (err) {
        console.error(err);
    }
};
billingEmail.oninput = function () {
    if (useSameShippingAddress.checked)
        shippingEmail.value = this.value;
};
billingTelephone.oninput = function () {
    if (useSameShippingAddress.checked)
        shippingTelephone.value = this.value;
};
billingAddress1.oninput = function () {
    if (useSameShippingAddress.checked)
        shippingAddress1.value = this.value;
};
billingAddress2.oninput = function () {
    if (useSameShippingAddress.checked)
        shippingAddress2.value = this.value;
};
billingCity.oninput = function () {
    if (useSameShippingAddress.checked)
        shippingCity.value = this.value;
};
billingZip.oninput = function () {
    if (useSameShippingAddress.checked)
        shippingZip.value = this.value;
};
billingCountry.oninput = function () {
    if (useSameShippingAddress.checked) {
        shippingCountry.value = this.value;
        shippingCountry.onchange(new Event(''));
    }
};
billingState.oninput = function () {
    if (useSameShippingAddress.checked)
        shippingState.value = this.value;
};
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
    content_1.default.states('profileShippingState', shippingCountry.value);
    shippingState.value = this.checked ? billingState.value : '';
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
};
saveProfileBtn.onclick = function () {
    var profileData = {
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
    var profileId = document.getElementById('profileId');
    profile.save(profileId.value, profileData);
    content_1.default.profiles();
    for (var i = 0; i < profileElements.length; i++) {
        profileElements[i].value = profileElements[i].id.includes('Country') ? 'GB' : '';
    }
};
clearProfilesBtn.onclick = function () {
    electron_settings_1.default.set('profiles', {}, { prettify: true });
    content_1.default.profiles();
};
harvester_SaveBtn.onclick = function () {
    var existingHarvesters = electron_settings_1.default.has('captchaHarvesters') ? electron_settings_1.default.get('captchaHarvesters') : [];
    existingHarvesters.push({
        name: harverster_Name.value
    });
    electron_settings_1.default.set('captchaHarvesters', existingHarvesters, { prettify: true });
    content_1.default.harvesters();
};
proxyTestAll.onclick = function () {
    var listName = document.getElementById('proxyListSelectorMain');
    if (listName) {
        electron_1.ipcRenderer.send('proxyList.testAll', {
            baseUrl: proxyTestSite.value,
            listName: listName.value
        });
    }
};
proxyDeleteList.onclick = function () {
    var data = electron_settings_1.default.get('proxies');
    try {
        proxyHeader.innerHTML = "Proxies";
        proxyTestTable.innerHTML = '';
        delete data[proxyListSelectorMain.value];
        electron_settings_1.default.set('proxies', data, { prettify: true });
        proxyListSelectorMain.value = '';
        content_1.default.proxySelectors();
    }
    catch (err) {
        console.error(err);
    }
};
saveProxyList.onclick = function () {
    var listName = proxyListName.value;
    var proxyInput = massProxyInput.value.split('\n');
    var proxyLists = electron_settings_1.default.has('proxies') ? electron_settings_1.default.get('proxies') : {};
    var listExists = proxyLists.hasOwnProperty(listName);
    if (!listExists) {
        proxyLists[listName] = {};
        for (var i = 0; i < proxyInput.length; i++) {
            var id = other_1.utilities.generateId(6);
            proxyLists[listName][id] = proxyInput[i];
        }
        electron_settings_1.default.set('proxies', proxyLists, { prettify: true });
        proxyListSelectorMain.options.length = 0;
        content_1.default.proxySelectors();
        proxyListName.value = '';
        massProxyInput.value = '';
    }
};
if (proxyListSelectorMain.options.length > 0)
    content_1.default.proxies(proxyListSelectorMain.value);
proxyListSelectorMain.onchange = function () {
    content_1.default.proxies(this.value);
};
clearAnalyticsBtn.onclick = function () {
    electron_settings_1.default.set('orders', [], { prettify: true });
    content_1.default.orders();
};
var browserPath = document.getElementById('browserPath');
currentBrowserPath.value = electron_settings_1.default.has('browser-path') ? electron_settings_1.default.get('browser-path') : '';
currentBrowserPath.onchange = function () {
    electron_settings_1.default.set('browser-path', this.value, { prettify: true });
};
browserPath.onchange = function () {
    currentBrowserPath.value = this.files[0].path;
    currentBrowserPath.onchange(new Event(''));
};
installBrowserBtn.onclick = function () { electron_1.ipcRenderer.send('setup browser mode'); };
resetBtn.onclick = function () { electron_1.ipcRenderer.send('reset settings'); };
version.innerHTML = "Version " + electron_1.remote.app.getVersion();
customDiscord.value = electron_settings_1.default.has('discord') ? electron_settings_1.default.get('discord') : '';
customDiscord.onchange = function () {
    electron_settings_1.default.set('discord', this.value, { prettify: true });
};
testDiscordBtn.onclick = function () {
    other_1.utilities.sendTestWebhook();
};
//# sourceMappingURL=index.js.map