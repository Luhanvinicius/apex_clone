const { Config } = require('./src/models');
const sequelize = require('./src/config/database');

async function dump() {
  await sequelize.authenticate();
  const configs = await Config.findAll();
  console.log('Configs:', JSON.stringify(configs, null, 2));
  process.exit();
}
dump();
