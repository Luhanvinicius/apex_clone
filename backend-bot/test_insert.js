const { Config } = require('./src/models');
const sequelize = require('./src/config/database');

async function test() {
  await sequelize.authenticate();
  console.log('--- Initial State ---');
  let c = await Config.findAll();
  console.log(c.map(x => x.id));

  console.log('--- Creating Bot 1 ---');
  const b1 = await Config.create({ botToken: 'TOKEN_1', botUsername: 'Bot 1' });
  console.log('Created ID:', b1.id);

  console.log('--- Creating Bot 2 ---');
  const b2 = await Config.create({ botToken: 'TOKEN_2', botUsername: 'Bot 2' });
  console.log('Created ID:', b2.id);

  console.log('--- Final State ---');
  c = await Config.findAll();
  console.log(c.map(x => ({id: x.id, name: x.botUsername})));
  process.exit();
}
test();
