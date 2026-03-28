const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    user: 'postgres',
    password: '2026',
    host: 'localhost',
    database: 'postgres', // Connect to default database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL default database.');

    const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'telegram_vip'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE telegram_vip');
      console.log('Database "telegram_vip" created successfully.');
    } else {
      console.log('Database "telegram_vip" already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.stack);
  } finally {
    await client.end();
  }
}

createDatabase();
