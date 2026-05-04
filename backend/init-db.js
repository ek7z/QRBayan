const mysql = require('mysql2/promise');
require('./loadEnv')();

async function initDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    ssl:
      process.env.DB_SSL_MODE === "REQUIRED"
        ? {
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
          }
        : undefined,
  });

  try {
    console.log(`Creating database "${process.env.DB_NAME || 'qrph_db'}" if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'qrph_db'};`);
    console.log('Database created or already exists.');
  } catch (err) {
    console.error('Error creating database:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDb();
