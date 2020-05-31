"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var BrowserWindow = require('electron').BrowserWindow;
var isDev = require('electron-is-dev');
var defaultProperties = {
    "backgroundColor": '#1a1919',
    "frame": false,
    "show": false,
    "resizable": true,
    "webPreferences": {
        nodeIntegration: true
    }
};
var BotWindow = (function (_super) {
    __extends(BotWindow, _super);
    function BotWindow(path, properties) {
        var _this = _super.call(this, __assign(__assign({}, defaultProperties), properties)) || this;
        _this.loadURL(path);
        _this.once('ready-to-show', function () {
            if (isDev)
                _this.webContents.openDevTools({ mode: "detach" });
            _this.show();
        });
        return _this;
    }
    return BotWindow;
}(BrowserWindow));
exports.default = BotWindow;
//# sourceMappingURL=BotWindow.js.map