const express = require('express');
const router = express.Router();
const { User, Plan, Payment, Config, Source, Redirect, Admin, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const botManager = require('../bot/manager');
const PaymentService = require('../services/PaymentService');

// Configuração do multer para upload de arquivos
const uploadDir = path.resolve(__dirname, '../../../frontend-admin/public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const originalName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${originalName}-${uniqueSuffix}${ext}`.toLowerCase());
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const JWT_SECRET = process.env.JWT_SECRET || 'apex-vips-ultra-secret-2026';
const ACCOUNT_DEFAULT_PREFERENCES = {
  hideRankingName: false,
  emailNotifications: true,
  telegramNotifications: false,
  deviceNotifications: false
};

const cleanString = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const formatDateBR = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não informado';
  return date.toLocaleDateString('pt-BR');
};

const formatDateTimeBR = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não informado';
  return date.toLocaleString('pt-BR', { hour12: false });
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || req.socket.remoteAddress || '127.0.0.1');
  return rawIp.split(',')[0].trim().replace('::ffff:', '');
};

const parseUserAgent = (userAgent = '') => {
  const ua = String(userAgent).toLowerCase();

  let device = 'Desktop';
  if (ua.includes('iphone') || ua.includes('android') || ua.includes('mobile')) device = 'Mobile';
  if (ua.includes('ipad') || ua.includes('tablet')) device = 'Tablet';

  let os = 'Sistema não identificado';
  if (ua.includes('windows')) os = 'Windows';
  if (ua.includes('mac os') || ua.includes('macintosh')) os = 'Mac OS';
  if (ua.includes('linux') && !ua.includes('android')) os = 'Linux';
  if (ua.includes('android')) os = 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  let browser = 'Navegador';
  if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';

  return { device, osBrowser: `${os} • ${browser}` };
};

const buildCurrentSession = (req) => {
  const { device, osBrowser } = parseUserAgent(req.headers['user-agent']);
  return {
    id: `session-${Date.now()}`,
    device: device === 'Desktop' ? 'Desktop' : device,
    osBrowser,
    location: 'Conexão Local',
    type: device,
    ip: getClientIp(req),
    connectedAt: formatDateTimeBR(new Date()),
    current: true
  };
};

const normalizeSessions = (sessions, req) => {
  const source = Array.isArray(sessions) ? sessions : [];
  let normalized = source
    .map((session, index) => {
      if (!session || typeof session !== 'object') return null;
      return {
        id: cleanString(session.id, `session-${Date.now()}-${index}`),
        device: cleanString(session.device, 'Desktop'),
        osBrowser: cleanString(session.osBrowser, 'Sistema não identificado • Navegador'),
        location: cleanString(session.location, 'Conexão Local'),
        type: cleanString(session.type, 'Desktop'),
        ip: cleanString(session.ip, '127.0.0.1'),
        connectedAt: cleanString(session.connectedAt, formatDateTimeBR(new Date())),
        current: Boolean(session.current)
      };
    })
    .filter(Boolean)
    .slice(0, 5);

  if (!normalized.length) normalized = [buildCurrentSession(req)];

  let foundCurrent = false;
  normalized = normalized.map((session) => {
    if (!foundCurrent && session.current) {
      foundCurrent = true;
      return session;
    }
    return { ...session, current: false };
  });

  if (!foundCurrent) {
    normalized[0] = { ...normalized[0], current: true };
  }

  return normalized;
};

const normalizeAccounts = (accounts, fallbackEmail, fallbackMemberSince) => {
  const source = Array.isArray(accounts) ? accounts : [];
  const emailSet = new Set();

  let normalized = source
    .map((account, index) => {
      if (!account || typeof account !== 'object') return null;
      const email = cleanString(account.email, '').toLowerCase();
      if (!email || emailSet.has(email)) return null;
      emailSet.add(email);
      return {
        id: cleanString(account.id, `account-${Date.now()}-${index}`),
        email,
        memberSince: cleanString(account.memberSince, fallbackMemberSince),
        current: Boolean(account.current)
      };
    })
    .filter(Boolean)
    .slice(0, 5);

  if (!normalized.length) {
    normalized = [{
      id: 'account-1',
      email: fallbackEmail.toLowerCase(),
      memberSince: fallbackMemberSince,
      current: true
    }];
  }

  let foundCurrent = false;
  normalized = normalized.map((account) => {
    if (!foundCurrent && account.current) {
      foundCurrent = true;
      return account;
    }
    return { ...account, current: false };
  });

  if (!foundCurrent) {
    normalized[0] = { ...normalized[0], current: true };
  }

  return normalized;
};

