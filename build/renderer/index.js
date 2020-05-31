var _ = require('underscore');
var electron = require('electron');
var ipcRenderer = electron.ipcRenderer, remote = electron.remote;
var mousetrap = require('mousetrap');
var settings = require('electron-settings');
var content = require('../build/renderer/content');
var profile = require('../build/renderer/profiles');
var ipc = require('../build/renderer/ipc');
var utilities = require('../build/library/other').utilities;
var sites = require('../build/library/configuration').sites;
ipc.init();
ipcRenderer.send('check for browser executable');
if (!settings.has('tasks') || (settings.has('tasks') && settings.get('tasks').constructor === [].constructor && settings.get('tasks').length == 0))
    settings.set('tasks', {});
if (!settings.has('profiles'))
    settings.set('profiles', {});
try {
    content.tasks();
    content.profiles();
    content.sites();
    content.countries();
    content.proxySelectors();
    content.harvesters();
    content.orders();
}
catch (err) {
    console.error(err);
}
signoutBtn.onclick = function () { ipcRenderer.send('signout'); };
reloadBtn.onclick = function () { ipcRenderer.send('window.reload'); };
minimizeBtn.onclick = function () { ipcRenderer.send('window.minimize'); };
closeBtn.onclick = function () { ipcRenderer.send('window.close'); };
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
if (!settings.has('globalMonitorDelay')) {
    settings.set('globalMonitorDelay', globalMonitorDelay.value);
}
else {
    globalMonitorDelay.value = settings.get('globalMonitorDelay');
}
if (!settings.has('globalErrorDelay')) {
    settings.set('globalErrorDelay', globalMonitorDelay.value);
}
else {
    globalErrorDelay.value = settings.get('globalErrorDelay');
}
if (!settings.has('globalTimeoutDelay')) {
    settings.set('globalTimeoutDelay', globalTimeoutDelay.value);
}
else {
    globalTimeoutDelay.value = settings.get('globalTimeoutDelay');
}
globalMonitorDelay.onchange = function () {
    settings.set('globalMonitorDelay', this.value, { prettify: true });
};
globalErrorDelay.onchange = function () {
    settings.set('globalErrorDelay', this.value, { prettify: true });
};
globalTimeoutDelay.onchange = function () {
    settings.set('globalTimeoutDelay', this.value, { prettify: true });
};
runAllBtn.onclick = function () { ipcRenderer.send('task.runAll'); };
stopAllBtn.onclick = function () { ipcRenderer.send('task.stopAll'); };
clearTasksBtn.onclick = function () { ipcRenderer.send('task.deleteAll'); };
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
                timer: newTask_StartDate.value + " " + timerVal || '',
                monitorRestocks: newTask_Restocks.checked || true,
                skipCaptcha: newTask_SkipCaptcha.checked || false,
                enableThreeDS: newTask_threeD.checked || false
            },
            'products': products
        };
        ipcRenderer.send('task.save', {
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
        content.states('profileBillingState', this.value);
    }
    catch (err) {
        console.error(err);
    }
};
shippingCountry.onchange = function () {
    try {
        content.states('profileShippingState', this.value);
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
        shippingCountry.onchange();
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
    content.states('profileShippingState', shippingCountry.value);
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
        profileName: profileName.value || "",
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
    profile.save(document.getElementById('profileId').value, profileData);
    content.profiles();
    for (var i = 0; i < profileElements.length; i++) {
        profileElements[i].value = profileElements[i].id.includes('Country') ? 'GB' : '';
    }
};
document.getElementById('deleteAllProfiles').onclick = function () {
    settings.set('profiles', {}, { prettify: true });
    content.profiles();
};
harvester_SaveBtn.onclick = function () {
    var existingHarvesters = settings.has('captchaHarvesters') ? settings.get('captchaHarvesters') : [];
    existingHarvesters.push({
        name: harverster_Name.value
    });
    settings.set('captchaHarvesters', existingHarvesters, { prettify: true });
    content.harvesters();
};
document.getElementById('proxyTestAll').onclick = function () {
    var listName = document.getElementById('proxyListSelectorMain').value;
    if (listName) {
        ipcRenderer.send('proxyList.testAll', {
            baseUrl: proxyTestSite.value,
            listName: listName
        });
    }
};
document.getElementById('proxyDeleteList').onclick = function () {
    var data = settings.get('proxies');
    try {
        document.getElementById('proxy-header').innerHTML = "Proxies";
        proxyTestTable.innerHTML = '';
        console.log(document.getElementById('proxyListSelectorMain').value, data);
        delete data[document.getElementById('proxyListSelectorMain').value];
        settings.set('proxies', data, { prettify: true });
        document.getElementById('proxyListSelectorMain').value = '';
        content.proxySelectors();
    }
    catch (err) {
        console.error(err);
    }
};
saveProxyList.onclick = function () {
    var listName = proxyListName.value;
    var proxyInput = massProxyInput.value.split('\n');
    var proxyLists = settings.has('proxies') ? settings.get('proxies') : {};
    var listExists = proxyLists.hasOwnProperty(listName);
    if (!listExists) {
        proxyLists[listName] = {};
        for (var i = 0; i < proxyInput.length; i++) {
            var id = utilities.generateId(6);
            proxyLists[listName][id] = proxyInput[i];
        }
        settings.set('proxies', proxyLists, { prettify: true });
        proxyListSelectorMain.options.length = 0;
        content.proxySelectors();
        proxyListName.value = '';
        massProxyInput.value = '';
    }
};
if (proxyListSelectorMain.options.length > 0)
    content.proxies(proxyListSelectorMain.value);
proxyListSelectorMain.onchange = function () {
    content.proxies(this.value);
};
document.getElementById('clearAnalytics').onclick = function () {
    settings.set('orders', [], { prettify: true });
    content.orders();
};
monitorProxyList.value = settings.has('monitorProxyList') ? settings.get('monitorProxyList') : '';
monitorProxyList.onchange = function () {
    settings.set('monitorProxyList', this.value, { prettify: true });
};
var currentBrowserPath = document.getElementById('currentBrowserPath');
var browserPath = document.getElementById('browserPath');
currentBrowserPath.value = settings.has('browser-path') ? settings.get('browser-path') : '';
currentBrowserPath.onchange = function () {
    console.log('hey');
    settings.set('browser-path', this.value, { prettify: true });
};
browserPath.onchange = function () {
    currentBrowserPath.value = this.files[0].path;
    currentBrowserPath.onchange();
};
installBrowserBtn.onclick = function () { ipcRenderer.send('setup browser mode'); };
resetBtn.onclick = function () { ipcRenderer.send('reset settings'); };
document.getElementById('version').innerHTML = "Version " + remote.app.getVersion();
customDiscord.value = settings.has('discord') ? settings.get('discord') : '';
customDiscord.onchange = function () {
    settings.set('discord', this.value, { prettify: true });
};
testDiscordBtn.onclick = function () {
    utilities.sendTestWebhook();
};
//# sourceMappingURL=index.js.map