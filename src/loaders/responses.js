/**
 * Responses
 * @description :: Configuring application responses
**/

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const responsesPath = `${__dirname}/../responses`;
const logger = require('../loaders/logger');
const formatters = {};

const files = fs.readdirSync(responsesPath).filter((file) => {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
});

files.forEach((file) => {
  const responseTitle = path.parse(file).name;
  const responseFormat = require(path.join(responsesPath, file));
  formatters[responseTitle] = responseFormat;
  logger.debug(`Loading Response Formatter: ${responseTitle}`);
});

function generateFormatsForRes(req, res, next) {
  for(let title in formatters) {
    const formatter = formatters[title];
    logger.debug(`Loading Response Formatter: ${title}`);
    res[title] = formatter.bind({ res });
  }

  next();
}

module.exports = generateFormatsForRes;
