const { Telegraf, Markup } = require('telegraf');
const LocalSession = require('telegraf-session-local');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { User, Plan, Config, Source, Payment, Activity } = require('../models');
const PaymentService = require('../services/PaymentService');
const TelegramService = require('../services/TelegramService');

function createBot(config) {
  const parsePrice = (val) => {
    if (typeof val === 'number') return val;
    const clean = String(val || '0').replace(',', '.').replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  const bot = new Telegraf(config.botToken);
  const sessionDirectory = path.resolve(__dirname, '../../runtime/sessions');
  fs.mkdirSync(sessionDirectory, { recursive: true });
  
  bot.use((new LocalSession({
    database: path.join(sessionDirectory, `session_${config.id}.json`)
  })).middleware());

  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id || 'sem-chat';
    const fromId = ctx.from?.id || 'sem-from';
    const text = ctx.message?.text || ctx.callbackQuery?.data || ctx.updateType;
    console.log(`📨 [${config.botUsername}] update chat=${chatId} from=${fromId} payload=${text}`);
    return next();
  });

  bot.catch((err, ctx) => {
    console.error(`❌ [${config.botUsername}] erro no update ${ctx.updateType}:`, err.message);
  });

  bot.start(async (ctx) => {
    const telegramId = String(ctx.from.id);
    const utm = ctx.startPayload;
    
    let user = await User.findOne({ where: { telegramId } });
    if (!user) {
      try {
        user = await User.create({ telegramId, firstName: ctx.from.first_name, lastName: ctx.from.last_name, username: ctx.from.username, sourceUtm: utm || null, configId: config.id });
      } catch (err) {
        user = await User.findOne({ where: { telegramId } });
      }
    }

    let welcomeMsg = config.welcomeMessage || `Olá {first_name}! Bem-vindo ao nosso Bot VIP. 🚀`;
    welcomeMsg = welcomeMsg.replace(/{first_name}/g, ctx.from.first_name);

    const allItems = [...(config.subscriptionItems || []), ...(config.packageItems || [])];
    const plans = allItems.length > 0 ? allItems : await Plan.findAll({ where: { active: true, configId: config.id } });

    if (plans.length > 0) {
      const keyboard = plans.map(p => [
        Markup.button.callback(`${p.name} por R$${parsePrice(p.price || p.value).toFixed(2).replace('.', ',')}`, `buy_${p.id}`)
      ]);
      await ctx.reply(welcomeMsg, { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } });
    } else {
      await ctx.reply(welcomeMsg, { parse_mode: 'HTML' });
    }
  });

  // Flow Centralizado de Vendas (Bump/Upsell)
  async function handleCheckUpsell(ctx, planId) {
    try {
      const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      const freshConfig = await Config.findByPk(config.id);
      const useConfig = freshConfig || config;
      const extras = useConfig.editBotExtras || {};

      let plan = isUUID(planId) ? await Plan.findByPk(planId) : null;
      if (!plan) {
        const allItems = [...(useConfig.subscriptionItems || []), ...(useConfig.packageItems || [])];
        const item = allItems.find(i => String(i.id) === String(planId));
        if (item) {
          plan = { 
            ...item,
            id: item.id, 
            name: item.name, 
            price: parsePrice(item.price || item.value || 0), 
            durationDays: Number(item.durationDays || item.time || 0)
          };
        }
      }
      if (!plan) throw new Error('Plano não encontrado.');

      // Garantir que o price do plano seja número
      plan.price = parsePrice(plan.price);

      // VERIFICA SE O PLANO ESPECÍFICO TEM BUMP (Prioridade Total)
      const bumpEnabled = plan.orderBumpEnabled === true || plan.orderBumpEnabled === 'true' || plan.orderBumpEnabled === 1;

      if (bumpEnabled) {
        console.log(`🚀 [${useConfig.botUsername}] Order Bump Detectado no Plano: ${plan.name}`);
        
        let bumpMsg = plan.orderBumpText || `Voce tem (1) oferta!\n\nTenha Acesso a mais!\nPor Apenas R$ {order_bump_value}`;
        const targetPrice = parsePrice(plan.orderBumpValue || "4.90");
        const targetName = plan.orderBumpName || '+ 6 GRUPOS VIPS';
        const totalPrice = Number(plan.price) + Number(targetPrice);
        
        bumpMsg = bumpMsg
          .replace(/{selected_plan_name}/g, plan.name)
          .replace(/{order_bump_name}/g, targetName)
          .replace(/{order_bump_value}/g, targetPrice.toFixed(2).replace('.', ','))
          .replace(/{total_value}/g, totalPrice.toFixed(2).replace('.', ','));
        
        const bumpButtons = [
          [
            Markup.button.callback(`✅ SIM, QUERO +6 GRUPOS`, `pay_bump_${plan.id}`),
            Markup.button.callback(`❌ NÃO, Recusar oferta`, `pay_${plan.id}`)
          ]
        ];

        const bumpMedia = plan.orderBumpMediaFileName || plan.orderBumpMediaName;
        if (bumpMedia) {
           try {
             let mediaPath = path.resolve(__dirname, `../../../frontend-admin/public/uploads/${bumpMedia}`);
             console.log(`📂 Buscando mídia do Bump (Plano): ${mediaPath}`);
             
             if (!fs.existsSync(mediaPath)) {
               console.log(`⚠️ Arquivo não encontrado diretamente: ${bumpMedia}. Iniciando busca por padrão...`);
               const uploadsDir = path.resolve(__dirname, '../../../frontend-admin/public/uploads');
               if (fs.existsSync(uploadsDir)) {
                 const files = fs.readdirSync(uploadsDir);
                 const ext = path.extname(bumpMedia);
                 const baseName = path.basename(bumpMedia, ext);
                 
                 const foundFile = files.find(f => f === bumpMedia || (f.startsWith(baseName) && path.extname(f) === ext));
                 
                 if (foundFile) {
                   mediaPath = path.join(uploadsDir, foundFile);
                   console.log(`✅ Arquivo encontrado por padrão: ${foundFile}`);
                 }
               }
             }

             if (fs.existsSync(mediaPath)) {
               const ext = path.extname(mediaPath).toLowerCase();
               if (ext === '.mp4') {
                 return await ctx.replyWithVideo({ source: mediaPath }, { caption: bumpMsg, parse_mode: 'Markdown', ...Markup.inlineKeyboard(bumpButtons) });
               } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                 return await ctx.replyWithPhoto({ source: mediaPath }, { caption: bumpMsg, parse_mode: 'Markdown', ...Markup.inlineKeyboard(bumpButtons) });
               } else {
                 return await ctx.replyWithAnimation({ source: mediaPath }, { caption: bumpMsg, parse_mode: 'Markdown', ...Markup.inlineKeyboard(bumpButtons) });
               }
             } else {
                console.error(`❌ ARQUIVO NÃO ENCONTRADO: ${mediaPath}`);
             }
           } catch (e) { console.error('🔴 Erro crítico na mídia do Plano:', e.message); }
        }
        return await ctx.reply(bumpMsg, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(bumpButtons) });
      }

      // Se NÃO tiver bump no plano, verifica se tem o Global (Fallback)
      const globalExtras = useConfig.editBotExtras || {};
      const globalBumpEnabled = globalExtras.orderBumpEnabled === true || globalExtras.orderBumpEnabled === 'true' || globalExtras.orderBumpEnabled === 1 || globalExtras.orderBumpActive === true || globalExtras.orderBumpActive === 'true' || globalExtras.order_bump_active === true || globalExtras.order_bump_active === 'true' || globalExtras.bumpEnabled === true || globalExtras.bumpEnabled === 'true';

      if (globalBumpEnabled) {
        const bumpPlanId = globalExtras.orderBumpPlanId || globalExtras.bumpPlanId;
        let bumpPlan = isUUID(String(bumpPlanId)) ? await Plan.findByPk(bumpPlanId) : null;
        let targetPlan = bumpPlan;
        if (!targetPlan && useConfig.upsellEnabled) {
          targetPlan = await Plan.findOne({ where: { active: true, configId: useConfig.id, price: { [require('sequelize').Op.gt]: plan.price } }, order: [['price', 'ASC']] });
        }

        let bumpMsg = globalExtras.orderBumpText || globalExtras.bumpText || `Você tem (1) oferta!\n\nTenha Acesso a mais!\nPor Apenas R$ {plan_price}`;
        const targetPrice = targetPlan ? targetPlan.price : (parseFloat(globalExtras.orderBumpValue || globalExtras.bumpValue) || 4.90);
        const targetName = targetPlan ? targetPlan.name : (globalExtras.orderBumpName || globalExtras.bumpName || '+ 6 GRUPOS VIPS');
        bumpMsg = bumpMsg.replace(/{plan_name}/g, targetName).replace(/{plan_price}/g, targetPrice.toFixed(2).replace('.', ',')).replace(/{selected_plan_name}/g, plan.name);
        
        const bumpButtons = [
          [
            Markup.button.callback(`✅ SIM, QUERO +6 GRUPOS`, `pay_${targetPlan ? targetPlan.id : plan.id}`),
            Markup.button.callback(`❌ NÃO, Recusar oferta`, `pay_${plan.id}`)
          ]
        ];

        const bumpMedia = globalExtras.orderBumpMediaName || globalExtras.bumpMediaName;
        if (bumpMedia) {
          try {
            let mediaPath = path.resolve(__dirname, `../../../frontend-admin/public/uploads/${bumpMedia}`);
            console.log(`📂 Buscando mídia do Bump (Global): ${mediaPath}`);

            if (!fs.existsSync(mediaPath)) {
              console.log(`⚠️ Arquivo não encontrado diretamente: ${bumpMedia}. Iniciando busca por padrão...`);
              const uploadsDir = path.resolve(__dirname, '../../../frontend-admin/public/uploads');
              if (fs.existsSync(uploadsDir)) {
                const files = fs.readdirSync(uploadsDir);
                const ext = path.extname(bumpMedia);
                const baseName = path.basename(bumpMedia, ext);
                
                const foundFile = files.find(f => f === bumpMedia || (f.startsWith(baseName) && path.extname(f) === ext));
                
                if (foundFile) {
                  mediaPath = path.join(uploadsDir, foundFile);
                  console.log(`✅ Arquivo encontrado por padrão: ${foundFile}`);
                }
              }
            }

            if (fs.existsSync(mediaPath)) {
              const ext = path.extname(mediaPath).toLowerCase();
              if (ext === '.mp4') {
                return await ctx.replyWithVideo({ source: mediaPath }, { caption: bumpMsg, parse_mode: 'Markdown', ...Markup.inlineKeyboard(bumpButtons) });
              } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                return await ctx.replyWithPhoto({ source: mediaPath }, { caption: bumpMsg, parse_mode: 'Markdown', ...Markup.inlineKeyboard(bumpButtons) });
              } else {
                return await ctx.replyWithAnimation({ source: mediaPath }, { caption: bumpMsg, parse_mode: 'Markdown', ...Markup.inlineKeyboard(bumpButtons) });
              }
            }
          } catch (e) { console.error('🔴 Erro na mídia global:', e.message); }
        }
        return await ctx.reply(bumpMsg, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(bumpButtons) });
      }

      await handlePaymentScreen(ctx, plan, useConfig);
    } catch (err) {
      console.error(`Erro: ${err.message}`);
      await ctx.answerCbQuery('Erro ao processar.').catch(() => {});
    }
  }

  bot.action(/^buy_([0-9a-zA-Z-]+)$/, async (ctx) => {
    const planId = ctx.match[1];
    const freshConfig = await Config.findByPk(config.id);
    const useConfig = freshConfig || config;
    const extras = useConfig.editBotExtras || {};
    const bumpEnabled = extras.orderBumpEnabled === true || extras.orderBumpEnabled === 'true' || extras.orderBumpEnabled === 1 || extras.orderBumpActive === true || extras.orderBumpActive === 'true' || extras.order_bump_active === true || extras.order_bump_active === 'true' || extras.bumpEnabled === true || extras.bumpEnabled === 'true';

    if (bumpEnabled) return handleCheckUpsell(ctx, planId);

    const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    let plan = isUUID(planId) ? await Plan.findByPk(planId) : null;
    if (!plan) {
      const allItems = [...(useConfig.subscriptionItems || []), ...(useConfig.packageItems || [])];
      const item = allItems.find(i => String(i.id) === String(planId));
      if (item) {
        plan = { 
          id: item.id, 
          name: item.name, 
          price: parsePrice(item.price || item.value || 0), 
          durationDays: Number(item.durationDays || item.time || 0),
          ...item 
        };
      }
    }

    if (!plan) return ctx.answerCbQuery('Erro ao localizar plano.');

    // VERIFICA SE O PLANO ESPECÍFICO TEM BUMP
    const planBumpEnabled = plan.orderBumpEnabled === true || plan.orderBumpEnabled === 'true' || plan.orderBumpEnabled === 1;

    if (planBumpEnabled) {
      console.log(`🚀 [${useConfig.botUsername}] Order Bump Detectado no Plano: ${plan.name} (Gatilho Inicial)`);
      return handleCheckUpsell(ctx, planId);
    }

    let msg = extras.pixMethodMessage || `🌟 *Plano selecionado:* {plan_name}\n🎁 *Plano:* {plan_name}\n💰 *Valor:* {plan_value}\n⌛ *Duração:* {plan_duration}\n\nEscolha o método de pagamento abaixo:`;
    msg = msg.replace(/{plan_name}/g, plan.name).replace(/{plan_value}/g, plan.price.toFixed(2).replace('.', ',')).replace(/{plan_duration}/g, plan.durationDays > 0 ? (plan.durationDays + ' dias') : 'Vitalício');
    
    const animation = useConfig.editBotExtras?.upsellMediaName || useConfig.mediaFileName;
    const keyboard = Markup.inlineKeyboard([[Markup.button.callback(extras.pixButtonText || '💠 Pagar com Pix', `check_upsell_${plan.id}`)]]);

    if (animation) {
      try {
        const mediaPath = path.resolve(__dirname, `../../../frontend-admin/public/uploads/${animation}`);
        if (fs.existsSync(mediaPath)) { return await ctx.replyWithAnimation({ source: mediaPath }, { caption: msg, parse_mode: 'Markdown', ...keyboard }); }
      } catch (e) {}
    }
    await ctx.reply(msg, { parse_mode: 'Markdown', ...keyboard });
  });

  bot.action([/^check_upsell_([0-9a-zA-Z-]+)$/, /^generate_pix_([0-9a-zA-Z-]+)$/], async (ctx) => {
    return handleCheckUpsell(ctx, ctx.match[1]);
  });

  bot.action(/^pay_bump_([0-9a-zA-Z-]+)$/, async (ctx) => {
    const planId = ctx.match[1];
    const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const freshConfig = await Config.findByPk(config.id);
    const useConfig = freshConfig || config;
    let plan = isUUID(planId) ? await Plan.findByPk(planId) : null;
    if (!plan) {
      const allItems = [...(useConfig.subscriptionItems || []), ...(useConfig.packageItems || [])];
      const item = allItems.find(i => String(i.id) === String(planId));
      if (item) {
        plan = { 
          ...item,
          id: item.id, 
          name: item.name, 
          price: parsePrice(item.price || item.value || 0)
        };
      }
    }
    if (plan) {
      const bumpPrice = parsePrice(plan.orderBumpValue || "4.90");
      const totalPrice = Number(plan.price) + Number(bumpPrice);
      await ctx.answerCbQuery('💎 Oferta aceita! Gerando PIX...').catch(() => {});
      await handlePaymentScreen(ctx, plan, useConfig, totalPrice);
    }
  });

  bot.action(/^pay_([0-9a-zA-Z-]+)$/, async (ctx) => {
    const planId = ctx.match[1];
    const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const freshConfig = await Config.findByPk(config.id);
    const useConfig = freshConfig || config;
    let plan = isUUID(planId) ? await Plan.findByPk(planId) : null;
    if (!plan) {
      const allItems = [...(useConfig.subscriptionItems || []), ...(useConfig.packageItems || [])];
      const item = allItems.find(i => String(i.id) === String(planId));
      if (item) {
        plan = { 
          ...item,
          id: item.id, 
          name: item.name, 
          price: parsePrice(item.price || item.value || 0)
        };
      }
    }
    if (plan) {
      await ctx.answerCbQuery(useConfig.editBotExtras?.paymentGeneratingText || '⌛ Gerando pagamento...').catch(() => {});
      await handlePaymentScreen(ctx, plan, useConfig);
    }
    ctx.answerCbQuery().catch(() => {});
  });

  async function handlePaymentScreen(ctx, plan, config, amountOverride = null) {
    const user = await User.findOne({ where: { telegramId: String(ctx.from.id) } });
    const finalAmount = amountOverride || plan.price;
    const payment = await PaymentService.createPixPayment(user.id, plan.id, finalAmount);
    const extras = config.editBotExtras || {};
    
    let fullCaption = `🌟 Você selecionou o seguinte plano:\n\n🎁 *Plano:* ${plan.name}${amountOverride ? ' + Oferta Especial' : ''}\n💰 *Valor:* R$${finalAmount.toFixed(2).replace('.', ',')}\n\n💠 Pague via Pix Copia e Cola:\n\n\`${payment.qrCode}\`\n\n👆 Toque na chave PIX acima para copiá-la\n\n‼️ Após o pagamento, clique no botão abaixo para verificar o status:`;
    const paymentKeyboard = [[Markup.button.callback(extras.pixStatusButtonText || 'Verificar Status do Pagamento ✅', `check_status_${payment.id}`)], [Markup.button.callback(extras.pixCopyButtonText || 'Copiar Chave Pix 📋', `copy_pix_${payment.id}`)]];
    try {
      const qrBuffer = await QRCode.toBuffer(payment.qrCode);
      await ctx.replyWithPhoto({ source: qrBuffer }, { caption: fullCaption, parse_mode: 'Markdown', ...Markup.inlineKeyboard(paymentKeyboard) });
    } catch (e) {
      await ctx.reply(fullCaption, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(paymentKeyboard) });
    }
  }

  bot.action(/^copy_pix_(.+)$/, async (ctx) => {
    const payment = await Payment.findByPk(ctx.match[1]);
    if (payment) { 
      await ctx.reply(`\`${payment.qrCode}\``, { parse_mode: 'Markdown' });
      await ctx.reply('✅ *Chave PIX enviada acima!*');
    }
    ctx.answerCbQuery().catch(() => {});
  });

  bot.action(/^check_status_(.+)$/, async (ctx) => {
    const payment = await Payment.findByPk(ctx.match[1]);
    if (payment && payment.status === 'approved') { await ctx.reply('✅ *Pagamento Confirmado!*'); }
    else { await ctx.answerCbQuery('Pagamento ainda pendente.').catch(() => {}); }
  });

  bot.action(/^cancel_([0-9a-zA-Z-]+)$/, async (ctx) => {
    await ctx.reply('Sua compra foi cancelada.');
    ctx.answerCbQuery();
  });

  return bot;
}

module.exports = { createBot };
