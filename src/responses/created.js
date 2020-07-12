/**
 * 201 (Created) Response
 *
 * @param  {Object} data
**/

const logger = require('../loaders/logger');

module.exports = function sendCreated(data) {
  logger.debug('Sending 201 ("Created") response');
  return this.res.status(201).json(data);
};
