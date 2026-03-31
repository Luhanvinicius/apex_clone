# Guia de teste real com Telegram (sem alterar endpoints)

Este passo a passo usa **somente a estrutura já existente** do backend.

## 1) Pré-checagem rápida

No backend, valide conexão com banco e quantidades atuais:

```bash
cd backend-bot
node -e "require('dotenv').config(); const {sequelize, Admin, Config}=require('./src/models'); (async()=>{try{await sequelize.authenticate(); console.log('admins=', await Admin.count(), 'bots=', await Config.count());}finally{await sequelize.close();}})();"
```

Se `admins=0`, você precisará criar o admin inicial no passo 5.

## 2) Configurar `.env` do backend

Arquivo: `backend-bot/.env`

Use valores reais:

```env
PORT=5001
JWT_SECRET=COLOQUE_UMA_CHAVE_FORTE

DB_HOST=localhost
DB_PORT=5432
DB_NAME=telegram_vip
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_POSTGRES

BOT_TOKEN=TOKEN_REAL_DO_BOTFATHER
VIP_GROUP_ID=-100XXXXXXXXXX

WIINPAY_API_KEY=SUA_CHAVE_WIINPAY
WEBHOOK_URL=https://seu-dominio.com/api/webhooks/payment?botId=ID_DO_BOT
```

Observações:
- `BOT_TOKEN` é fallback global; no painel, cada bot também salva seu próprio token em `Config`.
- `VIP_GROUP_ID` precisa ser o ID real do grupo/canal VIP.
- Para checkout real, `WIINPAY_API_KEY` e `WEBHOOK_URL` são necessários.

## 3) Criar banco (se ainda não existir)

```bash
cd backend-bot
npm run db:create
```

## 4) Subir backend e frontend

Terminal 1:

```bash
cd backend-bot
npm install
npm start
```

Terminal 2:

```bash
cd frontend-admin
npm install
npm run dev
```

Painel: `http://localhost:3000`

## 5) Criar admin inicial (ou usar conta existente)

### Se for primeiro acesso (sem admin)
- Abra: `http://localhost:3000/setup`
- Cadastre usuário e senha.
- Depois faça login em `http://localhost:3000/login`.

Alternativa via API (sem UI):

```bash
curl -X POST http://localhost:5001/api/register-initial \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_root","password":"SENHA_FORTE"}'
```

### Se já existir admin
- Vá direto para `http://localhost:3000/login`.
- Use o usuário/senha já cadastrados.

## 6) Criar bot real no Telegram (BotFather)

No Telegram com o `@BotFather`:
- `/newbot`
- Defina nome e username (terminando com `bot`).
- Copie o token gerado.

Recomendado:
- `/setdescription`
- `/setuserpic`
- `/setcommands`

## 7) Cadastrar o token no painel

- No painel, acesse `Criar Bot`.
- Cole o token real do BotFather.
- Salve.

Se já tiver bots de teste antigos, você pode excluí-los no painel para evitar tentativa de inicialização com token inválido.

## 8) Configurar grupo VIP

- Adicione o bot no grupo/canal VIP.
- Promova como admin com permissão de convite.
- Descubra o `chat_id` (grupo costuma começar com `-100`).
- Salve o `VIP_GROUP_ID` no `.env` (e/ou no campo de configuração do bot, conforme seu fluxo).

## 9) Teste funcional mínimo

1. No Telegram, envie `/start` para o bot.  
2. Verifique se usuário é criado no sistema.  
3. Crie 1 plano no painel.  
4. Clique para comprar no bot (fluxo PIX).  
5. Simule/receba webhook de pagamento aprovado.  
6. Verifique ativação do usuário e envio de link VIP.

## 10) Checklist de diagnóstico

- Login falha: confirme se existe admin no banco.
- Bot não inicia: token inválido ou revogado.
- Convite VIP não funciona: bot sem permissão no grupo/canal.
- PIX não gera: `WIINPAY_API_KEY` ausente/inválida.
- Webhook não aprova: `WEBHOOK_URL` incorreta ou sem `botId`.

### Erro PostgreSQL `out of shared memory`

Se aparecer esse erro durante `sequelize.sync({ alter: true })`, use uma destas opções:

1. Criar um banco limpo para teste (recomendado para homologação local):

```bash
cd backend-bot
DB_NAME=telegram_vip_realtest npm run db:create
DB_NAME=telegram_vip_realtest npm start
```

2. Ajustar parâmetros do PostgreSQL (`max_locks_per_transaction`) e reiniciar o serviço.
