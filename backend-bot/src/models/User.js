const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  telegramId: { type: DataTypes.STRING, allowNull: false, unique: true },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  username: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'expired', 'pending'), defaultValue: 'pending' },
  configId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  planId: { type: DataTypes.UUID, references: { model: 'Plans', key: 'id' } },
  subscriptionStart: DataTypes.DATE,
  subscriptionEnd: DataTypes.DATE,
  lastInteraction: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  sourceUtm: { type: DataTypes.STRING } // Para rastreabilidade de vendas (ADM)
});

module.exports = User;
