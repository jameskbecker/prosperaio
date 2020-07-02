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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.harvesters = exports.orders = exports.states = exports.countries = exports.sites = exports.proxySelectors = exports.proxies = exports.profiles = exports.tasks = exports.resetTaskForm = void 0;
const electron_settings_1 = __importDefault(require("electron-settings"));
const electron_1 = require("electron");
const configuration_1 = __importDefault(require("../library/configuration"));
const profileActions = __importStar(require("./profiles"));
const $ = require('jquery');
const droplist_1 = __importDefault(require("./droplist"));
function populateTaskForm(taskData, taskId) {
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
function resetTaskForm() {
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
exports.resetTaskForm = resetTaskForm;
var newTask_products = document.getElementById('newTaskProducts');
var newTask_styles = document.getElementById('newTaskStyles');
var newTask_sizes = document.getElementById('newTaskSizes');
var newTask_SearchInput = document.querySelectorAll('input[name="taskSearchInput"]');
var newTask_Category = document.querySelectorAll('input[name="taskCategory"]');
var newTask_Size = document.querySelectorAll('input[name="taskSize"]');
var newTask_Style = document.querySelectorAll('input[name="taskVariant"]');
var newTask_ProductQty = document.querySelectorAll('input[name="taskProductQty"]');
function convertMode(id) {
    switch (id) {
        case 'supreme-request': return 'Fast';
        case 'supreme-browser': return 'Safe';
        case 'kickz-wire': return 'Wire Transfer';
        case 'kickz-paypal': return 'Paypal';
        default: return '';
    }
}
function renderTaskTable() {
    var newTaskButton = document.getElementById('newTaskButton');
    newTaskButton.onclick = function () {
        $('#newTaskModal').modal('show');
    };
    let tasks = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : {};
    let profiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
    var tasksHeader = document.getElementById('tasksHeader');
    var taskTableBody = document.getElementById('taskTableBody');
    tasksHeader.innerHTML = `Tasks (${Object.keys(tasks).length} Total)`;
    taskTableBody.innerHTML = '';
    try {
        for (let i = 0; i < Object.keys(tasks).length; i++) {
            let taskId = Object.keys(tasks)[i];
            let taskRow = document.createElement('tr');
            taskRow.className = 'row';
            taskRow.onclick = function () {
                populateTaskForm(tasks[taskId], taskId);
                $('#newTaskModal').modal('show');
            };
            let siteCell = document.createElement('td');
            let defaultSiteData = configuration_1.default.sites.def;
            let siteData = defaultSiteData[tasks[taskId].site];
            siteCell.innerHTML = siteData ? siteData.label : '';
            siteCell.className = 'cell cell-body col-site';
            taskRow.appendChild(siteCell);
            let modeCell = document.createElement('td');
            modeCell.innerHTML = convertMode(tasks[taskId].setup.mode);
            modeCell.className = 'cell cell-body col-mode';
            taskRow.appendChild(modeCell);
            let productCell = document.createElement('td');
            productCell.innerHTML = '' + tasks[taskId].products[0].searchInput;
            productCell.className = 'cell cell-body col-products';
            productCell.setAttribute('data-id', taskId);
            taskRow.appendChild(productCell);
            let sizeCell = document.createElement('td');
            sizeCell.innerHTML = '' + tasks[taskId].products[0].size;
            sizeCell.className = 'cell cell-body col-size';
            sizeCell.setAttribute('data-id', taskId);
            taskRow.appendChild(sizeCell);
            let profileCell = document.createElement('td');
            profileCell.innerHTML = '' + profiles[tasks[taskId].setup.profile] && profiles[tasks[taskId].setup.profile].profileName ? profiles[tasks[taskId].setup.profile].profileName : '';
            profileCell.className = 'cell cell-body col-profile';
            taskRow.appendChild(profileCell);
            let proxyCell = document.createElement('td');
            proxyCell.innerHTML = '' + tasks[taskId].additional.proxyList ? tasks[taskId].additional.proxyList : 'None';
            proxyCell.className = 'cell cell-body col-task-proxy';
            taskRow.appendChild(proxyCell);
            let timerCell = document.createElement('td');
            timerCell.innerHTML = '' + tasks[taskId].additional.timer !== ' ' ? tasks[taskId].additional.timer : 'None';
            timerCell.className = 'cell cell-body col-timer';
            taskRow.appendChild(timerCell);
            let statusCell = document.createElement('td');
            statusCell.innerHTML = 'Idle.';
            statusCell.className = 'cell cell-body col-status';
            statusCell.setAttribute('data-taskId', taskId);
            taskRow.appendChild(statusCell);
            let actionsCell = document.createElement('td');
            actionsCell.className = 'cell cell-body table-row col-actions';
            let startButton = document.createElement('button');
            startButton.innerHTML = '<i class="fas fa-play"></i>';
            startButton.className = 'action-button';
            startButton.setAttribute('data-taskId', taskId);
            startButton.onclick = function (event) {
                event.stopImmediatePropagation();
                electron_1.ipcRenderer.send('task.run', startButton.getAttribute('data-taskId'));
            };
            actionsCell.appendChild(startButton);
            let stopButton = document.createElement('button');
            stopButton.innerHTML = '<i class="fas fa-stop"></i>';
            stopButton.className = 'action-button';
            stopButton.setAttribute('data-taskId', taskId);
            stopButton.onclick = function (event) {
                event.stopImmediatePropagation();
                electron_1.ipcRenderer.send('task.stop', taskId);
            };
            actionsCell.appendChild(stopButton);
            let duplicateButton = document.createElement('button');
            duplicateButton.innerHTML = '<i class="fas fa-clone"></i>';
            duplicateButton.className = 'action-button';
            duplicateButton.setAttribute('data-taskId', taskId);
            duplicateButton.onclick = function (event) {
                event.stopImmediatePropagation();
                electron_1.ipcRenderer.send('task.duplicate', taskId);
            };
            actionsCell.appendChild(duplicateButton);
            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.className = 'action-button';
            deleteButton.setAttribute('data-taskId', taskId);
            deleteButton.onclick = function (event) {
                event.stopImmediatePropagation();
                electron_1.ipcRenderer.send('task.delete', taskId);
            };
            actionsCell.appendChild(deleteButton);
            taskRow.appendChild(actionsCell);
            taskTableBody.appendChild(taskRow);
        }
    }
    catch (err) {
        console.log(err);
    }
}
function renderProxyTable(name) {
    try {
        var proxyTestTable = document.getElementById('proxyTestResults');
        let proxyLists = electron_settings_1.default.has('proxies') ? electron_settings_1.default.get('proxies') : {};
        let list = proxyLists[name];
        if (list) {
            proxyTestTable.innerHTML = '';
            for (let i = 0; i < Object.keys(list).length; i++) {
                let proxyId = Object.keys(list)[i];
                let proxyRow = document.createElement('tr');
                proxyRow.className = 'row';
                proxyRow.setAttribute('data-row-id', proxyId);
                let ipCell = document.createElement('td');
                let splitProxy = list[proxyId].split(':');
                ipCell.innerHTML = splitProxy[0] ? splitProxy[0] : 'localhost';
                ipCell.className = 'cell cell-body col-proxy';
                proxyRow.appendChild(ipCell);
                let portCell = document.createElement('td');
                if (splitProxy.length > 1)
                    portCell.innerHTML = splitProxy[1];
                else
                    portCell.innerHTML = 'None';
                portCell.className = 'cell cell-body col-proxyPort';
                proxyRow.appendChild(portCell);
                let userCell = document.createElement('td');
                if (splitProxy.length > 3)
                    userCell.innerHTML = splitProxy[2];
                else
                    userCell.innerHTML = 'None';
                userCell.className = 'cell cell-body col-proxyUser';
                proxyRow.appendChild(userCell);
                let passCell = document.createElement('td');
                if (splitProxy.length > 3)
                    passCell.innerHTML = splitProxy[3];
                else
                    passCell.innerHTML = 'None';
                passCell.className = 'cell cell-body col-proxy';
                proxyRow.appendChild(passCell);
                let statusCell = document.createElement('td');
                statusCell.className = 'cell cell-body col-status col-proxy';
                statusCell.innerHTML = 'Idle.';
                statusCell.setAttribute('data-proxyId', proxyId);
                proxyRow.appendChild(statusCell);
                let actionsCell = document.createElement('td');
                actionsCell.className = 'cell cell-body col-proxy';
                let startButton = document.createElement('div');
                startButton.innerHTML = '<i class="fas fa-vial"></i>';
                startButton.className = 'action-button';
                startButton.setAttribute('data-proxyId', proxyId);
                startButton.onclick = function () {
                    electron_1.ipcRenderer.send('proxyList.test', {
                        baseUrl: proxyTestSite.value,
                        id: proxyId,
                        input: list[proxyId],
                    });
                };
                actionsCell.appendChild(startButton);
                let deleteButton = document.createElement('div');
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.className = 'action-button';
                deleteButton.onclick = function () {
                    delete list[proxyId];
                    electron_settings_1.default.set('proxies', proxyLists, { prettify: true });
                    let row = this.parentNode.parentNode;
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
    const siteKeys = Object.keys(configuration_1.default.sites.def);
    for (let i = 0; i < siteKeys.length; i++) {
        let defaultSiteData = configuration_1.default.sites.def;
        let site = defaultSiteData[siteKeys[i]];
        if (site.enabled) {
            for (let j = 0; j < siteSelectors.length; j++) {
                let siteOption = document.createElement('option');
                siteOption.value = siteKeys[i];
                siteOption.label = site.label;
                siteSelectors[j].add(siteOption);
            }
        }
    }
    newTask_Site.onchange = function () {
        newTask_Mode.disabled = false;
        newTask_RestockMode.disabled = false;
        let defaultSiteData = configuration_1.default.sites.def;
        let selectedSite = defaultSiteData[this.value] ? defaultSiteData[this.value] : null;
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
            let requestMode = document.createElement('option');
            switch (selectedSite.type) {
                case 'kickz':
                    newTask_Style[0].parentElement.style.display = 'none';
                    newTask_Category[0].parentElement.style.display = 'none';
                    newTask_SearchInput[0].placeholder = 'Enter Product Url.';
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
                    newTask_SearchInput[0].placeholder = 'Eg: +tagless,-tank';
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
                    newTask_SearchInput[0].placeholder = 'Enter Keywords or Product Url.';
                    let fastMode = document.createElement('option');
                    fastMode.label = 'API (Fast)';
                    fastMode.value = 'shopify-api';
                    newTask_Mode.add(fastMode);
                    let safeMode = document.createElement('option');
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
            newTask_styles.onchange = function () {
                newTask_Style[0].value = this.value;
            };
            newTask_sizes.onchange = function () {
                newTask_Size[0].value = this.value;
            };
            newTask_sizes.onchange = function () {
                newTask_Size[0].value = this.value;
            };
            droplist_1.default()
                .then((dropData) => {
                if (dropData[selectedSite.type]) {
                    newTask_products.options.length = 1;
                    let data = dropData[selectedSite.type];
                    let itemNames = Object.keys(data);
                    for (let i = 0; i < itemNames.length; i++) {
                        let option = document.createElement('option');
                        option.label = itemNames[i];
                        option.value = itemNames[i];
                        newTask_products.options.add(option);
                    }
                    newTask_products.onchange = function () {
                        newTask_Size[0].value = '';
                        let selectedItem = data[this.value] ? data[this.value] : {};
                        newTask_SearchInput[0].value = selectedItem.keywords;
                        newTask_Category[0].value = selectedItem.category;
                        newTask_styles.options.length = 0;
                        for (let i = 0; i < selectedItem.styles.length; i++) {
                            let option = document.createElement('option');
                            option.label = selectedItem.styles[i].name;
                            option.value = selectedItem.styles[i].keywords;
                            newTask_styles.options.add(option);
                        }
                        try {
                            newTask_styles.onchange(new Event(''));
                        }
                        catch (err) {
                            console.log(err);
                        }
                        newTask_sizes.options.length = 4;
                        for (let i = 0; i < selectedItem.sizes.length; i++) {
                            let option = document.createElement('option');
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
function renderCountries() {
    var countrySelectors = document.querySelectorAll('.country-selector');
    for (let i = 0; i < configuration_1.default.countries.length; i++) {
        for (let j = 0; j < countrySelectors.length; j++) {
            let option = document.createElement('option');
            option.label = configuration_1.default.countries[i].label;
            option.value = configuration_1.default.countries[i].value;
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
    let selectedCountry = configuration_1.default.countries.find((country) => { return country.value === value; });
    let hasStates = selectedCountry.hasOwnProperty('states');
    let stateElement = document.getElementById(selector);
    stateElement.options.length = 0;
    if (hasStates) {
        stateElement.disabled = false;
        for (let i = 0; i < selectedCountry.states.length; i++) {
            let option = document.createElement('option');
            option.label = selectedCountry.states[i].label;
            option.value = selectedCountry.states[i].value;
            stateElement.add(option);
        }
    }
    else {
        stateElement.disabled = true;
    }
}
function renderProxyListSelectors() {
    let proxyLists = electron_settings_1.default.has('proxies') ? electron_settings_1.default.get('proxies') : {};
    document.querySelectorAll('.proxylist-selector').forEach(function (element) {
        element.options.length = 1;
    });
    for (let i = 0; i < Object.keys(proxyLists).length; i++) {
        let name = Object.keys(proxyLists)[i];
        document.querySelectorAll('.proxylist-selector').forEach(function (element) {
            let option = document.createElement('option');
            option.label = name;
            option.value = name;
            element.options.add(option);
        });
    }
}
function renderHarvesters() {
    var harvesterTable = document.getElementById('harvesterTable');
    harvesterTable.innerHTML = '';
    let existingHarvesters = electron_settings_1.default.has('captchaHarvesters') ? electron_settings_1.default.get('captchaHarvesters') : [];
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
        configuration_1.default.sites.captcha.forEach((site) => {
            let option = document.createElement('option');
            option.label = site.label;
            option.value = site.value;
            siteSelector.add(option);
        });
        siteCell.appendChild(siteSelector);
        let actionsCell = document.createElement('td');
        actionsCell.className = 'cell cell-body table-row col-actions';
        let launchButton = document.createElement('div');
        launchButton.innerHTML = '<i class="fas fa-external-link-alt"></i>';
        launchButton.className = 'action-button';
        launchButton.onclick = function () {
            electron_1.ipcRenderer.send('captcha.launch', {
                'sessionName': existingHarvesters[i].name,
                'site': siteSelector.value
            });
        };
        let loginButton = document.createElement('div');
        loginButton.innerHTML = '<i class="fab fa-youtube"></i>';
        loginButton.className = 'action-button';
        loginButton.onclick = function () {
            electron_1.ipcRenderer.send('captcha.signIn', {
                'sessionName': existingHarvesters[i].name,
                'type': 'renew'
            });
        };
        let deleteButton = document.createElement('div');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.className = 'action-button';
        deleteButton.onclick = function () {
            try {
                let existingHarvesters2 = electron_settings_1.default.get('captchaHarvesters');
                let newHarvestrerArray = existingHarvesters2.filter((harvester) => {
                    return harvester.name !== existingHarvesters[i].name;
                });
                electron_settings_1.default.set('captchaHarvesters', newHarvestrerArray, { prettify: true });
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
function convertCardType(type) {
    switch (type) {
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
function renderProfileSelectors() {
    let existingProfiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
    let profileTableBody = document.getElementById('profileTableBody');
    profileTableBody.innerHTML = '';
    for (let i = 0; i < Object.keys(existingProfiles).length; i++) {
        let profileId = Object.keys(existingProfiles)[i];
        let profileRow = document.createElement('tr');
        profileRow.className = 'row';
        profileRow.setAttribute('data-id', (profileId ? profileId : ''));
        profileRow.onclick = function (event) {
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
            var profileId = document.getElementById('profileId');
            var profileName = document.getElementById('profileName');
            let profiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
            const profileData = profiles[this.dataset.id];
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
                $('#profileModal').modal('show');
            }
            catch (error) {
                console.error(error);
            }
        };
        let profileCell = document.createElement('td');
        profileCell.innerHTML = existingProfiles[profileId].profileName ? existingProfiles[profileId].profileName : '';
        profileCell.className = 'cell cell-body col-profile';
        profileRow.appendChild(profileCell);
        let nameCell = document.createElement('td');
        nameCell.innerHTML = `${existingProfiles[profileId].billing.first} ${existingProfiles[profileId].billing.last}`;
        nameCell.className = 'cell cell-body col-site';
        profileRow.appendChild(nameCell);
        let addressCell = document.createElement('td');
        addressCell.innerHTML = `${existingProfiles[profileId].billing.address1} ${existingProfiles[profileId].billing.address2} ${existingProfiles[profileId].billing.country} ${existingProfiles[profileId].billing.state}`;
        addressCell.className = 'cell cell-body col-products';
        profileRow.appendChild(addressCell);
        let cardCell = document.createElement('td');
        cardCell.innerHTML = `${convertCardType(existingProfiles[profileId].payment.type)}${existingProfiles[profileId].payment.cardNumber.substr(-4)}`;
        cardCell.className = 'cell cell-body col-status';
        profileRow.appendChild(cardCell);
        let actionsCell = document.createElement('td');
        actionsCell.className = 'cell cell-body table-row col-actions';
        let editButton = document.createElement('div');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.className = 'action-button';
        editButton.setAttribute('data-id', (profileId ? profileId : ''));
        editButton.onclick = function (event) {
            event.stopImmediatePropagation();
        };
        let duplicateButton = document.createElement('div');
        duplicateButton.innerHTML = '<i class="fas fa-clone"></i>';
        duplicateButton.className = 'action-button';
        duplicateButton.setAttribute('data-id', profileId ? profileId : '');
        duplicateButton.onclick = function (event) {
            event.stopImmediatePropagation();
            let profiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
            const profileData = profiles[this.dataset.id];
            profileActions.save(null, profileData);
            renderProfileSelectors();
        };
        actionsCell.appendChild(duplicateButton);
        let deleteButton = document.createElement('div');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.className = 'action-button';
        deleteButton.onclick = function (event) {
            event.stopImmediatePropagation();
            let existingProfiles2 = electron_settings_1.default.get('profiles');
            delete existingProfiles2[profileId];
            electron_settings_1.default.set('profiles', existingProfiles2, { prettify: true });
            renderProfileSelectors();
        };
        actionsCell.appendChild(deleteButton);
        profileRow.appendChild(actionsCell);
        document.getElementById('profileTableBody').appendChild(profileRow);
    }
    profileSelector.forEach((element) => {
        element.options.length = 0;
        let existingProfiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
        for (let i = 0; i < Object.keys(existingProfiles).length; i++) {
            let profileId = Object.keys(existingProfiles)[i];
            let option = document.createElement('option');
            option.value = profileId;
            option.label = existingProfiles[profileId].profileName || 'Nameless Profile';
            element.options.add(option);
        }
    });
}
function renderOrderTable() {
    var orderTableBody = document.getElementById('orderTableBody');
    let orders = electron_settings_1.default.has('orders') ? electron_settings_1.default.get('orders') : [];
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
            productCell.style.justifyContent = 'center';
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
        }
    }
    catch (err) {
        console.log(err);
    }
}
exports.tasks = renderTaskTable;
exports.profiles = renderProfileSelectors;
exports.proxies = renderProxyTable;
exports.proxySelectors = renderProxyListSelectors;
exports.sites = renderSites;
exports.countries = renderCountries;
exports.states = renderStates;
exports.orders = renderOrderTable;
exports.harvesters = renderHarvesters;
var profileSelector = document.querySelectorAll('.profile-selector');
var siteSelectors = document.querySelectorAll('.site-selector');
var newTask_Site = document.getElementById('taskSite');
var newTask_Profile = document.getElementById('taskProfile');
var newTask_Mode = document.getElementById('taskMode');
var newTask_RestockMode = document.getElementById('newTaskMonitorMode');
var newTask_CheckoutAttempts = document.getElementById('taskCheckoutAttempts');
var newTask_Quantity = document.getElementById('taskQuantity');
var newTask_CartDelay = document.getElementById('taskCartDelay');
var newTask_CheckoutDelay = document.getElementById('taskCheckoutDelay');
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
var newTask_id = document.getElementById('taskId');
var proxyTestSite = document.getElementById('proxySiteSelector');
//# sourceMappingURL=content.js.map