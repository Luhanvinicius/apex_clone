const sequelize = require('./src/config/database');

async function describe() {
  const table = await sequelize.getQueryInterface().describeTable('Configs');
  console.log('Configs Schema:', JSON.stringify(table, null, 2));
  process.exit();
}
describe();
