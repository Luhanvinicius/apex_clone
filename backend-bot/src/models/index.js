const sequelize = require('../config/database');
const User = require('./User');
const Plan = require('./Plan');
const Payment = require('./Payment');
const Config = require('./Config');

const Source = require('./Source');
const Redirect = require('./Redirect');
const Admin = require('./Admin');

// Relations
User.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });
Plan.hasMany(User, { foreignKey: 'planId' });

Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Payment, { foreignKey: 'userId' });

Payment.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });
Plan.hasMany(Payment, { foreignKey: 'planId' });

// Multi-Bot Relations
User.belongsTo(Config, { foreignKey: 'configId', as: 'config' });
Plan.belongsTo(Config, { foreignKey: 'configId', as: 'config' });
Payment.belongsTo(Config, { foreignKey: 'configId', as: 'config' });
Source.belongsTo(Config, { foreignKey: 'configId', as: 'config' });
Config.hasMany(User, { foreignKey: 'configId' });
Config.hasMany(Plan, { foreignKey: 'configId' });
Config.hasMany(Payment, { foreignKey: 'configId' });
Config.hasMany(Source, { foreignKey: 'configId' });

module.exports = {
  sequelize,
  User,
  Plan,
  Payment,
  Config,
  Source,
  Redirect,
  Admin
};
