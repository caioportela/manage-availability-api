const { Model, DataTypes } = require('sequelize');

class Professional extends Model {
  static init(sequelize) {
    return super.init({
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
    }, {
      sequelize,
      tableName: 'professional',

      defaultScope: {
        // Remove attributes from default query
        // https://sequelize.org/v5/manual/scopes.html
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
      },
    });
  }
}

module.exports = Professional;
