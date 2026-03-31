# Backend: Config / Perfil / Share Key / Config Key

Este documento descreve as alterações realizadas no backend para suportar **Perfil do Bot**, **Share Key** e **Config Key** sem quebrar a estrutura existente.

## 1) Novos campos na tabela `Config`
Arquivo: `backend-bot/src/models/Config.js`

Campos adicionados:
- `profileName` (STRING)
- `profileBio` (TEXT)
- `profileShortMessage` (STRING)
- `profileImageName` (STRING)
- `shareKey` (STRING)
- `configKey` (STRING)
- `configPublic` (BOOLEAN, default `false`)

Esses campos são opcionais e não interferem nos campos existentes.

## 2) Atualização parcial no endpoint `/api/config`
Arquivo: `backend-bot/src/routes/api.js`

O `POST /api/config` agora:
- Aceita os novos campos listados acima.
- **Atualiza somente os campos enviados** (valores `undefined` não são gravados).

Isso evita sobrescrever dados antigos quando o frontend envia apenas parte do payload (por exemplo, salvar só o Perfil do Bot).

## 3) Persistência
Os dados são persistidos na tabela `Config` via `sequelize.sync({ alter: true })`, sem migração manual.

## 4) Importação de `configKey` (somente UI)
O frontend exibe um campo “Insira config_key para importar”, porém **a lógica de importação real não está no backend**.

Caso seja necessário no futuro:
- Criar endpoint dedicado para importação, com regras de remoção de mídias/áudios conforme aviso do UI.
- Garantir validação de permissão (conta ApexVips) antes de importar.

## 5) Observação importante
O backend **não removeu** nenhum comportamento existente.  
As alterações foram adicionadas de forma incremental e são compatíveis com o fluxo atual.

## 6) Estabilidade de execução local
Arquivos:
- `backend-bot/src/index.js`
- `backend-bot/src/bot/index.js`
- `backend-bot/nodemon.json`

Ajustes mantidos para evitar travamentos no ambiente local:
- `sequelize.sync({ alter: true })` ficou opcional via `DB_SYNC_ALTER=true`.
- arquivos de sessão do Telegram foram movidos para `backend-bot/runtime/sessions`.
- `nodemon` ignora arquivos de sessão para não reiniciar o backend a cada mensagem recebida.
