const { Client } = require('pg');
require('dotenv').config();

const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '2026';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || 5432);
const dbName = process.env.DB_NAME || 'telegram_vip';
if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
  throw new Error('DB_NAME inválido. Use apenas letras, números e underscore.');
}

async function createDatabase() {
  const client = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    database: 'postgres', // Connect to default database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL default database.');

    const res = await client.query('SELECT datname FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err.stack);
  } finally {
    await client.end();
  }
}

createDatabase();
