# SaaS Telegram VIP Bot & Admin Panel - Guia de Deploy VPS Ubuntu

🚀 **Sistema Completo de Automação para Telegram (Vendas de Grupos/Canais VIP)**

Este guia detalha o processo de deploy em uma VPS Ubuntu (20.04 ou 22.04+) do zero, incluindo Banco de Dados, Backend e Frontend.

---

## 🛠️ Requisitos Iniciais na VPS

Antes de começar, certifique-se de que sua VPS está atualizada:

```bash
sudo apt update && sudo apt upgrade -y
```

### 1. Instalar Node.js (v18+) e NPM
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Instalar PostgreSQL (Banco de Dados)
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Configurar o usuário e banco:**
```bash
# Entrar no terminal do postgres
sudo -u postgres psql

# Dentro do psql, execute:
CREATE DATABASE telegram_vip;
CREATE USER luhan WITH PASSWORD '2026';
GRANT ALL PRIVILEGES ON DATABASE telegram_vip TO luhan;
\q
```

### 3. Instalar PM2 e Nginx
```bash
sudo npm install -g pm2
sudo apt install nginx -y
```

---

## 📂 Clonar e Configurar o Projeto

Clone seu repositório na VPS:
```bash
git clone https://github.com/Luhanvinicius/apex_clone.git
cd apex_clone
```

### 1. Configurar o Backend
```bash
cd backend-bot
npm install
cp .env.example .env
nano .env
```
*No arquivo `.env`, ajuste as credenciais do banco (DB_USER=luhan, DB_PASSWORD=2026, DB_NAME=telegram_vip) e insira seu `BOT_TOKEN`.*

### 2. Configurar o Frontend
```bash
cd ../frontend-admin
npm install
npm run build
```

---

## ⚡ Execução com PM2

Retorne à raiz do projeto (onde está o `ecosystem.config.js`):
```bash
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
*Siga as instruções que o comando `pm2 startup` exibir no terminal para garantir que o sistema inicie após um reboot.*

---

## 🌐 Configuração do Proxy Reverso (Nginx)

Para que o sistema seja acessível via domínio e tenha SSL (HTTPS), configure o Nginx:

```bash
sudo nano /etc/nginx/sites-available/telegram-bot
```

Cole o conteúdo abaixo (ajuste o seu domínio):

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend Admin
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/telegram-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Segurança (SSL & Firewall)

### 1. Instalar SSL (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com
```

### 2. Firewall (UFW)
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow 22
sudo ufw enable
```

---

## 📜 Comandos Úteis na VPS

- **Ver Logs:** `pm2 logs`
- **Ver Status:** `pm2 status`
- **Reiniciar Sistema:** `pm2 restart all`
- **Logs do Nginx:** `sudo tail -f /var/log/nginx/error.log`

---

## 🧪 Teste inicial de Admin
Se precisar forçar a criação de um admin após o deploy:
```bash
cd backend-bot
node force-admin.js
```
