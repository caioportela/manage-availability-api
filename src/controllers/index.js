'use strict';

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const logger = require('../loaders/logger');
const controllers = {};

const files = fs.readdirSync(__dirname).filter((file) => {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
});

files.forEach(file => {
  const fileName = path.parse(file).name;
  const controller = require(path.join(__dirname, file));

  logger.debug(`Loading Controller: ${fileName}`);
  controllers[fileName] = controller;
});

module.exports = controllers;
