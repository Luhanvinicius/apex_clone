const cron = require('node-cron');
const { Op } = require('sequelize');
const { User, Config } = require('../models');
const TelegramService = require('../services/TelegramService');
const bot = require('../bot/index');

function startCronJobs() {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cron job for expired subscriptions...');
    const now = new Date();
    
    // Find expired
    const expiredUsers = await User.findAll({
      where: {
        status: 'active',
        subscriptionEnd: {
          [Op.lt]: now
        }
      }
    });
    
    let config = await Config.findOne();
    if (!config) config = await Config.create({});

    for (const user of expiredUsers) {
      user.status = 'expired';
      await user.save();
      
      await TelegramService.kickUser(process.env.VIP_GROUP_ID, user.telegramId, bot);
      
      bot.telegram.sendMessage(user.telegramId, config.expiredMessage || 'Sua assinatura expirou. Você foi removido do grupo VIP. Renove agora para voltar!');
    }
  });

  cron.schedule('0 12 * * *', async () => {
    console.log('Running daily reminder cron...');
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const usersToRemind = await User.findAll({
      where: {
        status: 'active',
        subscriptionEnd: {
          [Op.gt]: now,
          [Op.lt]: threeDaysFromNow
        },
        notifiedExpiration: false
      }
    });

    let config = await Config.findOne();
    if (!config) config = await Config.create({});

    for (const user of usersToRemind) {
      user.notifiedExpiration = true;
      await user.save();
      
      bot.telegram.sendMessage(user.telegramId, config.reminderMessage || 'Atenção! Sua assinatura expira em 3 dias. Renove para não perder o acesso!');
    }
  });
}

module.exports = { startCronJobs };
