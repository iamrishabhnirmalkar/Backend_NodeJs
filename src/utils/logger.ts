import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import config from '../config/config';

const { combine, timestamp, printf, colorize, align } = winston.format;

// Custom log format for the "butterfly" console effect
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const ts = (timestamp as string).slice(0, 19).replace('T', ' ');
  const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${ts} [${level}]: ${message} ${metaString}`;
});

// File log format (JSON for parsing)
const fileFormat = combine(timestamp(), winston.format.json());

const logger = winston.createLogger({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(timestamp(), winston.format.errors({ stack: true })),
  defaultMeta: { service: 'backend-service' },
  transports: [
    // Console Transport (Pretty Print)
    new winston.transports.Console({
      format: combine(colorize({ all: true }), timestamp(), align(), consoleFormat),
    }),
    // Daily Rotate File (Error Logs)
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: fileFormat,
    }),
    // Daily Rotate File (All Logs)
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
    }),
  ],
});

export default logger;
