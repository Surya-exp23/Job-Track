const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Human-readable format for local dev (colored, single line, shows stack traces)
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }), // ensures err.stack is captured, not just err.message
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack} ${metaStr}`
      : `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

// Structured JSON for production (easy to search/aggregate later)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),

    // Rotating file logs — useful even on a hackathon deploy if you have persistent disk
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
    }),
  ],
  exceptionHandlers: [new winston.transports.Console()], // catches sync crashes
  rejectionHandlers: [new winston.transports.Console()], // catches unhandled promise rejections
});

module.exports = logger;