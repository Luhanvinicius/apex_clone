const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('telegram_vip', 'postgres', '2026', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Set to true to see SQL queries in console
});

module.exports = sequelize;
