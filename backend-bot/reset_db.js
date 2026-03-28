const { User, Payment, Plan, Source, Config } = require('./src/models');
const sequelize = require('./src/config/database');

async function clean() {
  await sequelize.authenticate();
  console.log('--- Limpando Tabelas Apex Cloud ---');
  try {
    await User.destroy({ where: {} });
    await Payment.destroy({ where: {} });
    await Plan.destroy({ where: {} });
    await Source.destroy({ where: {} });
    await Config.destroy({ where: {} });
    console.log('✅ Banco Zerado e Identidades Resetadas!');
  } catch (e) { console.error('Erro ao limpar:', e.message); }
  process.exit();
}
clean();
