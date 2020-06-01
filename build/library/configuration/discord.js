"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateWebhook = exports.publicWebhook = void 0;
var sites = require("./sites");
function publicWebhook(additionalFields) {
    if (additionalFields === void 0) { additionalFields = []; }
    var defaultSites = sites.def;
    var siteData = defaultSites[this.taskData.site];
    var content = {
        embeds: [{
                "title": "Successfully Checked Out!",
                "type": "rich",
                "color": 3642623,
                "thumbnail": {
                    url: this._productImageUrl ? this._productImageUrl : "https://www.yankee-division.com/uploads/1/7/6/5/17659643/notavailable_2_orig.jpg?210",
                    height: 150,
                    width: 150
                },
                "footer": {
                    text: "ProsperAIO Success \u2022 " + new Date().toUTCString(),
                    icon_url: "https://i.imgur.com/NGGew9J.png"
                }
            }]
    };
    var fields = [
        {
            name: 'Product:',
            value: this.productName || "Product Name N/A",
            inline: false
        },
        {
            name: "Store:",
            value: siteData.label || "N/A",
            inline: true
        },
        {
            name: "Mode:",
            value: this.taskData.setup.mode.split('-')[1].capitalise(),
            inline: true
        },
        {
            name: "Size:",
            value: this.sizeName || "N/A",
            inline: true
        }
    ];
    for (var i = 0; i < additionalFields.length; i++) {
        fields.push(additionalFields[i]);
    }
    content.embeds[0].fields = fields;
    return content;
}
exports.publicWebhook = publicWebhook;
function privateWebhook(additionalFields) {
    if (additionalFields === void 0) { additionalFields = []; }
    var content = {
        embeds: [{
                "title": "Successfully Checked Out!",
                "type": "rich",
                "description": this.productName || "Product Name N/A",
                "color": 3642623,
                "image": {
                    url: this._productImageUrl ? this._productImageUrl : "https://www.yankee-division.com/uploads/1/7/6/5/17659643/notavailable_2_orig.jpg?210",
                    height: 150,
                    width: 150
                },
                "footer": {
                    text: "ProsperAIO Success \u2022 " + new Date().toUTCString(),
                    icon_url: "https://i.imgur.com/NGGew9J.png"
                }
            }]
    };
    if (this.checkoutData.id)
        this.orderNumber = this.checkoutData.id;
    var fields = [
        {
            name: "Store:",
            value: this.taskData.site.label || "N/A",
            inline: true
        },
        {
            name: "Mode:",
            value: this.taskData.setup.mode.split('-')[1].capitalise(),
            inline: true
        },
        {
            name: "Profile:",
            value: this.profileName ? "||" + this.profileName + "||" : "N/A",
            inline: true
        },
        {
            name: "Bypass Captcha:",
            value: !this.hasCaptcha,
            inline: true
        },
        {
            name: "Size:",
            value: this.sizeName || "N/A",
            inline: true
        },
        {
            name: "Order Number:",
            value: this.orderNumber ? "||" + this.orderNumber + "||" : "N/A",
            inline: true
        }
    ];
    for (var i = 0; i < additionalFields.length; i++) {
        fields.push(additionalFields[i]);
    }
    content.embeds[0].fields = fields;
    console.log(fields);
    return content;
}
exports.privateWebhook = privateWebhook;
//# sourceMappingURL=discord.js.map