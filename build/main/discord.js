"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPresence = void 0;
var electron_1 = require("electron");
var DiscordRPC = __importStar(require("discord-rpc"));
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