const { Model, DataTypes } = require('sequelize');

class Professional extends Model {
  static init(sequelize) {
    return super.init({
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },

      // Save token for mock an authentication
      token: DataTypes.STRING,
    }, {
      sequelize,
      tableName: 'professional',

      // Remove token from the default query
      // https://sequelize.org/v5/manual/scopes.html
      defaultScope: {
        attributes: {
          exclude: ['token']
        },
      },
    });
  }
}

module.exports = Professional;