const normalizePreferences = (preferences, fallback = ACCOUNT_DEFAULT_PREFERENCES) => ({
  hideRankingName: typeof preferences?.hideRankingName === 'boolean' ? preferences.hideRankingName : Boolean(fallback.hideRankingName),
  emailNotifications: typeof preferences?.emailNotifications === 'boolean' ? preferences.emailNotifications : Boolean(fallback.emailNotifications),
  telegramNotifications: typeof preferences?.telegramNotifications === 'boolean' ? preferences.telegramNotifications : Boolean(fallback.telegramNotifications),
  deviceNotifications: typeof preferences?.deviceNotifications === 'boolean' ? preferences.deviceNotifications : Boolean(fallback.deviceNotifications)
});

const buildAccountPayload = async (admin, req, settingsOverride = null) => {
  const settingsRaw = settingsOverride ?? admin.accountSettings;
  const settings = settingsRaw && typeof settingsRaw === 'object' ? settingsRaw : {};

  const fallbackEmail = cleanString(admin.email, `${admin.username}@apex.local`);
  const memberSince = formatDateBR(admin.createdAt);
  const botsCount = await Config.count();

  return {
    profile: {
      displayName: cleanString(admin.displayName, admin.username),
      fullName: cleanString(admin.fullName, admin.username),
      email: fallbackEmail,
      phone: cleanString(admin.phone, 'Não informado'),
      memberSince,
      activeBots: String(botsCount),
      botLimit: cleanString(settings.botLimit, '30')
    },
    preferences: normalizePreferences(settings.preferences),
    sessions: normalizeSessions(settings.sessions, req),
    accounts: normalizeAccounts(settings.accounts, fallbackEmail, memberSince)
  };
};

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

