const express = require('express');
const router = express.Router();
const { User, Plan, Payment, Config, Source, Redirect, Admin, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const botManager = require('../bot/manager');
const PaymentService = require('../services/PaymentService');

const JWT_SECRET = process.env.JWT_SECRET || 'apex-vips-ultra-secret-2026';

// --- Auth Middleware ---
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso negado' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findByPk(decoded.id);
    if (!admin) throw new Error();
    req.admin = admin;
    next();
  } catch (e) { res.status(401).json({ error: 'Token inválido' }); }
};

// --- Auth Routes ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin || !(await admin.validatePassword(password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, admin: { username: admin.username, role: admin.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/register-initial', async (req, res) => {
  const adminCount = await Admin.count();
  if (adminCount > 0) return res.status(400).json({ error: 'Administrador já inicializado' });
  const { username, password } = req.body;
  const admin = await Admin.create({ username, password });
  res.json({ success: true, message: 'Admin inicial criado com sucesso' });
});

// A partir daqui, as rotas podem ser protegidas
// router.use(authenticate); // Opcional: Ativar para todas abaixo ou apenas em algumas

// --- Dashboard & Intelligence Stats ---
router.get('/stats', async (req, res) => {
  const { botId } = req.query;
  const whereCl = botId ? { configId: botId } : {};

  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const usersCount = await User.count({ where: whereCl });
    const activeUsers = await User.count({ where: { ...whereCl, status: 'active' } });
    const expiredUsers = await User.count({ where: { ...whereCl, status: 'expired' } });
    const blockedUsers = 0;
    const subscriptionsCount = activeUsers;

    // Métricas de Vendas (Hoje)
    const salesToday = await Payment.count({ where: { ...whereCl, status: 'approved', createdAt: { [Op.gte]: today } } });
    const revenueToday = await Payment.sum('amount', { where: { ...whereCl, status: 'approved', createdAt: { [Op.gte]: today } } }) || 0;

    // Métricas de Vendas (Mês)
    const salesMonth = await Payment.count({ where: { ...whereCl, status: 'approved', createdAt: { [Op.gte]: startOfMonth } } });
    const revenueMonth = await Payment.sum('amount', { where: { ...whereCl, status: 'approved', createdAt: { [Op.gte]: startOfMonth } } }) || 0;

    // Histórico
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d).setHours(0,0,0,0);
      const end = new Date(d).setHours(23,59,59,999);
      const daySales = await Payment.sum('amount', { where: { ...whereCl, status: 'approved', createdAt: { [Op.between]: [start, end] } } }) || 0;
      history.push({ name: d.toISOString().split('T')[0], value: daySales });
    }

    res.json({
      users: { today: 0, month: 0, active: activeUsers, total: usersCount, blocked: blockedUsers, subscriptions: subscriptionsCount },
      sales: { today: salesToday, revenueToday, month: salesMonth, revenueMonth },
      history,
      conversion: {
        user: { today: 0, month: 0, total: 0 },
        payment: { today: 0, month: 0, total: 0 },
        avgTime: { today: 0, month: 0, total: 0 },
        ticket: { today: 0, month: 0, total: salesMonth > 0 ? (revenueMonth / salesMonth).toFixed(2) : 0 }
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Ranking ---
router.get('/ranking', async (req, res) => {
  const { botId } = req.query;
  const whereCl = botId ? { configId: botId, status: 'approved' } : { status: 'approved' };
  try {
    const ranking = await Payment.findAll({
      attributes: [
        'userId',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalRevenue'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalSales']
      ],
      where: whereCl,
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName', 'telegramId'] }],
      group: ['userId', 'user.id', 'user.firstName', 'user.lastName', 'user.telegramId'],
      order: [[sequelize.literal('"totalRevenue"'), 'DESC']],
      limit: 10
    });
    res.json(ranking);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Trackeamento (Tracking Cloud) ---
router.get('/tracking', async (req, res) => {
  const sources = await Source.findAll({ order: [['clicks', 'DESC']] });
  res.json(sources);
});

router.post('/tracking', async (req, res) => {
  const source = await Source.create(req.body);
  res.json(source);
});

router.delete('/tracking/:id', async (req, res) => {
  await Source.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- Redirecionadores ---
router.get('/redirects', async (req, res) => {
  const links = await Redirect.findAll({ order: [['clicks', 'DESC']] });
  res.json(links);
});

router.post('/redirects', async (req, res) => {
  const link = await Redirect.create(req.body);
  res.json(link);
});

router.delete('/redirects/:id', async (req, res) => {
  await Redirect.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- Users (Audience Management) ---
router.get('/users', async (req, res) => {
  const { status, q } = req.query;
  const whereCl = status ? { status } : {};
  if (q) {
    whereCl[Op.or] = [
      { firstName: { [Op.iLike]: `%${q}%` } },
      { lastName: { [Op.iLike]: `%${q}%` } },
      { telegramId: { [Op.iLike]: `%${q}%` } }
    ];
  }
  const users = await User.findAll({
    where: whereCl,
    include: ['plan'],
    order: [['createdAt', 'DESC']]
  });
  res.json(users);
});

router.put('/users/:id', async (req, res) => {
  await User.update(req.body, { where: { id: req.params.id } });
  const updated = await User.findByPk(req.params.id, { include: ['plan'] });
  res.json(updated);
});

router.delete('/users/:id', async (req, res) => {
  await Payment.destroy({ where: { userId: req.params.id } });
  await User.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- Plans (Offer Management) ---
router.get('/plans', async (req, res) => {
  const { botId } = req.query;
  const whereCl = botId ? { configId: botId } : {};
  const plans = await Plan.findAll({ where: whereCl, order: [['price', 'ASC']] });
  res.json(plans);
});

router.post('/plans', async (req, res) => {
  const { botId } = req.query;
  const plan = await Plan.create({ ...req.body, configId: botId });
  res.json(plan);
});

router.put('/plans/:id', async (req, res) => {
  await Plan.update(req.body, { where: { id: req.params.id } });
  res.json(await Plan.findByPk(req.params.id));
});

router.delete('/plans/:id', async (req, res) => {
  await Plan.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- Payments (Financial Ledger) ---
router.get('/payments', async (req, res) => {
  const payments = await Payment.findAll({
    include: ['user', 'plan'],
    order: [['createdAt', 'DESC']]
  });
  res.json(payments);
});

// --- Multi-Bot Config Central ---
router.get('/config', async (req, res) => {
  const { id } = req.query;
  console.log('[API] GET /config id:', id);
  if (id) {
    const bot = await Config.findByPk(id);
    console.log('[API] Found bot:', bot?.botUsername);
    return res.json(bot);
  }
  const bots = await Config.findAll({ order: [['createdAt', 'DESC']] });
  console.log('[API] Total bots found:', bots.length);
  res.json(bots);
});

router.post('/config', async (req, res) => {
  const { id, botToken, botUsername, antiClone, welcomeMessage, welcomeFileId, supportUsername, expiredMessage, reminderMessage, vipGroupId, upsellEnabled, upsellMessage, downsellEnabled, downsellMessage, botExternalId } = req.body;
  
  console.log('[API] POST /config payload botToken:', botToken);
  let bot;
  if (id) {
    console.log('[API] Updating bot:', id);
    await Config.update({
      botToken, botUsername, antiClone, welcomeMessage, welcomeFileId, supportUsername, expiredMessage, reminderMessage, vipGroupId, upsellEnabled, upsellMessage, downsellEnabled, downsellMessage, botExternalId
    }, { where: { id } });
    bot = await Config.findByPk(id);
    await botManager.reloadBot(bot);
  } else {
    console.log('[API] Creating NEW bot instance.');
    const count = await Config.count();
    const tempName = botUsername || `Bot Apex #${count + 1}`;
    
    bot = await Config.create({ 
      botToken: botToken,
      botUsername: tempName,
      antiClone: antiClone || false,
      welcomeMessage: welcomeMessage || 'Welcome to our VIP Bot!',
      supportUsername: supportUsername || null,
      upsellEnabled: upsellEnabled !== undefined ? upsellEnabled : true,
      downsellEnabled: downsellEnabled !== undefined ? downsellEnabled : true
    });
    console.log('[API] NEW Bot created with ID:', bot.id);
    await botManager.startBot(bot);
  }
  res.json(bot);
});

router.delete('/config/:id', async (req, res) => {
  await botManager.stopBot(req.params.id);
  await Config.destroy({ where: { id: req.params.id } });
  res.json({ success: true });
});

// --- Webhooks ---
router.post('/webhooks/payment', async (req, res) => {
  const { botId } = req.query; // Precisamos do botContext para o webhook
  try {
    const botInstance = botManager.bots.get(botId);
    await PaymentService.processWebhook(req.body, botInstance);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- Broadcast Center ---
router.post('/broadcast', async (req, res) => {
  const { message, audience, botId } = req.body;
  const botInstance = botManager.bots.get(botId);
  if (!botInstance) return res.status(404).json({ error: 'Bot não encontrado ou inativo.' });

  let whereCl = { configId: botId };
  if (audience === 'active') whereCl.status = 'active';
  if (audience === 'expired') whereCl.status = 'expired';
  
  const users = await User.findAll({ where: whereCl });
  let count = 0;
  
  for (const user of users) {
    try {
      await botInstance.telegram.sendMessage(user.telegramId, message, { parse_mode: 'HTML' });
      count++;
    } catch (e) { console.log('Fail on broadcast:', user.telegramId); }
  }
  
  res.json({ success: true, count });
});

module.exports = router;
