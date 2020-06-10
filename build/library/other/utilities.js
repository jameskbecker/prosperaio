"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestWebhook = exports.formatProxy = exports.generateId = void 0;
const request_1 = __importDefault(require("request"));
const electron_settings_1 = __importDefault(require("electron-settings"));
function generateId(length) {
    const idFormat = 'ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvxyz1234567890';
    let id = '';
    while (id.length < length) {
        id += idFormat[Math.floor(Math.random() * idFormat.length)];
    }
    return id;
}
exports.generateId = generateId;
function formatProxy(input) {
    if (!input) {
        return null;
    }
    else if (typeof input == 'string' && ['localhost', '', ' '].indexOf(input) != -1) {
        console.log('no proxy');
        return null;
    }
    else {
        let proxyComponents = input.split(':');
        let ip = proxyComponents[0];
        let port = proxyComponents[1];
        let user = proxyComponents[2];
        let pass = proxyComponents[3];
        if (!user || !pass)
            return 'http://' + ip + ':' + port;
        else
            return 'http://' + user + ':' + pass + '@' + ip + ':' + port;
    }
}
exports.formatProxy = formatProxy;
function sendTestWebhook() {
    if (electron_settings_1.default.has('discord')) {
        let webhookUrl = electron_settings_1.default.get('discord');
        request_1.default({
            url: webhookUrl,
            method: 'POST',
            json: true,
            body: {
                embeds: [{
                        author: {
                            name: 'Test Webhook'
                        },
                        type: 'rich',
                        color: '16007763',
                        thumbnail: {
                            url: 'https://i.imgur.com/NGGew9J.png',
                        },
                        fields: [
                            {
                                name: 'Product:',
                                value: 'Product Name',
                                inline: false
                            },
                            {
                                name: 'Size:',
                                value: 'Size Name',
                                inline: true
                            },
                            {
                                name: 'Site:',
                                value: 'Site Name',
                                inline: true
                            },
                            {
                                name: 'Profile:',
                                value: 'Profile Name',
                                inline: true
                            },
                            {
                                name: 'Order Number:',
                                value: '||1234567890||',
                                inline: true
                            }
                        ],
                        footer: {
                            text: `ProsperAIO Success Monitor • ${new Date().toUTCString()}`,
                            icon_url: 'https://i.imgur.com/NGGew9J.png'
                        }
                    }]
            }
        }, (error, response, body) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log(response.statusMessage);
            }
        });
    }
    else {
        console.log('no custom webhook');
    }
}
exports.sendTestWebhook = sendTestWebhook;
//# sourceMappingURL=utilities.js.map