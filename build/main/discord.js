"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPresence = void 0;
var electron_1 = require("electron");
var DiscordRPC = require("discord-rpc");
function setPresence() {
    var rpc = new DiscordRPC.Client({
        transport: 'ipc'
    });
    rpc.on('ready', function () {
        rpc.setActivity({
            details: "Version " + electron_1.app.getVersion(),
            startTimestamp: new Date(),
            instance: false,
            largeImageKey: 'prosperaio_logo'
        });
    });
    var clientId = '648966990400061451';
    rpc.login({ clientId: clientId }).catch(function (e) { console.log(e); });
}
exports.setPresence = setPresence;
//# sourceMappingURL=discord.js.map