const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Redirect = sequelize.define('Redirect', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true, allowNull: false },
  target: { type: DataTypes.TEXT, allowNull: false },
  clicks: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Redirect;
