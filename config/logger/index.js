const { createLogger, format, transports } = require('winston');
const expressWinston = require('express-winston');
const fs = require('fs');
const path = require('path');
require('winston-loggly-bulk');

const env = process.env.NODE_ENV || 'development';
const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const combinedFile = path.join(logDir, 'combined.log');
const errorFile = path.join(logDir, 'error.log');

const logger = createLogger({
    // change level if in dev environment versus production
  level: env === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.json()
),
transports: [
  new transports.Console({
    level: 'info',
    format: format.combine(
      format.colorize(),
      format.printf(
        info => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    handleExceptions: true,
    json: false
  }),
  new transports.File({
    handleExceptions: true,
    filename: combinedFile,
    prettyprint: true,
    maxsize: 5242880, //5MB
    maxFiles: 5,
    json: true
  }),
  new transports.File({
    level: 'error',
    handleExceptions: true,  
    filename: errorFile,
    prettyprint: true,
    maxsize: 5242880, //5MB
    maxFiles: 5,
    json: true
  })
],
exitOnError: false
});

  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  //if (process.env.NODE_ENV !== 'production') {
    //logger.add(new transports.Console({
      //format: format.simple()
    //}));
  //};
  logger.stream = {
    write: (message, encoding) => {
      // use the 'info' log level so the output will be picked up by both transports (file and console)
      logger.info(message);
    },
  };

  module.exports = logger;