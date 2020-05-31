var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var isDev = require('electron-is-dev');
var config = require('../config-not_needed');
var workerWindowProps = {
    height: 100,
    width: 100,
    show: false,
    webPreferences: {
        nodeIntegration: true
    }
};
var WorkerWindow = (function (_super) {
    __extends(WorkerWindow, _super);
    function WorkerWindow(path, options) {
        if (path === void 0) { path = ''; }
        if (options === void 0) { options = {}; }
        var _this = _super.call(this, __assign(__assign({}, workerWindowProps), options)) || this;
        _this.loadURL(path);
        _this.webContents.once('dom-ready', function () {
            if (isDev)
                _this.webContents.openDevTools({ mode: 'detach' });
        });
        return _this;
    }
    return WorkerWindow;
}(BrowserWindow));
//# sourceMappingURL=WorkerWindow.js.map