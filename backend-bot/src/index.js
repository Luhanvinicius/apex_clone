require('dotenv').config();
const express = require('express');

const cors = require('cors');
const apiRoutes = require('./routes/api');
const botManager = require('./bot/manager');
const { startCronJobs } = require('./jobs/cronJobs');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
let server = null;
let shuttingDown = false;

app.use('/api', apiRoutes);
app.get('/', (req, res) => res.send('🚀 Apex Bot API is Online!'));

const { Redirect, sequelize } = require('./models');
app.get('/r/:slug', async (req, res) => {
  const { slug } = req.params;
  const link = await Redirect.findOne({ where: { slug } });
  if (link) {
    await link.increment('clicks');
    return res.redirect(link.target);
  }
  res.status(404).send('Link não encontrado');
});

const shouldAlterSchema = process.env.DB_SYNC_ALTER === 'true';

sequelize.sync(shouldAlterSchema ? { alter: true } : {}).then(async () => {
  console.log('PostgreSQL connected and tables synced');
  
  const port = process.env.PORT || 5001;
  server = app.listen(port, () => {
    console.log(`🚀 API Apex Online port ${port}`);
  });
  
  // Start the fleet in background
  botManager.init();
  startCronJobs();
}).catch(err => {
  console.error('Database connection error:', err);
});

const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  try {
    console.log(`🧹 Encerrando backend (${signal})...`);
    await botManager.stopAll(signal);
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  } catch (err) {
    console.error(`⚠️ Erro ao encerrar backend (${signal}):`, err.message);
  }
};

process.once('SIGINT', async () => {
  await shutdown('SIGINT');
  process.exit(0);
});

process.once('SIGTERM', async () => {
  await shutdown('SIGTERM');
  process.exit(0);
});

process.once('SIGUSR2', async () => {
  await shutdown('SIGUSR2');
  process.kill(process.pid, 'SIGUSR2');
});
