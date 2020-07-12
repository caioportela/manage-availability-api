const logger = require('../loaders/logger');
const jwt = require('../utils/JWT');
const { Professional } = require('../loaders/models');

const ProfessionalController = {
  async create(req, res) {
    try {
      let body = req.body.professional;

      if(!body) {
        throw 'Object "professional" must be sent\n';
      }

      if(!body.firstName) {
        throw 'Professional must have a first name\n';
      }

      if(!body.lastName) {
        throw 'Professional must have a last name\n';
      }

      let professional = await Professional.create(body);

      // Generate a token to mock an authentication
      professional.token = jwt.sign({ professional: { id: professional.id } });
      await professional.save();

      return res.created({ professional });
    } catch (e) {
      logger.error(`ProfessionalController :: create\n${e}`);
      return res.badRequest(e);
    }
  },

  async destroy(req, res) {
    try {
      await Professional.destroy({
        where: { id: req.params.id }
      });

      return res.noContent();
    } catch (e) {
      logger.error(`ProfessionalController :: destroy\n${e}`);
      return res.badRequest(e);
    }
  },

  async find(req, res) {
    let { limit, skip, ...where } = req.query;

    let query = { };

    if(limit) {
      query.limit = parseInt(limit);
    }

    if(skip) {
      query.offset = parseInt(skip);
    }

    try {
      let professionals = await Professional.findAll({
        ...query,
        where,
      });

      return res.ok({ professionals });
    } catch (e) {
      logger.error(`ProfessionalController :: find\n${e}`);
      return res.badRequest(e);
    }
  },

  async findOne(req, res) {
    try {
      let professional = await Professional.findOne({
        where: { id: req.params.id }
      });

      if(!professional) {
        return res.notFound('Professional not found\n');
      }

      return res.ok({ professional });
    } catch (e) {
      logger.error(`ProfessionalController :: findOne\n${e}`);
      return res.badRequest(e);
    }
  },

  async token(req, res) {
    try{
      let professionals = await Professional.findAll({
        attributes: ['id', 'token'],
      });

      return res.ok({ professionals });
    } catch(e) {
      logger.error(`ProfessionalController :: tokens\n${e}`);
      return res.badRequest(e);
    }
  },

  async update(req, res) {
    try {
      let body = req.body.professional;

      if(!body) {
        throw 'Object "professional" must be sent\n';
      }

      let professional = await Professional.findOne({
        where: { id: req.params.id }
      });

      await professional.update({
        ...body,
        token: professional.token
      });

      return res.ok({ professional });
    } catch (e) {
      logger.error(`ProfessionalController :: update\n${e}`);
      return res.badRequest(e);
    }
  },
};

module.exports = ProfessionalController;
