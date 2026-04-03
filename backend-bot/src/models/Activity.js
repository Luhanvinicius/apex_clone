const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activity = sequelize.define('Activity', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  configId: { type: DataTypes.UUID },
  type: { type: DataTypes.STRING }, // 'user_joined', 'payment_created', 'payment_approved'
  message: { type: DataTypes.TEXT },
  metadata: { type: DataTypes.JSONB }
});

module.exports = Activity;
