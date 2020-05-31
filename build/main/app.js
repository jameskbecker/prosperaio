"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var isDev = require("electron-is-dev");
var Main_1 = require("./Main");
var mainWindow;
var workerWindow;
var loginWindow;
var threeDSWindows;
var captchaWindows;
var defaultProps = {
    "backgroundColor": '#1a1919',
    "frame": false,
    "show": false,
    "resizable": true,
    "webPreferences": {
        nodeIntegration: true
    }
};
var loginWindowProps = __assign({}, defaultProps);
var workerWindowProps = __assign({}, defaultProps);
try {
    electron_1.app.disableHardwareAcceleration();
}
catch (e) {
    console.log(e);
}
Main_1.default.main(electron_1.app, electron_1.BrowserWindow, isDev);
//# sourceMappingURL=app.js.map