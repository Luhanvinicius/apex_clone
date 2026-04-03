const axios = require('axios');
const { Payment, Plan, User, Activity } = require('../models');
const crypto = require('crypto');
const TelegramService = require('./TelegramService');

class PaymentService {
  static async createPixPayment(userId, planId, amount) {
    try {
      const user = await User.findByPk(userId, { include: ['config'] });
      const config = user.config;
      const email = user.email || 'user@email.com'; 

      // Find Wiinpay key in bot config first, fallback to .env
      const wiinpayConfig = config?.paymentGateways?.find(g => g.id === 'wiinpay');
      const apiKey = wiinpayConfig?.apiKey || process.env.WIINPAY_API_KEY || 'CHAVE_API_Vazia';

      // Config payload exactly as the documentation says
      const payload = {
        api_key: apiKey,
        value: Math.round(amount * 100),
        name: user.firstName + (user.lastName ? ' ' + user.lastName : ''),
        email: email,
        description: 'Assinatura VIP Telegram',
        webhook_url: process.env.WEBHOOK_URL || 'https://seu-dominio.com/api/webhooks/payment',
        metadata: {
          userId: userId,
          planId: planId
        }
      };

      try {
        const response = await axios.post('https://api-v2.wiinpay.com.br/payment/create', payload);
        const wiinpayRes = response.data;
        
        // Vamos varrer os locais mais comuns que gateways escondem o QR Code
        let qrCodeText = wiinpayRes.qrcode || wiinpayRes.qr_code || wiinpayRes.pix_key || wiinpayRes.copiaECola || wiinpayRes.payload;
        
        // Se a Wiinpay envelopar em um objeto "data":
        if (!qrCodeText && wiinpayRes.data) {
          qrCodeText = wiinpayRes.data.qrcode || wiinpayRes.data.qr_code || wiinpayRes.data.pix_key || wiinpayRes.data.copiaECola || wiinpayRes.data.payload;
        }

        // Modo Depuração: Se ainda assim vier vazio, vamos jogar o JSON puro no Telegram pra você bater o print pra mim!
        if (!qrCodeText) {
          qrCodeText = 'DEBUG_JSON: ' + JSON.stringify(wiinpayRes);
        }

        let externalId = wiinpayRes.paymentId || wiinpayRes.id;
        if (!externalId && wiinpayRes.data) {
          externalId = wiinpayRes.data.paymentId || wiinpayRes.data.id;
        }
        externalId = String(externalId || `WIIN-${Date.now()}`);

        const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

        const payment = await Payment.create({
          userId,
          planId: isUUID(planId) ? planId : null,
          dynamicPlanId: !isUUID(planId) ? planId : null,
          amount,
          method: 'pix',
          configId: user.configId,
          externalReference: externalId, 
          qrCode: qrCodeText,
          expireAt: new Date(Date.now() + 30 * 60000) // 30 mins
        });

        await Activity.create({
          configId: user.configId,
          type: 'payment_created',
          message: `Gerou PIX de R$ ${amount.toFixed(2)} - ${user.firstName}`,
          metadata: { userId, planId, amount }
        });

        return payment;

      } catch (axErr) {
        console.error('🔴 Erro na API Wiinpay:', axErr.response?.data || axErr.message);
        throw new Error('Falha ao gerar o PIX oficial na Wiinpay');
      }

    } catch (e) {
      console.error('Falha crítica ao gerar PIX (Produção):', e.message);
      throw new Error('Não foi possível gerar a cobrança PIX real.');
    }
  }

  static async processWebhook(data, botInstance) {
    // A Wiinpay vai disparar o POST com o status indicando "PAID". Vamos mapear
    const pId = data.paymentId || data.id || data.payment_id;
    const statusResult = (data.status || data.state || '').toUpperCase();

    // Buscando a ordem dentro do nosso banco referenciando a externa ou o PK simulado
    let payment = await Payment.findOne({ where: { externalReference: String(pId) }, include: ['user', 'plan'] });
    
    // Se não achou na referência externa, procura na ID local do node (em casos do webhook passar nosso dev ID)
    if (!payment) {
      payment = await Payment.findByPk(pId, { include: ['user', 'plan'] });
    }

    if (!payment) throw new Error(`Pagamento ${pId} não foi encontrado no nosso banco.`);

    // A regra oficial de webhook PAID solicitada
    if (payment.status === 'pending') {
      payment.status = 'approved';
      await payment.save();

      // Ativando usuário
      const user = await User.findByPk(payment.userId, { include: ['config'] });
      let plan;
      let durationDays = 0;

      if (payment.planId) {
        plan = await Plan.findByPk(payment.planId);
        durationDays = plan?.durationDays || 0;
      } else if (payment.dynamicPlanId && user.config) {
        // Buscamos o plano dentro do JSON de assinaturas ou pacotes
        const allItems = [
          ...(user.config.subscriptionItems || []),
          ...(user.config.packageItems || [])
        ];
        const dynamicPlan = allItems.find(i => String(i.id) === String(payment.dynamicPlanId));
        if (dynamicPlan) {
          plan = { 
            id: dynamicPlan.id, 
            name: dynamicPlan.name, 
            deliverables: dynamicPlan.deliverables 
          };
          // Se for uma assinatura, tenta converter a string de duração (ex: "30 dias") pra número
          if (dynamicPlan.duration) {
            durationDays = parseInt(dynamicPlan.duration) || 0;
          }
        }
      }

      if (!plan) throw new Error("Plano de pagamento não pôde ser identificado.");

      user.status = 'active';
      user.planId = payment.planId || null; // Só salva se for UUID real
      user.subscriptionStart = new Date();
      if (durationDays > 0) {
        user.subscriptionEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      } else {
        user.subscriptionEnd = null; // Vitalício (Geralmente pacotes)
      }
      await user.save();

      // Atribuição de Conversão (Marketing)
      if (user.sourceUtm) {
        const { Source } = require('../models');
        const source = await Source.findOne({ where: { utm: user.sourceUtm } });
        if (source) await source.increment('conversions');
      }

      await Activity.create({
        configId: user.configId,
        type: 'payment_approved',
        message: `Pagamento Aprovado! R$ ${payment.amount.toFixed(2)} - ${user.firstName}`,
        metadata: { userId: user.id, amount: payment.amount }
      });

      const inviteLink = await TelegramService.getInviteLink(botInstance?.config?.vipGroupId || process.env.VIP_GROUP_ID, botInstance);
      if (botInstance) {
        botInstance.telegram.sendMessage(
          user.telegramId, 
          `✅ *Pagamento Aprovado!*\nO plano ${plan.name} foi validado pela Wiinpay.\n\nSeja bem-vindo ao VIP! Clique no link abaixo e entre no clã:\n\n${inviteLink}`,
          { parse_mode: 'Markdown' }
        );
      }
    }
  }
}

module.exports = PaymentService;
