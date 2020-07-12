/**
 * JWT
 *
 * @description :: JSON Web Token Service
 * @info        :: See https://github.com/auth0/node-jsonwebtoken
**/

const jwt = require('jsonwebtoken');
const SECRET = 'secret-key';

const JWTService = {
  sign(payload) {
    return jwt.sign(payload, SECRET);
  },

  verify(token, cb) {
    return jwt.verify(token, SECRET, {}, cb);
  },
};

module.exports = JWTService;
