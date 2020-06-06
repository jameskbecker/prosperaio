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
exports.logger = void 0;
var winston = __importStar(require("winston"));
var format = winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.align(), winston.format.printf(function (info) {
    var timestamp = info.timestamp, level = info.level, message = info.message;
    var ts = timestamp.slice(0, 23).replace('T', ' ');
    message = message.replace(/\t/g, '');
    return ts + " [" + level + "] " + message;
}));
exports.logger = winston.createLogger({
    format: format,
    level: process.env['LOG_LEVEL'] || 'debug',
    transports: [
        new winston.transports.Console()
    ]
});
//# sourceMappingURL=logger.js.map