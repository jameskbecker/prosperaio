var ipcRenderer = require('electron').ipcRenderer;
var settings = require('electron-settings');
var content = require('./content');
var logger = require('../library/other').logger;
var $ = require('jquery');
exports.init = function () {
    ipcRenderer.on('installing browser mode', function (event, args) {
        installBrowserBtn.disabled = true;
        installBrowserBtn.innerHTML = 'Installing Browser Mode...';
    });
    ipcRenderer.on('check for browser executable', function (event, args) {
        if (settings.has('browser-path') && settings.get('browser-path').length > 0) {
            installBrowserBtn.innerHTML = 'Installed Browser Mode';
            document.getElementById('currentBrowserPath').value = settings.has('browser-path') ? settings.get('browser-path') : '';
        }
    });
    ipcRenderer.on('task.setStatus', function (event, args) {
        var statusCell = document.querySelector(".col-status[data-taskId=\"" + args.id + "\"");
        statusCell.innerHTML = args.message;
        statusCell.style.color = args.color;
    });
    ipcRenderer.on('task.setProductName', function (event, args) {
        var productCell = ".col-products[data-id=\"" + args.id + "\"]";
        document.querySelector(productCell).innerHTML = args.name;
    });
    ipcRenderer.on('task.setSizeName', function (event, args) {
        var productCell = ".col-size[data-id=\"" + args.id + "\"]";
        document.querySelector(productCell).innerHTML = args.name;
    });
    ipcRenderer.on('proxyList.setStatus', function (event, args) {
        var statusCell = document.querySelector(".col-status[data-proxyId=\"" + args.id + "\"");
        statusCell.innerHTML = args.message;
        statusCell.style.color = args.type;
    });
    ipcRenderer.on('sync settings', function (event, type) {
        console.log(type);
        switch (type) {
            case 'task':
                content.tasks();
                break;
            case 'profiles':
                content.profiles();
                break;
            case 'proxies':
                content.proxySelectors();
                break;
            case 'orders':
                content.orders();
                break;
        }
    });
    ipcRenderer.on('logged into google', function (event, args) {
        if (args.type === 'new') {
            googleAccountLoginBtn.children[0].classList.value = 'fas fa-check';
            googleAccountLoginBtn.children[1].innerHTML = 'Linked';
        }
    });
    ipcRenderer.on('remove session', function (event, args) {
        var allSessions = settings.get('captcha-sessions');
        allSessions.splice(allSessions.indexOf(args), 1);
        settings.set('captcha-sessions', allSessions);
        content.harvesters();
    });
    ipcRenderer.on('test', function (event, args) {
        event.reply = 'hi';
    });
};
//# sourceMappingURL=ipc.js.map