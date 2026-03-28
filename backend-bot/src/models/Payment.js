const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Plan = require('./Plan');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  planId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Plans',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  method: {
    type: DataTypes.ENUM('pix', 'credit_card'),
    allowNull: false
  },
  externalReference: {
    type: DataTypes.STRING
  },
  qrCode: {
    type: DataTypes.TEXT
  },
  expireAt: {
    type: DataTypes.DATE
  },
  configId: {
    type: DataTypes.UUID,
    allowNull: true
  }
});

module.exports = Payment;
