const { Model, DataTypes } = require('sequelize');

class Professional extends Model {
  static init(sequelize) {
    return super.init({
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
    }, {
      sequelize,
      tableName: 'professional',
    });
  }
}

module.exports = Professional;
