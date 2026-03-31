module.exports = {
  apps: [
    {
      name: 'vip-bot-backend',
      script: 'src/index.js',
      cwd: './backend-bot',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      }
    },
    {
      name: 'vip-admin-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: './frontend-admin',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://localhost:5001/api'
      }
    }
  ]
};
