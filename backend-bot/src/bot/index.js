const { Telegraf, Markup } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const QRCode = require('qrcode');
const { User, Plan, Config, Source, Payment } = require('../models');
const PaymentService = require('../services/PaymentService');
const TelegramService = require('../services/TelegramService');

function createBot(config) {
  const bot = new Telegraf(config.botToken);
  
  // Custom storage for session since multiple bots share the same database
  bot.use((new LocalSession({ database: `session_${config.id}.json` })).middleware());

  // Helper: Main Menu Keyboard
  const mainMenu = () => Markup.keyboard([
    ['💎 Assinar VIP', '👤 Meu Perfil'],
    ['💬 Suporte', '❓ FAQ/Ajuda']
  ]).resize();

  // Start command
  bot.start(async (ctx) => {
    const telegramId = String(ctx.from.id);
    const utm = ctx.startPayload;
    
    let user = await User.findOne({ where: { telegramId, configId: config.id } });
    
    if (!user) {
      user = await User.create({
        telegramId,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
        username: ctx.from.username,
        sourceUtm: utm || null,
        configId: config.id
      });
      
      if (utm) {
        const source = await Source.findOne({ where: { utm, configId: config.id } });
        if (source) {
          await source.increment('clicks');
          await source.increment('leads');
        }
      }
    } else if (utm) {
       const source = await Source.findOne({ where: { utm, configId: config.id } });
       if (source) await source.increment('clicks');
    }

    await ctx.reply(`Olá ${ctx.from.first_name}! Bem-vindo ao nosso Bot VIP. 🚀\n\nEscolha uma opção no menu abaixo para começar:`, mainMenu());
  });

  // Handler: Show Plans
  const showPlans = async (ctx) => {
    const telegramId = String(ctx.from.id);
    const user = await User.findOne({ where: { telegramId, configId: config.id } });

    if (user.status === 'active') {
      return ctx.reply('✅ Você já possui uma assinatura ativa! Aproveite o conteúdo.', 
        Markup.inlineKeyboard([
          [Markup.button.url('🚀 Acessar Grupo VIP', await TelegramService.getInviteLink(config.vipGroupId, bot))]
        ])
      );
    }

    const plans = await Plan.findAll({ where: { active: true, configId: config.id } });
    if (!plans.length) {
      return ctx.reply('No momento não temos planos disponíveis. Tente novamente mais tarde.');
    }

    const keyboard = plans.map(p => [Markup.button.callback(`${p.name} - R$ ${p.price.toFixed(2)}`, `buy_${p.id}`)]);
    await ctx.reply(config.welcomeMessage, Markup.inlineKeyboard(keyboard));
  };

  bot.hears('💎 Assinar VIP', showPlans);
  bot.command('planos', showPlans);

  // Profile
  const showProfile = async (ctx) => {
    const telegramId = String(ctx.from.id);
    const user = await User.findOne({ where: { telegramId, configId: config.id }, include: ['plan'] });

    if (!user) return ctx.reply('Usuário não encontrado. Digite /start');

    let statusMsg = user.status === 'active' ? '🟢 *Status:* Ativo' : (user.status === 'expired' ? '🔴 *Status:* Expirado' : '⚪ *Status:* Pendente');

    let msg = `👤 *SEU PERFIL*\n\n🆔 *ID:* \`${user.telegramId}\`\n${statusMsg}\n`;
    if (user.status === 'active' && user.plan) {
      msg += `💎 *Plano:* ${user.plan.name}\n📅 *Início:* ${user.subscriptionStart.toLocaleDateString('pt-BR')}\n`;
      msg += user.subscriptionEnd ? `⌛ *Expira em:* ${user.subscriptionEnd.toLocaleDateString('pt-BR')}\n` : `♾ *Expira em:* Vitalício\n`;
    }

    const buttons = [];
    if (user.status === 'active') {
      buttons.push([Markup.button.url('🚀 Acessar Grupo VIP', await TelegramService.getInviteLink(config.vipGroupId, bot))]);
    } else {
      buttons.push([Markup.button.callback('💎 Assinar Agora', 'show_plans_inline')]);
    }

    await ctx.reply(msg, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
  };

  bot.hears('👤 Meu Perfil', showProfile);
  bot.command('perfil', showProfile);

  bot.hears('💬 Suporte', async (ctx) => {
    await ctx.reply('🛠 *SUPORTE TÉCNICO*\n\nClique no botão abaixo para falar com um atendente:', {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.url('👨‍💻 Falar com Suporte', `https://t.me/${config.supportUsername || 'ApexVips_Suporte'}`)]])
    });
  });

  bot.hears('❓ FAQ/Ajuda', async (ctx) => {
    const msg = `❓ *DÚVIDAS FREQUENTES*\n\n1️⃣ *Como funciona?*\nEscolha um plano e pague via PIX.\n2️⃣ *Seguro?*\nSim, via Wiinpay.\n3️⃣ *Liberação?*\nAutomática em < 1 min.`;
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  bot.action('show_plans_inline', showPlans);

  // Buy Action
  bot.action(/^buy_([0-9a-fA-F-]+)$/, async (ctx) => {
    const planId = ctx.match[1];
    const plan = await Plan.findByPk(planId);
    if (!plan) return ctx.answerCbQuery('Plano não encontrado.');

    const upsellPlan = await Plan.findOne({
      where: { active: true, configId: config.id, price: { [require('sequelize').Op.gt]: plan.price } },
      order: [['price', 'ASC']]
    });

    if (upsellPlan && config.upsellEnabled) {
      const diff = (upsellPlan.price - plan.price).toFixed(2);
      let msg = config.upsellMessage.replace(/{diff}/g, diff).replace(/{plan_name}/g, upsellPlan.name).replace(/{plan_price}/g, upsellPlan.price.toFixed(2));
      await ctx.reply(msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(`🚀 SIM! Quero o ${upsellPlan.name}`, `pay_${upsellPlan.id}`)],
            [Markup.button.callback(`Não, quero apenas o ${plan.name}`, `pay_${plan.id}`)]
          ]
        }
      });
    } else {
      await handlePaymentScreen(ctx, plan, config);
    }
    ctx.answerCbQuery().catch(() => {});
  });

  bot.action(/^pay_([0-9a-fA-F-]+)$/, async (ctx) => {
    const planId = ctx.match[1];
    const plan = await Plan.findByPk(planId);
    if (plan) await handlePaymentScreen(ctx, plan, config);
    ctx.answerCbQuery().catch(() => {});
  });

  bot.action(/^cancel_([0-9a-fA-F-]+)$/, async (ctx) => {
    const planId = ctx.match[1];
    const canceledPlan = await Plan.findByPk(planId);
    if (canceledPlan) {
      const downsellPlan = await Plan.findOne({
        where: { active: true, configId: config.id, price: { [require('sequelize').Op.lt]: canceledPlan.price } },
        order: [['price', 'DESC']]
      });

      if (downsellPlan && config.downsellEnabled) {
        let msg = config.downsellMessage.replace(/{plan_name}/g, downsellPlan.name).replace(/{plan_price}/g, downsellPlan.price.toFixed(2));
        await ctx.reply(msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [Markup.button.callback(`✅ Sim, eu quero o ${downsellPlan.name}!`, `pay_${downsellPlan.id}`)],
              [Markup.button.callback(`Não, não quero agora.`, `cancel_all`)]
            ]
          }
        });
        return ctx.answerCbQuery();
      }
    }
    await ctx.reply('Sua compra foi cancelada com sucesso.');
    ctx.answerCbQuery();
  });

  bot.action('cancel_all', async (ctx) => {
    await ctx.reply('Compra cancelada. Até a próxima!');
    ctx.answerCbQuery();
  });

  return bot;
}

async function handlePaymentScreen(ctx, plan, config) {
  const user = await User.findOne({ where: { telegramId: String(ctx.from.id), configId: config.id } });
  if (!user) return ctx.reply('Digite /start');
  
  const payment = await PaymentService.createPixPayment(user.id, plan.id, plan.price);
  await Payment.update({ configId: config.id }, { where: { id: payment.id } });

  await ctx.reply(`💳 *Plano:* ${plan.name}\n💰 *Valor:* R$ ${plan.price.toFixed(2)}\n\nPague via PIX:`, { parse_mode: 'Markdown' });
  try {
    const qrBuffer = await QRCode.toBuffer(payment.qrCode);
    await ctx.replyWithPhoto({ source: qrBuffer });
  } catch (e) {}
  await ctx.reply(`\`${payment.qrCode}\``, { parse_mode: 'Markdown' });
  await ctx.reply('⏳ Aguardando aprovação...', Markup.inlineKeyboard([[Markup.button.callback('❌ Cancelar', `cancel_${plan.id}`)]]));
}

module.exports = { createBot };
