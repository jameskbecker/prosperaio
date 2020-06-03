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
var isDev = __importStar(require("electron-is-dev"));
var Main_1 = __importDefault(require("./Main"));
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