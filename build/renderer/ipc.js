"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./elements");
var electron_1 = require("electron");
var settings = require("electron-settings");
var content_1 = require("./content");
function init() {
    electron_1.ipcRenderer.on('installing browser mode', function () {
        installBrowserBtn.disabled = true;
        installBrowserBtn.innerHTML = 'Installing Browser Mode...';
    });
    electron_1.ipcRenderer.on('check for browser executable', function () {
        var browserPath = settings.has('browser-path') ? settings.get('browser-path') : [];
        if (browserPath.length > 0) {
            installBrowserBtn.innerHTML = 'Installed Browser Mode';
            currentBrowserPath.value = settings.has('browser-path') ? settings.get('browser-path') : '';
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
        var allSessions = settings.get('captcha-sessions');
        allSessions.splice(allSessions.indexOf(args), 1);
        settings.set('captcha-sessions', allSessions);
        content_1.default.harvesters();
    });
}
exports.default = { init: init };
//# sourceMappingURL=ipc.js.map