const morgan = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');

// Initialize logger
const logger = require('./src/loaders/logger');

// Initialize responses
const responses = require('./src/loaders/responses');

// Initialize models
require('./src/loaders/models');

const app = express();

app.use(responses);
app.use(bodyParser.json());

// Initialize routes
require('./src/routes')(app);

app.use(morgan('dev'));
app.set('json spaces', 2);

if (process.env.NODE_ENV && process.env.NODE_ENV === 'test') {
  logger.info(`Exposing app as module for testing`);
  logger.level = 'info';
  module.exports = app;
} else {
  const server = app.listen(3000, () => {
    logger.info('App listening at port %s', server.address().port);
  });
}
