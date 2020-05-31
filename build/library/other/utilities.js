var request = require('request');
var settings = require('electron-settings');
exports.generateId = function (length) {
    var idFormat = 'ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvxyz1234567890';
    var id = '';
    while (id.length < length) {
        id += idFormat[Math.floor(Math.random() * idFormat.length)];
    }
    return id;
};
exports.formatProxy = function (input) {
    if (!input) {
        return null;
    }
    else if (typeof input === 'string' && ['localhost', '', ' '].indexOf(input) != -1) {
        console.log('no proxy');
        return null;
    }
    else {
        var proxyComponents = input.split(':');
        var ip = proxyComponents[0];
        var port = proxyComponents[1];
        var user = proxyComponents[2];
        var pass = proxyComponents[3];
        if (!user || !pass)
            return "http://" + ip + ":" + port;
        else
            return "http://" + user + ":" + pass + "@" + ip + ":" + port;
    }
};
exports.sendTestWebhook = function () {
    if (settings.has('discord')) {
        var webhookUrl = settings.get('discord');
        request({
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
                            text: "ProsperAIO Success Monitor \u2022 " + new Date().toUTCString(),
                            icon_url: 'https://i.imgur.com/NGGew9J.png'
                        }
                    }]
            }
        }, function (error, response, body) {
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
};
//# sourceMappingURL=utilities.js.map