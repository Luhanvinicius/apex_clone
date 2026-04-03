const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  telegramId: { type: DataTypes.STRING, allowNull: false },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  username: DataTypes.STRING,
  status: { type: DataTypes.ENUM('active', 'expired', 'pending', 'blocked_bot'), defaultValue: 'pending' },
  configId: { type: DataTypes.UUID, allowNull: false },
  planId: { type: DataTypes.UUID, references: { model: 'Plans', key: 'id' } },
  subscriptionStart: DataTypes.DATE,
  subscriptionEnd: DataTypes.DATE,
  lastInteraction: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  sourceUtm: { type: DataTypes.STRING }, // Para rastreabilidade de vendas (ADM)
  device: { type: DataTypes.STRING },
  osBrowser: { type: DataTypes.STRING }
}, {
  indexes: [
    {
      unique: true,
      fields: ['telegramId', 'configId']
    }
  ]
});


module.exports = User;
