import * as winston from 'winston';

const format = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    let {  timestamp, level, message	} = info;
    const ts = timestamp.slice(0, 23).replace('T', ' ');
    message = message.replace(/\t/g, '');
    return `${ts} [${level}] ${message}`;
  })
);

export const logger = winston.createLogger({
	format,
	level: process.env['LOG_LEVEL'] || 'debug',
  transports: [
    new winston.transports.Console()
    // new winston.transports.File({ filename: 'combined.log' })
  ]
});
