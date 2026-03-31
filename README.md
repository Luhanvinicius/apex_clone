# SaaS Telegram VIP Bot & Admin Panel

🚀 **Sistema Completo de Automação para Telegram (Vendas de Grupos/Canais VIP)**

Este projeto contém a estrutura completa do sistema, contendo o Bot do Telegram e um Painel Web. Foi adaptado para **rodar nativamente sem Docker**, utilizando o PM2.

## 📂 Estrutura do Projeto

- `/backend-bot/`: Backend em Node.js (Express, Sequelize, Telegraf). Lida com a API do robô, banco de dados (PostgreSQL), webhooks e automações (Cron Jobs).
- `/frontend-admin/`: Painel web em Next.js e TailwindCSS para gerenciar vendas, usuários, planos e interface do bot.
- `ecosystem.config.js`: Arquivo para rodar ambos os sistemas simultaneamente em background com o PM2.

## 🛠️ Requisitos Prévios

- **Node.js**: Instalado (versão 18+ recomendada)
- **PostgreSQL**: Instalado nativamente na máquina com um banco criado.
- **PM2**: Instalador global no Node (`npm install -g pm2`)

## ⚡ Passo a Passo para Instalação e Execução

### 1. Configurar o Backend (Bot)
Abra um terminal, acesse a pasta `backend-bot` e instale os pacotes:
```bash
cd backend-bot
npm install
```

Crie (ou edite) o arquivo `.env` dentro de `backend-bot` com os dados do seu bot:
```env
BOT_TOKEN=SEU_TOKEN_DO_BOTFATHER
PORT=5001
VIP_GROUP_ID=-100000000000
```
*O Sequelize usa as variáveis `DB_*` do `.env` para conectar no PostgreSQL.*

### 2. Configurar o Frontend (Painel Web)
Em outro terminal (ou retorne para a pasta principal), acesse a pasta `frontend-admin` e faça a instalação e build:
```bash
cd frontend-admin
npm install
npm run build
```

### 3. Rodando tudo com o PM2 (Recomendado para Produção/VPS)
Na pasta principal do projeto do projeto (onde está o arquivo `ecosystem.config.js`), execute o PM2 para iniciar os dois projetos de uma vez em background:

```bash
npm install -g pm2        # Se ainda não instalou o PM2
pm2 start ecosystem.config.js
```

Para visualizar os logs e verificar se está rodando:
```bash
pm2 logs
pm2 monit
```

**Para salvar os processos de serem interrompidos se o servidor reiniciar:**
```bash
pm2 save
pm2 startup
```

## 🌐 Acessos

- **Painel Administrativo:** `http://localhost:3000` ou `http://IP_DA_VPS:3000`
- **Bot no Telegram:** @SeuBot

No Painel, você criará os Planos, definirá textos de Boas Vindas e os Usuários poderão comprar iniciando a conversa com o bot enviando `/start`.

## 🧪 Teste real com Telegram

Para teste completo com token real do BotFather e criação de admin inicial, siga:

- `documentacao/teste-real-telegram.md`
