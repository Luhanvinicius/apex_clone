const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Config = sequelize.define('Config', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  botToken: { type: DataTypes.STRING },
  botUsername: { type: DataTypes.STRING },
  botExternalId: { 
    type: DataTypes.STRING, 
    defaultValue: () => Math.floor(10000 + Math.random() * 90000).toString() 
  },
  antiClone: { type: DataTypes.BOOLEAN, defaultValue: false },
  startOnAnyText: { type: DataTypes.BOOLEAN, defaultValue: false },
  welcomeMessage: {
    type: DataTypes.TEXT,
    defaultValue: 'Welcome to our VIP Bot! Please select a plan:'
  },
  expiredMessage: {
    type: DataTypes.TEXT,
    defaultValue: 'Your subscription has expired. Please renew.'
  },
  reminderMessage: {
    type: DataTypes.TEXT,
    defaultValue: 'Your subscription is expiring soon!'
  },
  vipGroupId: {
    type: DataTypes.STRING
  },
  upsellEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  upsellMessage: { type: DataTypes.TEXT, defaultValue: '🔥 *ESPERE! MEGA OFERTA* 🔥\n\nPor apenas **R$ {diff}** a mais, você pode levar o plano *{plan_name}* (R$ {plan_price}) e ter muito mais tempo e vantagens no VIP!\n\nDeseja aproveitar esse UPGRADE agora?' },
  downsellEnabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  downsellMessage: { type: DataTypes.TEXT, defaultValue: '😔 *Poxa, ficou pesado para você?*\n\nNão queremos que você fique de fora do nosso VIP! Que tal tentar o nosso plano mais básico, o *{plan_name}*, por apenas **R$ {plan_price}**?\n\nÉ a sua última chance de entrar no grupo!' },
  profileName: { type: DataTypes.STRING },
  profileBio: { type: DataTypes.TEXT },
  profileShortMessage: { type: DataTypes.STRING },
  profileImageName: { type: DataTypes.STRING },
  shareKey: { type: DataTypes.STRING },
  configKey: { type: DataTypes.STRING },
  configPublic: { type: DataTypes.BOOLEAN, defaultValue: false },

  // Novas configurações do Frontend
  downsellMessages: { type: DataTypes.JSONB, defaultValue: [] },
  upsellMessages: { type: DataTypes.JSONB, defaultValue: [] },
  upsellSendMode: { type: DataTypes.STRING },
  saleCodesRestricted: { type: DataTypes.BOOLEAN, defaultValue: false },
  allowedSaleCodes: { type: DataTypes.JSONB, defaultValue: [] },
  editBotExtras: { type: DataTypes.JSONB, defaultValue: {} },
  subscriptionItems: { type: DataTypes.JSONB, defaultValue: [] },
  packageItems: { type: DataTypes.JSONB, defaultValue: [] },
  customButtonItems: { type: DataTypes.JSONB, defaultValue: [] },
  vipButtonItems: { type: DataTypes.JSONB, defaultValue: [] },
  socialProofItems: { type: DataTypes.JSONB, defaultValue: [] },
  autoApprovalEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  autoApprovalChannels: { type: DataTypes.JSONB, defaultValue: [] },
  leadCaptureEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  leadCaptureMoment: { type: DataTypes.STRING },
  leadCaptureBeforeText: { type: DataTypes.TEXT },
  leadCaptureAfterText: { type: DataTypes.TEXT },
  leadCaptureErrorText: { type: DataTypes.TEXT },
  leadCaptureButtonText: { type: DataTypes.STRING },
  leadCaptureMediaName: { type: DataTypes.STRING },
  leadCaptureAudioName: { type: DataTypes.STRING },
  paymentGateways: { type: DataTypes.JSONB, defaultValue: [] },
  paymentRouting: { type: DataTypes.JSONB, defaultValue: [] }
});

module.exports = Config;
