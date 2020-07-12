/**
 * 404 (Not Found) Response
 *
 * @param  {String|Object} data
**/

const logger = require('../loaders/logger');

module.exports = function sendNotFound(data) {
  logger.debug('Sending 404 ("Not Found") response');
  return this.res.status(404).send(data);
};
