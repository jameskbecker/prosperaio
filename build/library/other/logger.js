var winston = require('winston');
var format = winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.align(), winston.format.printf(function (info) {
    var timestamp = info.timestamp, level = info.level, message = info.message;
    var ts = timestamp.slice(0, 23).replace('T', ' ');
    message = message.replace(/\t/g, '');
    return ts + " [" + level + "] " + message;
}));
var logger = winston.createLogger({
    format: format,
    level: process.env["LOG_LEVEL"] || "debug",
    transports: [
        new winston.transports.Console()
    ]
});
module.exports = logger;
//# sourceMappingURL=logger.js.map