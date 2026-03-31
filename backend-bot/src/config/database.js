const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'telegram_vip',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '2026',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false, // Set to true to see SQL queries in console
  }
);

module.exports = sequelize;
