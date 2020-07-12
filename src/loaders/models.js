/**
 * Models
 * @description :: Configuring application models
**/

const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const modelsPath = `${__dirname}/../models`;
const databases = require('../../config/databases.js');
const { Sequelize } = require('sequelize');
const logger = require('../loaders/logger');
const db = {};

let sequelize = new Sequelize(databases[process.env.NODE_ENV || 'development']);

const files = fs.readdirSync(modelsPath).filter((file) => {
  return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
});

files.forEach((file) => {
  logger.debug(`Loading Model: ${path.parse(file).name}`);

  let model = require(path.join(modelsPath, file));
  model = model.init(sequelize, Sequelize);

  db[model.name] = model;
});

for(let modelName in db) {
  if(db[modelName].associate) {
    db[modelName].associate();
  }
}

sequelize.sync();
db.sequelize = sequelize;

module.exports = db;
