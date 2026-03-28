const axios = require('axios');
const { Payment, Plan, User } = require('../models');
const crypto = require('crypto');
const TelegramService = require('./TelegramService');

class PaymentService {
  static async createPixPayment(userId, planId, amount) {
    try {
      const user = await User.findByPk(userId);
      const email = user.email || 'user@email.com'; 

      // Config payload exactly as the documentation says
      const payload = {
        api_key: process.env.WIINPAY_API_KEY || 'CHAVE_API_Vazia',
        value: amount,
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

        const payment = await Payment.create({
          userId,
          planId,
          amount,
          method: 'pix',
          externalReference: externalId, 
          qrCode: qrCodeText,
          expireAt: new Date(Date.now() + 30 * 60000) // 30 mins
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
      const user = await User.findByPk(payment.userId);
      const plan = await Plan.findByPk(payment.planId);

      user.status = 'active';
      user.planId = plan.id;
      user.subscriptionStart = new Date();
      if (plan.durationDays > 0) {
        user.subscriptionEnd = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
      } else {
        user.subscriptionEnd = null; // Vitalício
      }
      await user.save();

      // Atribuição de Conversão (Marketing)
      if (user.sourceUtm) {
        const { Source } = require('../models');
        const source = await Source.findOne({ where: { utm: user.sourceUtm } });
        if (source) await source.increment('conversions');
      }

      const inviteLink = await TelegramService.getInviteLink(process.env.VIP_GROUP_ID, botInstance);
      botInstance.telegram.sendMessage(
        user.telegramId, 
        `✅ *Pagamento Aprovado!*\nO plano ${plan.name} foi validado pela Wiinpay.\n\nSeja bem-vindo ao VIP! Clique no link abaixo e entre no clã:\n\n${inviteLink}`,
        { parse_mode: 'Markdown' }
      );
    }
  }
}

module.exports = PaymentService;
