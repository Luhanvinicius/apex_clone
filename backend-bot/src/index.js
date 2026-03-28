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

sequelize.sync({ alter: true }).then(async () => {
  console.log('PostgreSQL connected and tables synced');
  
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`🚀 API Apex Online port ${port}`);
  });
  
  // Start the fleet in background
  botManager.init();
  startCronJobs();
}).catch(err => {
  console.error('Database connection error:', err);
});

process.once('SIGINT', () => process.exit(0));
process.once('SIGTERM', () => process.exit(0));
