/**
 * 400 (Bad Request) Response
 *
 * @param  {String|Object} data
**/

const logger = require('../loaders/logger');

module.exports = function sendBadRequest(data) {
  logger.debug('Sending 400 ("Bad Request") response');
  return this.res.status(400).send(data);
};
