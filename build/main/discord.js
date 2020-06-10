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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPresence = void 0;
const electron_1 = require("electron");
const DiscordRPC = __importStar(require("discord-rpc"));
function setPresence() {
    const rpc = new DiscordRPC.Client({
        transport: 'ipc'
    });
    rpc.on('ready', () => {
        rpc.setActivity({
            details: `Version ${electron_1.app.getVersion()}`,
            startTimestamp: new Date(),
            instance: false,
            largeImageKey: 'prosperaio_logo'
        });
    });
    let clientId = '648966990400061451';
    rpc.login({ clientId }).catch((e) => { console.log(e); });
}
exports.setPresence = setPresence;
//# sourceMappingURL=discord.js.map