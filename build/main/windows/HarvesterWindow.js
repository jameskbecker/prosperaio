"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const sitekeys_1 = __importDefault(require("../../library/configuration/sitekeys"));
class HarvesterWindow {
    constructor(_sessionName, _siteId) {
        this.state = 'init';
        this.siteType = _siteId;
        this.config = sitekeys_1.default(_siteId);
        this.sessionName = _sessionName;
        this.server = express_1.default();
        this.serverPort;
        this.window = null;
    }
    async spawn() {
        let captchaSession = electron_1.session.fromPartition('persist:' + this.sessionName);
        this.window = new electron_1.BrowserWindow({
            backgroundColor: '#202020',
            height: 600,
            width: 400,
            resizable: false,
            frame: false,
            show: true,
            alwaysOnTop: false,
            webPreferences: {
                'nodeIntegration': true,
                'webSecurity': false,
                'session': captchaSession
            }
        });
        this.window.webContents.session.protocol.interceptBufferProtocol('http', (request, callback) => {
            if (request.url.includes(this.config.domain)) {
                let reqPath = request.url.split('.com/')[1] === '' ? 'assets/harvester.html' : request.url.split('.com')[1];
                if (reqPath === '/config') {
                    callback(Buffer.from(JSON.stringify({ sessionName: this.sessionName,
                        site: this.siteType
                    })));
                    return;
                }
                console.log(path_1.default.join(electron_1.app.getAppPath(), reqPath));
                fs_1.default.readFile(path_1.default.join(electron_1.app.getAppPath(), reqPath), 'utf8', function (err, data) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    callback(Buffer.from(data));
                });
            }
            else {
                const req = electron_1.net.request(request);
                req.on('response', res => {
                    const chunks = [];
                    res.on('data', chunk => {
                        chunks.push(Buffer.from(chunk));
                    });
                    res.on('end', async () => {
                        const file = Buffer.concat(chunks);
                        callback(file);
                    });
                });
                req.end();
            }
        });
        this.window.loadURL(`http://${this.config.domain}`, {});
        if (electron_is_dev_1.default)
            this.window.webContents.openDevTools({ mode: 'undocked' });
        this.window.webContents.once('did-finish-load', () => {
            this.window.show();
        });
    }
}
exports.default = HarvesterWindow;
//# sourceMappingURL=HarvesterWindow.js.map