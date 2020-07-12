/**
 * 204 (No Content) Response
**/

const logger = require('../loaders/logger');

module.exports = function sendNoContent() {
  logger.debug('Sending 204 ("No Content") response');
  return this.res.status(204).send();
};
