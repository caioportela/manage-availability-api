/**
 * 401 (Unauthorized) Response
 *
 * @param  {String} data
**/

const logger = require('../loaders/logger');

module.exports = function sendUnauthorized(data) {
  logger.debug('Sending 401 ("Unauthorized") response');
  return this.res.status(401).send(data);
};
