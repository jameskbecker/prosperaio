const winston = require('winston')

const logger = winston.createLogger({
	format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf((info) => {
      let {  timestamp, level, message, ...args	} = info;
			const ts = timestamp.slice(0, 23).replace('T', ' ');
			message = message.replace(/\t/g, '');
      return `${ts} [${level}] ${message}`;
    }),
	),
	level: process.env["LOG_LEVEL"] || "debug",
  transports: [
    new winston.transports.Console()
    // new winston.transports.File({ filename: 'combined.log' })
  ]
});
//module.exports = console;
module.exports = logger;