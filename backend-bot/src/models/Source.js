const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Source = sequelize.define('Source', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  utm: { type: DataTypes.STRING, unique: true, allowNull: false },
  clicks: { type: DataTypes.INTEGER, defaultValue: 0 },
  leads: { type: DataTypes.INTEGER, defaultValue: 0 },
  conversions: { type: DataTypes.INTEGER, defaultValue: 0 },
  configId: {
    type: DataTypes.UUID,
    allowNull: true
  }
});

module.exports = Source;
