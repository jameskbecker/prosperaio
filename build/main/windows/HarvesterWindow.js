"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HarvesterWindow = void 0;
var electron = require('electron');
var app = electron.app, BrowserWindow = electron.BrowserWindow, net = electron.net, protocol = electron.protocol, session = electron.session;
var bodyParser = require('body-parser');
var config = require('../config-not_needed');
var express = require('express');
var path = require('path');
var isDev = require('electron-is-dev');
var harvesterConfiguration = require('../../library/configuration/sitekeys');
var HarvesterWindow = (function () {
    function HarvesterWindow(_sessionName, _siteId) {
        this.state = 'init';
        this.siteType = _siteId;
        this.config = harvesterConfiguration(_siteId);
        this.sessionName = _sessionName;
        this.server = express();
        this.serverPort;
        this.window = null;
    }
    HarvesterWindow.prototype.spawn = function () {
        var _this = this;
        this.server
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
            extended: true
        }))
            .use('/assets', express.static(path.join(app.getAppPath(), 'assets')))
            .use('/library', express.static(path.join(app.getAppPath(), 'src/library')))
            .use('/assets/fontawesome', express.static(path.join(app.getAppPath(), 'node_modules/@fortawesome/fontawesome-free')))
            .get('/', function (req, res) {
            res.sendFile(config.captchaWindowPath);
        })
            .get('/config', function (req, res) {
            res.json({
                sessionName: _this.sessionName,
                site: _this.siteType
            });
        });
        this.serverPort = Math.floor(Math.random() * 9999) + 1000;
        this.server.listen(this.serverPort);
        var captchaSession = session.fromPartition("persist:" + this.sessionName);
        this.window = new BrowserWindow({
            backgroundColor: '#202020',
            height: 600,
            width: 400,
            resizable: false,
            frame: false,
            show: true,
            alwaysOnTop: true,
            webPreferences: {
                'nodeIntegration': true,
                'webSecurity': false,
                'session': captchaSession
            }
        });
        this.window.webContents.session.setProxy({
            proxyRules: 'http=localhost:' + this.serverPort,
            proxyBypassRules: '.google.com, .gstatic.com, .youtube.com'
        })
            .then(function () {
            _this.window.loadURL("http://" + _this.config.domain + ":" + _this.serverPort, {});
            _this.window.show();
            if (isDev)
                _this.window.webContents.openDevTools({ mode: 'undocked' });
        });
    };
    return HarvesterWindow;
}());
exports.HarvesterWindow = HarvesterWindow;
//# sourceMappingURL=HarvesterWindow.js.map