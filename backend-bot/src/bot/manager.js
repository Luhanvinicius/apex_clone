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
      this.bots.set(config.id, bot);
      bot.launch()
        .then(() => {
          console.log(`✅ Bot [${config.botUsername}] iniciado com sucesso!`);
        })
        .catch((err) => {
          this.bots.delete(config.id);
          console.error(`❌ Falha ao iniciar Bot [${config.botUsername}]:`, err.message);
        });
    } catch (err) {
      console.error(`❌ Falha ao iniciar Bot [${config.botUsername}]:`, err.message);
    }
  }

  async stopBot(id) {
    const bot = this.bots.get(id);
    if (bot) {
      try {
        await bot.stop(`stop:${id}`);
      } catch (err) {
        console.error(`⚠️ Falha ao parar Bot [${id}]:`, err.message);
      }
      this.bots.delete(id);
      console.log(`🛑 Bot [${id}] parado.`);
    }
  }

  async stopAll(reason = 'shutdown') {
    const entries = Array.from(this.bots.entries());
    for (const [id, bot] of entries) {
      try {
        await bot.stop(reason);
        console.log(`🛑 Bot [${id}] parado (${reason}).`);
      } catch (err) {
        console.error(`⚠️ Falha ao parar Bot [${id}] durante ${reason}:`, err.message);
      } finally {
        this.bots.delete(id);
      }
    }
  }

  async reloadBot(config) {
    if (!config?.id) {
      console.log('⚠️ reloadBot ignorado: config ausente ou inválida.');
      return null;
    }
    await this.stopBot(config.id);
    await this.startBot(config);
    return config;
  }
}

module.exports = new BotManager();