// --- Account ---
router.get('/account', authenticate, async (req, res) => {
  try {
    const payload = await buildAccountPayload(req.admin, req);
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/account', authenticate, async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const profile = body.profile && typeof body.profile === 'object' ? body.profile : {};
    const settingsRaw = req.admin.accountSettings && typeof req.admin.accountSettings === 'object' ? req.admin.accountSettings : {};

    const displayName = cleanString(profile.displayName, cleanString(req.admin.displayName, req.admin.username));
    const fullName = cleanString(profile.fullName, cleanString(req.admin.fullName, req.admin.username));
    const email = cleanString(profile.email, cleanString(req.admin.email, `${req.admin.username}@apex.local`)).toLowerCase();
    const phone = cleanString(profile.phone, cleanString(req.admin.phone, 'Não informado'));
    const botLimit = cleanString(profile.botLimit, cleanString(settingsRaw.botLimit, '30'));

    const preferences = normalizePreferences(body.preferences, settingsRaw.preferences || ACCOUNT_DEFAULT_PREFERENCES);
    const sessions = normalizeSessions(body.sessions ?? settingsRaw.sessions, req);
    const accounts = normalizeAccounts(body.accounts ?? settingsRaw.accounts, email, formatDateBR(req.admin.createdAt));

    await req.admin.update({ displayName, fullName, email, phone });
    req.admin.accountSettings = {
      ...settingsRaw,
      botLimit,
      preferences,
      sessions,
      accounts
    };
    await req.admin.save();

    const payload = await buildAccountPayload(req.admin, req, req.admin.accountSettings);
    res.json(payload);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// A partir daqui, as rotas podem ser protegidas
// router.use(authenticate); // Opcional: Ativar para todas abaixo ou apenas em algumas

// --- Dashboard & Intelligence Stats ---
router.get('/stats', async (req, res) => {
  const { botId } = req.query;
  const whereCl = botId ? { configId: botId } : {};
  const paymentWhereCl = botId ? { configId: botId, status: 'approved' } : { status: 'approved' };

  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const usersToday = await User.count({ where: { ...whereCl, createdAt: { [Op.gte]: today } } });
    const usersMonth = await User.count({ where: { ...whereCl, createdAt: { [Op.gte]: startOfMonth } } });
    const usersCount = await User.count({ where: whereCl });
    const activeUsers = await User.count({ where: { ...whereCl, status: 'active' } });
    const blockedUsersCount = await User.count({ where: { ...whereCl, status: 'blocked_bot' } });
    const subscriptionsCount = activeUsers;

    // Métricas de Vendas (Hoje)
    const salesToday = await Payment.count({ where: { ...paymentWhereCl, createdAt: { [Op.gte]: today } } });
    const revenueToday = await Payment.sum('amount', { where: { ...paymentWhereCl, createdAt: { [Op.gte]: today } } }) || 0;

    // Métricas de Vendas (Mês)
    const salesMonth = await Payment.count({ where: { ...paymentWhereCl, createdAt: { [Op.gte]: startOfMonth } } });
    const revenueMonth = await Payment.sum('amount', { where: { ...paymentWhereCl, createdAt: { [Op.gte]: startOfMonth } } }) || 0;

    // Histórico (7 dias)
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d).setHours(0,0,0,0);
      const end = new Date(d).setHours(23,59,59,999);
      const daySales = await Payment.sum('amount', { where: { ...paymentWhereCl, createdAt: { [Op.between]: [start, end] } } }) || 0;
      history.push({ name: d.toISOString().split('T')[0], value: daySales });
    }

    // Conversões e Insights
    const totalPaymentsCreated = await Payment.count({ where: whereCl });
    const totalApprovedPayments = await Payment.count({ where: paymentWhereCl });
    const usersWithApprovedPayments = await Payment.count({
      distinct: true,
      col: 'userId',
      where: paymentWhereCl 
    });

    const conversionUserTotal = usersCount > 0 ? ((usersWithApprovedPayments / usersCount) * 100).toFixed(2) : 0;
    const conversionPaymentTotal = totalPaymentsCreated > 0 ? ((totalApprovedPayments / totalPaymentsCreated) * 100).toFixed(2) : 0;

    // Atividade Recente
    const activities = await Activity.findAll({
      where: whereCl,
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Agregados por Dispositivo/OS
    const browserStats = await User.findAll({
      attributes: ['osBrowser', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: whereCl,
      group: ['osBrowser'],
      raw: true
    });

    const deviceStats = await User.findAll({
      attributes: ['device', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: whereCl,
      group: ['device'],
      raw: true
    });

    res.json({
      users: { 
        today: usersToday, 
        month: usersMonth, 
        active: activeUsers, 
        total: usersCount, 
        blocked: blockedUsersCount, 
        subscriptions: subscriptionsCount 
      },
      sales: { today: salesToday, revenueToday, month: salesMonth, revenueMonth },
      history,
      activities,
      browserStats,
      deviceStats,
      conversion: {
        user: { today: 0, month: 0, total: conversionUserTotal },
        payment: { today: 0, month: 0, total: conversionPaymentTotal },
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
  const { id, botToken, ...rest } = req.body;
  
  console.log('[API] POST /config payload botToken:', botToken);
  const updateData = { ...rest };
  if (botToken) updateData.botToken = botToken;

  let bot;
  if (id) {
    console.log('[API] Updating bot:', id);
    bot = await Config.findByPk(id);

    if (!bot && botToken) {
      bot = await Config.findOne({ where: { botToken } });
    }

    if (!bot) {
      const configs = await Config.findAll({ order: [['createdAt', 'ASC']] });
      if (configs.length === 1) {
        bot = configs[0];
        console.log('[API] Recovered stale bot id using the only available config:', bot.id);
      }
    }

    if (!bot) {
      return res.status(404).json({ error: 'Bot não encontrado para atualização.' });
    }

    await bot.update(updateData);
    await botManager.reloadBot(bot);
  } else {
    console.log('[API] Creating NEW bot instance.');
    const existingBot = botToken
      ? await Config.findOne({ where: { botToken } })
      : null;

    if (existingBot) {
      console.log('[API] Reusing existing bot for duplicated token:', existingBot.id);
      await existingBot.update(updateData);
      await botManager.reloadBot(existingBot);
      return res.json(existingBot);
    }

    const count = await Config.count();
    const tempName = rest.botUsername || `Bot Apex #${count + 1}`;
    
    bot = await Config.create({ 
      ...updateData,
      botToken: botToken,
      botUsername: tempName,
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

// --- Upload Route ---
router.post('/upload', upload.single('file'), (req, res) => {
  console.log('[API] Processing file upload...');
  if (!req.file) {
    console.error('[API] No file received.');
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  console.log('[API] File uploaded successfully:', req.file.filename);
  res.json({ filename: req.file.filename });
});

module.exports = router;
