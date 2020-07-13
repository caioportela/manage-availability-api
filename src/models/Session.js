const { Model, DataTypes } = require('sequelize');

class Session extends Model {
  static init(sequelize) {
    return super.init({
      booked: { type: DataTypes.BOOLEAN, defaultValue: false },
      customer: DataTypes.STRING,
      end: { type: DataTypes.DATE, allowNull: false },
      start: { type: DataTypes.DATE, allowNull: false },
    }, {
      sequelize,
      tableName: 'session',

      defaultScope: {
        // Remove attributes from default query
        // https://sequelize.org/v5/manual/scopes.html
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
      },
    });
  }

  static associate(models) {
    this.belongsTo(models.Professional, {
      foreignKey: {
        allowNull: false,
        field: 'professionalId',
        name: 'professional'
      },
    });
  }
}

module.exports = Session;
