const jwt = require('../utils/JWT');
const { Professional } = require('../loaders/models');

const AuthController = {
  async login(req, res) {
    try {
      if(!req.body || !req.body.professional) {
        throw 'To generate a token, a professional must be sent\n';
      }

      let professional = await Professional.findOne({
        attributes: ['id'],
        where: { id: req.body.professional },
      });

      if(!professional) {
        return res.forbidden('Invalid professional\n');
      }

      let token = jwt.sign({ professional: { id: professional.id } });

      return res.ok({ token });
    } catch (e) {
      return res.badRequest(e);
    }
  },
};

module.exports = AuthController;
