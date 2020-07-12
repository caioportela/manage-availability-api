/**
 * Logger
 * @description :: Configuring application Logger using Winston
 * @info        :: https://github.com/winstonjs/winston
**/

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.colorize(),
    format.splat(),
    format.simple()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ]
});

module.exports = logger;
