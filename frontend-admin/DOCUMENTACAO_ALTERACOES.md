# Documentação de Alterações (Frontend + Integração Account)

Este documento resume tudo que foi alterado para o clone do Apex, com foco em layout e integração sem quebrar a estrutura atual do backend.

## 1) Arquivos alterados

### Frontend
- `frontend-admin/src/app/layout.js`
- `frontend-admin/src/app/support/page.js`
- `frontend-admin/src/app/account/page.js`
- `frontend-admin/src/app/payments/page.js`

### Backend
- `backend-bot/src/routes/api.js`
- `backend-bot/src/models/Admin.js`
- `backend-bot/src/config/database.js`
- `backend-bot/create-db.js`
- `backend-bot/.env.example`

---

## 2) O que foi alterado no frontend

## `layout.js`
- Header superior (pesquisa/sino/avatar) agora pode ser ocultado por rota.
- Rotas com header oculto: `/support`, `/account` e `/payments`.
- Fundo dessas rotas ficou mais escuro para aproximar do visual oficial.
- Logo do menu lateral foi centralizada.

## `/support`
- Layout refeito para ficar mais próximo do Apex oficial:
  - card central com fundo dark e borda suave,
  - tipografia ajustada,
  - botões e ícones sociais no estilo oficial,
  - comportamento responsivo melhorado.

## `/account`
- Página refeita com 3 abas:
  - **Configurações**
  - **Sessões**
  - **Contas**
- **Configurações**:
  - edição de dados pessoais (nome, email, telefone),
  - blocos de segurança, ranking e notificações,
  - toggles corrigidos (bolinha/track).
- **Sessões**:
  - lista de sessões ativas,
  - botão `DESLOGAR` por sessão,
  - botão `Deslogar Todas as Sessões`.
- **Contas**:
  - lista de contas vinculadas,
  - botão `Adicionar Nova Conta`.

## `/payments`
- Página refeita no padrão visual oficial com abas:
  - **Roteamento**
  - **Integrações**
- O `Clique aqui` no card de roteamento alterna para aba de integrações.
- Cards de integração com links externos configurados:
  - Pushinpay (tutorial + cadastro)
  - Syncpay (cadastro + WhatsApp de taxa 0,35)
  - Wiinpay (cadastro + WhatsApp de taxa 4,50)
- Ajustes responsivos para evitar quebra agressiva de texto em resoluções menores.

---

## 3) O que foi alterado no backend (integração da conta)

## `Admin` model
- Novos campos para perfil:
  - `displayName`
  - `fullName`
  - `email`
  - `phone`
  - `accountSettings` (JSONB)

## Endpoints novos
- `GET /api/account` (autenticado por token JWT)
  - retorna payload completo de conta:
    - `profile`
    - `preferences`
    - `sessions`
    - `accounts`
- `PUT /api/account` (autenticado por token JWT)
  - salva alterações de perfil e preferências
  - atualiza sessões/contas
  - responde com payload normalizado.

## Dados exibidos via backend
- `activeBots` vem do `Config.count()` (quantidade real de bots no banco).
- `memberSince` vem de `admin.createdAt`.
- Preferências/sessões/contas persistem em `admin.accountSettings`.

---

## 4) Fluxo de persistência (sem quebrar estrutura)

- O frontend tenta sempre salvar/ler via API `/api/account`.
- Se backend indisponível momentaneamente, mantém fallback local para não travar interface.
- A automação existente de bots, planos, stats e outras rotas não foi removida.
- A autenticação continua baseada em `apex_token` (login existente).

---

## 5) Como rodar local (backend + frontend)

## 5.1 Backend
```bash
cd /Users/alexsandro/Documents/GitHub/apex_clone/backend-bot
cp .env.example .env
npm install
npm run db:create
npm run dev
```

## 5.2 Frontend
```bash
cd /Users/alexsandro/Documents/GitHub/apex_clone/frontend-admin
npm install
npm run dev
```

---

## 6) Erros comuns e solução

## Erro 1: `zsh: unknown file attribute: b`
Isso acontece quando você cola texto com comentário tipo:
```bash
# Terminal 1 (backend)
```
No seu shell atual, esse texto foi interpretado como comando.  
**Solução:** execute só os comandos (sem a linha comentada) ou abra aspas.

## Erro 2: `SequelizeConnectionRefusedError (ECONNREFUSED)`
Significa que o PostgreSQL não está aceitando conexão em `localhost:5432`.

### Opção rápida com Docker (recomendado)
```bash
docker run --name apex-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=2026 \
  -e POSTGRES_DB=telegram_vip \
  -p 5432:5432 \
  -d postgres:16
```

Depois rode:
```bash
cd /Users/alexsandro/Documents/GitHub/apex_clone/backend-bot
npm run db:create
npm run dev
```

Se o container já existir:
```bash
docker start apex-postgres
```

---

## 7) Checklist para outro desenvolvedor

- Subir PostgreSQL local (ou Docker) antes do backend.
- Confirmar `.env` com credenciais do banco.
- Rodar backend em `:5001`.
- Rodar frontend em `:3000`.
- Fazer login para gerar `apex_token`.
- Validar página `/account` nas 3 abas e salvar alterações.

---

## 8) Backend (separado) — ajustes feitos para rodar local

### Objetivo
Permitir que o backend suba localmente com PostgreSQL e entregue dados para as páginas que dependem da API (`/account`, `/stats`, `/payments`, etc.), sem remover a estrutura existente.

### Mudanças aplicadas no backend
- `backend-bot/src/config/database.js`  
  Conexão do Sequelize padronizada para ler `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` do `.env` (com fallback seguro).
- `backend-bot/create-db.js`  
  Script de criação do banco ajustado para usar as mesmas variáveis de ambiente, evitando divergência entre script e app.
- `backend-bot/.env.example`  
  Template completo com variáveis mínimas para subir local: `PORT`, `JWT_SECRET`, bloco de `DB_*`, `BOT_TOKEN`, `VIP_GROUP_ID`.
- `backend-bot/src/routes/api.js` e `backend-bot/src/models/Admin.js`  
  Endpoints e campos necessários para a página de conta (`GET/PUT /api/account`) e persistência de preferências/sessões/contas.

### Ponto importante de ambiente local (macOS)
- Porta `5000` estava ocupada por processo do sistema (`ControlCenter/AirPlay`), então o projeto local foi alinhado para `PORT=5001`.
- Por isso o frontend também foi alinhado para consumir a API em `http://localhost:5001`.

### Como validar que backend está pronto
1. Subir PostgreSQL local.
2. Rodar:
   ```bash
   cd /Users/alexsandro/Documents/GitHub/apex_clone/backend-bot
   npm install
   npm run db:create
   npm run dev
   ```
3. Confirmar no terminal:
   - `PostgreSQL connected and tables synced`
   - `API Apex Online port 5001`
