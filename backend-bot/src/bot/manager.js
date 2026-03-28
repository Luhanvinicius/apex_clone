const { Config } = require('../models');
const { createBot } = require('./index');

class BotManager {
  constructor() {
    this.bots = new Map();
  }

  async init() {
    console.log('🔄 Sincronizando Frota de Bots...');
    const configs = await Config.findAll();
    console.log(`📊 Total de Bots encontrados no Banco: ${configs.length}`);
    
    if (configs.length === 0) {
      console.log('ℹ️ Nenhum bot cadastrado. Aguardando primeira criação...');
      return;
    }

    for (const config of configs) {
      if (config.botToken) {
        await this.startBot(config);
      }
    }
  }

  async startBot(config) {
    if (this.bots.has(config.id)) {
      console.log(`⚠️ Bot ${config.botUsername} já está em execução.`);
      return;
    }

    try {
      const bot = createBot(config);
      // Removed await to keep the initialization non-blocking
      bot.launch();
      this.bots.set(config.id, bot);
      console.log(`✅ Bot [${config.botUsername}] iniciado com sucesso!`);
    } catch (err) {
      console.error(`❌ Falha ao iniciar Bot [${config.botUsername}]:`, err.message);
    }
  }

  async stopBot(id) {
    const bot = this.bots.get(id);
    if (bot) {
      await bot.stop();
      this.bots.delete(id);
      console.log(`🛑 Bot [${id}] parado.`);
    }
  }

  async reloadBot(config) {
    await this.stopBot(config.id);
    await this.startBot(config);
  }
}

module.exports = new BotManager();
