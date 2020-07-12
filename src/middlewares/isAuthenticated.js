/**
* isAuthenticated
*
* @description :: Check if professional is authenticated with JSON web token.
* @info        :: For the mock authentication, the token can be found in the model.
**/

const jwt = require('../utils/JWT');
const { Professional } = require('../loaders/models');

function isAuthenticated(req, res, next) {
  let token;

  if(req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');

    if(parts.length === 2) {
      const [scheme, credentials] = parts;

      if(/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.badRequest('Invalid authorization format\n');
    }
  } else {
    return res.unauthorized('Authorization credentials not informed\n');
  }

  jwt.verify(token, async (err, token) => {
    if(err || !token.professional) {
      return res.unauthorized('Invalid token\n');
    }

    const professional = await Professional.findOne({
      attributes: ['id'],
      where: { id: token.professional.id },
    });

    if(!professional) {
      return res.unauthorized('Professional not found\n');
    }

    req.professional = professional.get({ plain: true });

    return next();
  });
}

module.exports = isAuthenticated;
