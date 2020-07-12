/**
 * Routes
 * @description :: Configuring application routes
**/

const express = require('express');
const router = express.Router();

const {
  ProfessionalController,
  SessionController
} = require('./controllers');


// Professional Controller
router.get('/professionals', ProfessionalController.find);
router.get('/professionals/:id', ProfessionalController.findOne);
router.post('/professionals', ProfessionalController.create);
router.put('/professionals/:id', ProfessionalController.update);
router.delete('/professionals/:id', ProfessionalController.destroy);


// Professional Controller
router.get('/sessions', SessionController.find);
router.get('/sessions/:id', SessionController.findOne);
router.post('/sessions', SessionController.create);
router.put('/sessions/:id', SessionController.update);
router.delete('/sessions/:id', SessionController.destroy);


module.exports = (app) => app.use(router);
