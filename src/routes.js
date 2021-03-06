/**
 * Routes
 * @description :: Configuring application routes
**/

const express = require('express');
const router = express.Router();

const { isAuthenticated } = require('./middlewares');

const {
  AuthController,
  ProfessionalController,
  SessionController
} = require('./controllers');


// Auth Controller
router.post('/login', AuthController.login);


// Professional Controller
router.get('/professionals', ProfessionalController.find);
router.get('/professionals/:id', ProfessionalController.findOne);
router.post('/professionals', ProfessionalController.create);
router.delete('/professionals/:id', ProfessionalController.destroy);


// Session Controller
router.get('/sessions', SessionController.find);
router.get('/sessions/available', SessionController.findAvailable);
router.get('/sessions/:id', SessionController.findOne);
router.post('/sessions', [isAuthenticated], SessionController.create);
router.put('/sessions/:id/schedule', SessionController.schedule);
router.delete('/sessions/:id', [isAuthenticated], SessionController.destroy);


module.exports = (app) => app.use(router);
