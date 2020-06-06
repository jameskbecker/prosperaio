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
var electron_settings_1 = __importDefault(require("electron-settings"));
var electron_1 = require("electron");
var configuration_1 = require("../library/configuration");
var profileActions = __importStar(require("./profiles"));
var $ = require('jquery');
var droplist_1 = __importDefault(require("./droplist"));
var selectedItem;
function convertMode(id) {
    var modes = {
        'supreme-request': 'Fast',
        'supreme-browser': 'Safe',
        'kickz-wire': 'Wire Transfer',
        'kickz-paypal': 'Paypal'
    };
    return modes.hasOwnProperty(id) ? modes[id] : null;
}
function renderTaskTable() {
    var tasks = electron_settings_1.default.has('tasks') ? electron_settings_1.default.get('tasks') : {};
    var profiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
    tasksHeader.innerHTML = "Tasks (" + Object.keys(tasks).length + " Total)";
    taskTableBody.innerHTML = '';
    try {
        var _loop_1 = function (i) {
            var taskRow = document.createElement('tr');
            taskRow.className = 'row';
            var taskId = Object.keys(tasks)[i];
            var siteCell = document.createElement('td');
            var defaultSiteData = configuration_1.sites.def;
            var siteData = defaultSiteData[tasks[taskId].site];
            siteCell.innerHTML = siteData.label;
            siteCell.className = 'cell cell-body col-site';
            taskRow.appendChild(siteCell);
            var modeCell = document.createElement('td');
            modeCell.innerHTML = convertMode(tasks[taskId].setup.mode);
            modeCell.className = 'cell cell-body col-mode';
            taskRow.appendChild(modeCell);
            var searchInputCell = document.createElement('td');
            searchInputCell.innerHTML = tasks[taskId].products[0].searchInput;
            searchInputCell.className = 'cell cell-body col-products';
            searchInputCell.setAttribute('data-id', taskId);
            taskRow.appendChild(searchInputCell);
            var sizeCell = document.createElement('td');
            sizeCell.innerHTML = tasks[taskId].products[0].size;
            sizeCell.className = 'cell cell-body col-size';
            sizeCell.setAttribute('data-id', taskId);
            taskRow.appendChild(sizeCell);
            var profileCell = document.createElement('td');
            profileCell.innerHTML = profiles[tasks[taskId].setup.profile] && profiles[tasks[taskId].setup.profile].profileName ? profiles[tasks[taskId].setup.profile].profileName : '';
            profileCell.className = 'cell cell-body col-profile';
            taskRow.appendChild(profileCell);
            var proxyCell = document.createElement('td');
            proxyCell.innerHTML = tasks[taskId].additional.proxyList ? tasks[taskId].additional.proxyList : 'None';
            proxyCell.className = 'cell cell-body col-task-proxy';
            taskRow.appendChild(proxyCell);
            var timerCell = document.createElement('td');
            timerCell.innerHTML = tasks[taskId].additional.timer !== ' ' ? tasks[taskId].additional.timer : 'None';
            timerCell.className = 'cell cell-body col-timer';
            taskRow.appendChild(timerCell);
            var statusCell = document.createElement('td');
            statusCell.innerHTML = 'Idle.';
            statusCell.className = 'cell cell-body col-status';
            statusCell.setAttribute('data-taskId', taskId);
            taskRow.appendChild(statusCell);
            var actionsCell = document.createElement('td');
            actionsCell.className = 'cell cell-body table-row col-actions';
            var startButton = document.createElement('div');
            startButton.innerHTML = '<i class="fas fa-play"></i>';
            startButton.className = 'action-button';
            startButton.setAttribute('data-taskId', taskId);
            startButton.onclick = function () {
                electron_1.ipcRenderer.send('task.run', startButton.getAttribute('data-taskId'));
            };
            actionsCell.appendChild(startButton);
            var stopButton = document.createElement('div');
            stopButton.innerHTML = '<i class="fas fa-stop"></i>';
            stopButton.className = 'action-button';
            stopButton.setAttribute('data-taskId', taskId);
            stopButton.onclick = function () {
                electron_1.ipcRenderer.send('task.stop', taskId);
            };
            actionsCell.appendChild(stopButton);
            var duplicateButton = document.createElement('div');
            duplicateButton.innerHTML = '<i class="fas fa-clone"></i>';
            duplicateButton.className = 'action-button';
            duplicateButton.setAttribute('data-taskId', taskId);
            duplicateButton.onclick = function () {
                electron_1.ipcRenderer.send('task.duplicate', taskId);
            };
            actionsCell.appendChild(duplicateButton);
            var deleteButton = document.createElement('div');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.className = 'action-button';
            deleteButton.setAttribute('data-taskId', taskId);
            deleteButton.onclick = function () {
                electron_1.ipcRenderer.send('task.delete', taskId);
            };
            actionsCell.appendChild(deleteButton);
            taskRow.appendChild(actionsCell);
            taskTableBody.appendChild(taskRow);
        };
        for (var i = 0; i < Object.keys(tasks).length; i++) {
            _loop_1(i);
        }
    }
    catch (err) {
        console.log(err);
    }
}
function renderProxyTable(name) {
    try {
        var proxyLists_1 = electron_settings_1.default.has('proxies') ? electron_settings_1.default.get('proxies') : {};
        var list_1 = proxyLists_1[name];
        if (list_1) {
            proxyTestTable.innerHTML = '';
            var _loop_2 = function (i) {
                var proxyId = Object.keys(list_1)[i];
                var proxyRow = document.createElement('tr');
                proxyRow.className = 'row';
                proxyRow.setAttribute('data-row-id', proxyId);
                var splitProxy = list_1[proxyId].split(':');
                var ipCell = document.createElement('td');
                ipCell.innerHTML = splitProxy[0] ? splitProxy[0] : 'localhost';
                ipCell.className = 'cell cell-body col-proxy';
                proxyRow.appendChild(ipCell);
                var portCell = document.createElement('td');
                if (splitProxy.length > 1)
                    portCell.innerHTML = splitProxy[1];
                else
                    portCell.innerHTML = 'None';
                portCell.className = 'cell cell-body col-proxyPort';
                proxyRow.appendChild(portCell);
                var userCell = document.createElement('td');
                if (splitProxy.length > 3)
                    userCell.innerHTML = splitProxy[2];
                else
                    userCell.innerHTML = 'None';
                userCell.className = 'cell cell-body col-proxyUser';
                proxyRow.appendChild(userCell);
                var passCell = document.createElement('td');
                if (splitProxy.length > 3)
                    passCell.innerHTML = splitProxy[3];
                else
                    passCell.innerHTML = 'None';
                passCell.className = 'cell cell-body col-proxy';
                proxyRow.appendChild(passCell);
                var statusCell = document.createElement('td');
                statusCell.className = 'cell cell-body col-status col-proxy';
                statusCell.innerHTML = 'Idle.';
                statusCell.setAttribute('data-proxyId', proxyId);
                proxyRow.appendChild(statusCell);
                var actionsCell = document.createElement('td');
                actionsCell.className = 'cell cell-body col-proxy';
                var startButton = document.createElement('div');
                startButton.innerHTML = '<i class="fas fa-vial"></i>';
                startButton.className = 'action-button';
                startButton.setAttribute('data-proxyId', proxyId);
                startButton.onclick = function () {
                    electron_1.ipcRenderer.send('proxyList.test', {
                        baseUrl: proxyTestSite.value,
                        id: proxyId,
                        input: list_1[proxyId],
                    });
                };
                actionsCell.appendChild(startButton);
                var deleteButton = document.createElement('div');
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.className = 'action-button';
                deleteButton.onclick = function () {
                    delete list_1[proxyId];
                    electron_settings_1.default.set('proxies', proxyLists_1, { prettify: true });
                    var row = this.parentNode.parentNode;
                    row.parentNode.removeChild(row);
                };
                actionsCell.appendChild(deleteButton);
                proxyRow.appendChild(actionsCell);
                proxyTestTable.appendChild(proxyRow);
            };
            for (var i = 0; i < Object.keys(list_1).length; i++) {
                _loop_2(i);
            }
        }
    }
    catch (error) {
    }
}
function renderSites() {
    var siteKeys = Object.keys(configuration_1.sites.def);
    for (var i = 0; i < siteKeys.length; i++) {
        var defaultSiteData = configuration_1.sites.def;
        var site = defaultSiteData[siteKeys[i]];
        if (site.enabled) {
            for (var j = 0; j < siteSelectors.length; j++) {
                var siteOption = document.createElement('option');
                siteOption.value = siteKeys[i];
                siteOption.label = site.label;
                siteSelectors[j].add(siteOption);
            }
        }
    }
    newTask_Site.onchange = function () {
        newTask_Mode.disabled = false;
        newTask_RestockMode.disabled = false;
        var defaultSiteData = configuration_1.sites.def;
        var selectedSite = defaultSiteData[this.value] ? defaultSiteData[this.value] : null;
        if (selectedSite) {
            newTask_Mode.onchange = function () {
                newTask_RestockMode.options.length = 0;
                var stockMode = document.createElement('option');
                stockMode.label = 'Stock (Recommended)';
                stockMode.value = 'stock';
                var cartMode = document.createElement('option');
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
            var requestMode = document.createElement('option');
            switch (selectedSite.type) {
                case 'kickz':
                    newTask_Style[0].parentElement.style.display = 'none';
                    newTask_Category[0].parentElement.style.display = 'none';
                    newTask_SearchInput[0].placeholder = 'Enter Product Url.';
                    var wireMode = document.createElement('option');
                    wireMode.label = 'Request - Wire Transfer';
                    wireMode.value = 'kickz-wire';
                    newTask_Mode.add(wireMode);
                    var paypalMode = document.createElement('option');
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
                    var browserMode = document.createElement('option');
                    browserMode.label = 'Safe';
                    browserMode.value = 'supreme-browser';
                    newTask_Mode.add(browserMode);
                    break;
                case 'shopify':
                    newTask_Style[0].parentElement.style.display = 'none';
                    newTask_Category[0].parentElement.style.display = 'none';
                    newTask_SearchInput[0].placeholder = 'Enter Keywords or Product Url.';
                    var fastMode = document.createElement('option');
                    fastMode.label = 'API (Fast)';
                    fastMode.value = 'shopify-api';
                    newTask_Mode.add(fastMode);
                    var safeMode = document.createElement('option');
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
            droplist_1.default()
                .then(function (dropData) {
                if (dropData[selectedSite.type]) {
                    newTask_products.options.length = 1;
                    var data_1 = dropData[selectedSite.type];
                    var itemNames = Object.keys(data_1);
                    for (var i = 0; i < itemNames.length; i++) {
                        var option = document.createElement('option');
                        option.label = itemNames[i];
                        option.value = itemNames[i];
                        newTask_products.options.add(option);
                    }
                    newTask_products.onchange = function () {
                        newTask_Size[0].value = '';
                        selectedItem = data_1[this.value] ? data_1[this.value] : {};
                        newTask_SearchInput[0].value = selectedItem.keywords;
                        newTask_Category[0].value = selectedItem.category;
                        newTask_styles.options.length = 0;
                        for (var i = 0; i < selectedItem.styles.length; i++) {
                            var option = document.createElement('option');
                            option.label = selectedItem.styles[i].name;
                            option.value = selectedItem.styles[i].keywords;
                            newTask_styles.options.add(option);
                        }
                        newTask_styles.onchange = function () {
                            newTask_Style[0].value = this.value;
                        };
                        try {
                            newTask_styles.onchange(new Event(''));
                        }
                        catch (err) {
                            console.log(err);
                        }
                        newTask_sizes.options.length = 4;
                        for (var i = 0; i < selectedItem.sizes.length; i++) {
                            var option = document.createElement('option');
                            option.label = selectedItem.sizes[i].name;
                            option.value = selectedItem.sizes[i].keywords;
                            newTask_sizes.options.add(option);
                        }
                        newTask_sizes.onchange = function () {
                            newTask_Size[0].value = this.value;
                        };
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
    for (var i = 0; i < configuration_1.countries.length; i++) {
        for (var j = 0; j < countrySelectors.length; j++) {
            var option = document.createElement('option');
            option.label = configuration_1.countries[i].label;
            option.value = configuration_1.countries[i].value;
            countrySelectors[j].add(option);
        }
    }
    for (var i = 0; i < countrySelectors.length; i++) {
        countrySelectors[i].value = 'gb';
    }
    renderStates('profileBillingState', 'GB');
    renderStates('profileShippingState', 'GB');
}
function renderStates(selector, value) {
    var selectedCountry = configuration_1.countries.filter(function (country) { return country.value === value; })[0];
    var hasStates = selectedCountry.hasOwnProperty('states');
    var stateElement = document.getElementById(selector);
    stateElement.options.length = 0;
    if (hasStates) {
        stateElement.disabled = false;
        for (var i = 0; i < selectedCountry.states.length; i++) {
            var option = document.createElement('option');
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
    var proxyLists = electron_settings_1.default.has('proxies') ? electron_settings_1.default.get('proxies') : {};
    document.querySelectorAll('.proxylist-selector').forEach(function (element) {
        element.options.length = 1;
    });
    var _loop_3 = function (i) {
        var name_1 = Object.keys(proxyLists)[i];
        document.querySelectorAll('.proxylist-selector').forEach(function (element) {
            var option = document.createElement('option');
            option.label = name_1;
            option.value = name_1;
            element.options.add(option);
        });
    };
    for (var i = 0; i < Object.keys(proxyLists).length; i++) {
        _loop_3(i);
    }
}
function renderHarvesters() {
    harvesterTable.innerHTML = '';
    var existingHarvesters = electron_settings_1.default.has('captchaHarvesters') ? electron_settings_1.default.get('captchaHarvesters') : [];
    var _loop_4 = function (i) {
        var harvesterRow = document.createElement('tr');
        harvesterRow.className = 'row';
        var nameCell = document.createElement('td');
        nameCell.innerHTML = existingHarvesters[i].name;
        nameCell.className = 'cell cell-body col-profile';
        var siteCell = document.createElement('td');
        siteCell.className = 'cell cell-body col-site';
        var siteSelector = document.createElement('select');
        siteSelector.setAttribute('class', 'input');
        configuration_1.sites.captcha.forEach(function (site) {
            var option = document.createElement('option');
            option.label = site.label;
            option.value = site.value;
            siteSelector.add(option);
        });
        siteCell.appendChild(siteSelector);
        var actionsCell = document.createElement('td');
        actionsCell.className = 'cell cell-body table-row col-actions';
        var launchButton = document.createElement('div');
        launchButton.innerHTML = '<i class="fas fa-external-link-alt"></i>';
        launchButton.className = 'action-button';
        launchButton.onclick = function () {
            electron_1.ipcRenderer.send('captcha.launch', {
                'sessionName': existingHarvesters[i].name,
                'site': siteSelector.value
            });
        };
        var loginButton = document.createElement('div');
        loginButton.innerHTML = '<i class="fab fa-youtube"></i>';
        loginButton.className = 'action-button';
        loginButton.onclick = function () {
            electron_1.ipcRenderer.send('captcha.signIn', {
                'sessionName': existingHarvesters[i].name,
                'type': 'renew'
            });
        };
        var deleteButton = document.createElement('div');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.className = 'action-button';
        deleteButton.onclick = function () {
            try {
                var existingHarvesters2 = electron_settings_1.default.get('captchaHarvesters');
                var newHarvestrerArray = existingHarvesters2.filter(function (harvester) {
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
    };
    for (var i = 0; i < existingHarvesters.length; i++) {
        _loop_4(i);
    }
}
function renderProfileSelectors() {
    var existingProfiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
    document.getElementById('profileTableBody').innerHTML = '';
    var _loop_5 = function (i) {
        var profileId = Object.keys(existingProfiles)[i];
        var profileRow = document.createElement('tr');
        profileRow.className = 'row';
        var profileCell = document.createElement('td');
        profileCell.innerHTML = existingProfiles[profileId].profileName ? existingProfiles[profileId].profileName : '';
        profileCell.className = 'cell cell-body col-profile';
        profileRow.appendChild(profileCell);
        var nameCell = document.createElement('td');
        nameCell.innerHTML = existingProfiles[profileId].billing.first + " " + existingProfiles[profileId].billing.last;
        nameCell.className = 'cell cell-body col-site';
        profileRow.appendChild(nameCell);
        var addressCell = document.createElement('td');
        addressCell.innerHTML = existingProfiles[profileId].billing.address1 + " " + existingProfiles[profileId].billing.address2;
        addressCell.className = 'cell cell-body col-products';
        profileRow.appendChild(addressCell);
        var cardCell = document.createElement('td');
        cardCell.innerHTML = '**** **** **** ' + existingProfiles[profileId].payment.cardNumber.substr(-4);
        cardCell.className = 'cell cell-body col-status';
        profileRow.appendChild(cardCell);
        var actionsCell = document.createElement('td');
        actionsCell.className = 'cell cell-body table-row col-actions';
        var editButton = document.createElement('div');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.className = 'action-button';
        editButton.setAttribute('data-id', (profileId ? profileId : ''));
        editButton.onclick = function () {
            var profiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
            var profileData = profiles[this.dataset.id];
            _profileId.value = this.dataset.id ? this.dataset.id : '';
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
        actionsCell.appendChild(editButton);
        var duplicateButton = document.createElement('div');
        duplicateButton.innerHTML = '<i class="fas fa-clone"></i>';
        duplicateButton.className = 'action-button';
        duplicateButton.setAttribute('data-id', profileId ? profileId : '');
        duplicateButton.onclick = function () {
            var profiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
            var profileData = profiles[this.dataset.id];
            profileActions.save(null, profileData);
            renderProfileSelectors();
        };
        actionsCell.appendChild(duplicateButton);
        var deleteButton = document.createElement('div');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.className = 'action-button';
        deleteButton.onclick = function () {
            var existingProfiles2 = electron_settings_1.default.get('profiles');
            delete existingProfiles2[profileId];
            electron_settings_1.default.set('profiles', existingProfiles2, { prettify: true });
            renderProfileSelectors();
        };
        actionsCell.appendChild(deleteButton);
        profileRow.appendChild(actionsCell);
        document.getElementById('profileTableBody').appendChild(profileRow);
    };
    for (var i = 0; i < Object.keys(existingProfiles).length; i++) {
        _loop_5(i);
    }
    profileSelector.forEach(function (element) {
        element.options.length = 0;
        var existingProfiles = electron_settings_1.default.has('profiles') ? electron_settings_1.default.get('profiles') : {};
        for (var i = 0; i < Object.keys(existingProfiles).length; i++) {
            var profileId = Object.keys(existingProfiles)[i];
            var option = document.createElement('option');
            option.value = profileId;
            option.label = existingProfiles[profileId].profileName || 'Nameless Profile';
            element.options.add(option);
        }
    });
}
function renderOrderTable() {
    var orders = electron_settings_1.default.has('orders') ? electron_settings_1.default.get('orders') : [];
    orderTableBody.innerHTML = '';
    try {
        for (var i = 0; i < orders.length; i++) {
            var orderRow = document.createElement('tr');
            orderRow.className = 'row';
            var dateCell = document.createElement('td');
            dateCell.innerHTML = orders[i].date;
            dateCell.className = 'cell cell-body col-id';
            orderRow.appendChild(dateCell);
            var storeCell = document.createElement('td');
            storeCell.innerHTML = orders[i].site;
            storeCell.className = 'cell cell-body col-site';
            orderRow.appendChild(storeCell);
            var productCell = document.createElement('td');
            productCell.innerHTML = orders[i].product;
            productCell.className = 'cell cell-body col-products';
            productCell.style.justifyContent = 'center';
            orderRow.appendChild(productCell);
            var orderNumberCell = document.createElement('td');
            orderNumberCell.innerHTML = orders[i].orderNumber;
            orderNumberCell.className = 'cell cell-body col-order';
            orderRow.appendChild(orderNumberCell);
            var actionsCell = document.createElement('td');
            actionsCell.className = 'cell cell-body table-row col-actions-sm';
            var deleteButton = document.createElement('div');
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
exports.default = {
    'tasks': renderTaskTable,
    'profiles': renderProfileSelectors,
    'proxies': renderProxyTable,
    'proxySelectors': renderProxyListSelectors,
    'sites': renderSites,
    'countries': renderCountries,
    'states': renderStates,
    'orders': renderOrderTable,
    'harvesters': renderHarvesters
};
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
//# sourceMappingURL=content.js.map