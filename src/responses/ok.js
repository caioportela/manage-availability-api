/**
 * 200 (OK) Response
 *
 * @param  {Object} data
**/

const logger = require('../loaders/logger');

module.exports = function sendOk(data) {
  logger.debug('Sending 200 ("OK") response');
  return this.res.status(200).json(data);
};
