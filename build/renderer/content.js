var settings = require('electron-settings');
var ipcRenderer = require('electron').ipcRenderer;
var _a = require('../library/configuration'), countries = _a.countries, sites = _a.sites;
var profileActions = require('./profiles');
var $ = require('jquery');
var dropList = require('./droplist');
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
    var tasks = settings.has('tasks') ? settings.get('tasks') : {};
    var profiles = settings.has('profiles') ? settings.get('profiles') : {};
    tasksHeader.innerHTML = "Tasks (" + Object.keys(tasks).length + " Total)";
    taskTableBody.innerHTML = '';
    try {
        var _loop_1 = function (i) {
            var taskRow = document.createElement('tr');
            taskRow.className = 'row';
            var taskId = Object.keys(tasks)[i];
            var siteCell = document.createElement('td');
            siteCell.innerHTML = sites.default[tasks[taskId].site].label;
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
                ipcRenderer.send('task.run', startButton.getAttribute('data-taskId'));
            };
            actionsCell.appendChild(startButton);
            var stopButton = document.createElement('div');
            stopButton.innerHTML = '<i class="fas fa-stop"></i>';
            stopButton.className = 'action-button';
            stopButton.setAttribute('data-taskId', taskId);
            stopButton.onclick = function () {
                ipcRenderer.send('task.stop', taskId);
            };
            actionsCell.appendChild(stopButton);
            var duplicateButton = document.createElement('div');
            duplicateButton.innerHTML = '<i class="fas fa-clone"></i>';
            duplicateButton.className = 'action-button';
            duplicateButton.setAttribute('data-taskId', taskId);
            duplicateButton.onclick = function () {
                ipcRenderer.send('task.duplicate', taskId);
            };
            actionsCell.appendChild(duplicateButton);
            var deleteButton = document.createElement('div');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.className = 'action-button';
            deleteButton.setAttribute('data-taskId', taskId);
            deleteButton.onclick = function () {
                ipcRenderer.send('task.delete', taskId);
            };
            actionsCell.appendChild(deleteButton);
            taskRow.appendChild(actionsCell);
            taskTableBody.appendChild(taskRow);
        };
        for (var i = 0; i < Object.keys(tasks).length; i++) {
            _loop_1(i);
        }
        ;
    }
    catch (err) {
        console.log(err);
    }
}
function renderProxyTable(name) {
    try {
        var proxyLists_1 = settings.has('proxies') ? settings.get('proxies') : {};
        var list_1 = proxyLists_1[name];
        if (list_1) {
            document.getElementById('proxy-header').innerHTML = '';
            document.getElementById('proxy-header').innerHTML = "Proxies (" + Object.keys(list_1).length + " Total)";
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
                    ipcRenderer.send('proxyList.test', {
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
                    settings.set('proxies', proxyLists_1, { prettify: true });
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
    var siteKeys = Object.keys(sites.default);
    for (var i = 0; i < siteKeys.length; i++) {
        var site = sites.default[siteKeys[i]];
        if (site.enabled) {
            for (var j = 0; j < document.querySelectorAll('.site-selector').length; j++) {
                var siteOption = document.createElement('option');
                siteOption.value = siteKeys[i];
                siteOption.label = site.label;
                document.querySelectorAll('.site-selector')[j].add(siteOption);
            }
            ;
        }
    }
    newTask_Site.onchange = function () {
        newTask_Mode.disabled = false;
        newTask_RestockMode.disabled = false;
        var selectedSite = sites.default[this.value] || null;
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
                    newTask_SearchInput[0].placeholder = "Enter Product Url.";
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
                    newTask_SearchInput[0].placeholder = "Enter Keywords.";
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
                    newTask_SearchInput[0].placeholder = "Enter Keywords or Product Url.";
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
                newTask_Mode.onchange();
            }
            catch (err) { }
            dropList()
                .then(function (dropData) {
                if (dropData[selectedSite.type]) {
                    console.log('heey');
                    document.getElementById("newTaskProducts").options.length = 1;
                    var data_1 = dropData[selectedSite.type];
                    var itemNames = Object.keys(data_1);
                    for (var i = 0; i < itemNames.length; i++) {
                        var option = document.createElement('option');
                        option.label = itemNames[i];
                        option.value = itemNames[i];
                        document.getElementById("newTaskProducts").options.add(option);
                    }
                    document.getElementById("newTaskProducts").onchange = function () {
                        newTask_Size[0].value = '';
                        selectedItem = data_1[this.value] || {};
                        newTask_SearchInput[0].value = selectedItem.keywords;
                        newTask_Category[0].value = selectedItem.category;
                        var styles = document.getElementById("newTaskStyles");
                        styles.options.length = 0;
                        for (var i = 0; i < selectedItem.styles.length; i++) {
                            var option = document.createElement('option');
                            option.label = selectedItem.styles[i].name;
                            option.value = selectedItem.styles[i].keywords;
                            styles.options.add(option);
                        }
                        styles.onchange = function () {
                            newTask_Style[0].value = this.value;
                        };
                        try {
                            styles.onchange();
                        }
                        catch (err) {
                            console.log(err);
                        }
                        var sizes = document.getElementById('newTaskSizes');
                        sizes.options.length = 4;
                        for (var i = 0; i < selectedItem.sizes.length; i++) {
                            var option = document.createElement('option');
                            option.label = selectedItem.sizes[i].name;
                            option.value = selectedItem.sizes[i].keywords;
                            sizes.options.add(option);
                        }
                        sizes.onchange = function () {
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
    for (var i = 0; i < countries.length; i++) {
        for (var j = 0; j < countrySelectors.length; j++) {
            var option = document.createElement('option');
            option.label = countries[i].label;
            option.value = countries[i].value;
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
    var selectedCountry = countries.filter(function (country) { return country.value === value; })[0];
    var hasStates = selectedCountry.hasOwnProperty('states');
    console.log(document.getElementById(selector));
    document.getElementById(selector).options.length = 0;
    if (hasStates) {
        document.getElementById(selector).disabled = false;
        for (var i = 0; i < selectedCountry.states.length; i++) {
            var option = document.createElement('option');
            option.label = selectedCountry.states[i].label;
            option.value = selectedCountry.states[i].value;
            document.getElementById(selector).add(option);
        }
    }
    else {
        document.getElementById(selector).disabled = true;
    }
}
function renderProxyListSelectors() {
    var proxyLists = settings.has('proxies') ? settings.get('proxies') : {};
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
    ;
}
function renderHarvesters() {
    harvesterTable.innerHTML = '';
    var existingHarvesters = settings.has('captchaHarvesters') ? settings.get('captchaHarvesters') : [];
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
        sites.captcha.forEach(function (site) {
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
            ipcRenderer.send('captcha.launch', {
                'sessionName': existingHarvesters[i].name,
                'site': siteSelector.value
            });
        };
        var loginButton = document.createElement('div');
        loginButton.innerHTML = '<i class="fab fa-youtube"></i>';
        loginButton.className = 'action-button';
        loginButton.onclick = function () {
            ipcRenderer.send('captcha.signIn', {
                'sessionName': existingHarvesters[i].name,
                'type': 'renew'
            });
        };
        var deleteButton = document.createElement('div');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.className = 'action-button';
        deleteButton.onclick = function () {
            try {
                existingHarvesters2 = settings.get('captchaHarvesters');
                var newHarvestrerArray = existingHarvesters2.filter(function (harvester) {
                    return harvester.name !== existingHarvesters[i].name;
                });
                settings.set('captchaHarvesters', newHarvestrerArray, { prettify: true });
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
    var existingProfiles = settings.has('profiles') ? settings.get('profiles') : {};
    document.getElementById('profileTableBody').innerHTML = '';
    var _loop_5 = function (i) {
        var profileId = Object.keys(existingProfiles)[i];
        var profileRow = document.createElement('tr');
        profileRow.className = 'row';
        var profileCell = document.createElement('td');
        profileCell.innerHTML = existingProfiles[profileId].profileName || '';
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
        editButton.setAttribute('data-id', profileId || '');
        editButton.onclick = function () {
            var profileData = settings.get('profiles')[this.dataset.id];
            document.getElementById('profileId').value = this.dataset.id || '';
            document.getElementById('profileName').value = profileData.profileName || '';
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
        duplicateButton.setAttribute('data-id', profileId || '');
        duplicateButton.onclick = function () {
            var profileData = settings.get('profiles')[this.dataset.id];
            profileActions.save(null, profileData);
            renderProfileSelectors();
        };
        actionsCell.appendChild(duplicateButton);
        var deleteButton = document.createElement('div');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.className = 'action-button';
        deleteButton.onclick = function () {
            var existingProfiles2 = settings.get('profiles');
            delete existingProfiles2[profileId];
            settings.set('profiles', existingProfiles2, { prettify: true });
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
        var existingProfiles = settings.has('profiles') ? settings.get('profiles') : {};
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
    var orders = settings.has('orders') ? settings.get('orders') : [];
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
        ;
    }
    catch (err) {
        console.log(err);
    }
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
};
//# sourceMappingURL=content.js.map