/**
 * 403 (Forbidden) Response
 *
 * @param  {String} data
**/

const logger = require('../loaders/logger');

module.exports = function sendForbidden(data) {
  logger.debug('Sending 403 ("Forbidden") response');
  return this.res.status(403).send(data);
};
