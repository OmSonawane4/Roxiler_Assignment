/* Database seeder for Store Rating App */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

(async () => {
  const {
    DB_HOST = 'localhost',
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = 'store_rating_db',
    DB_PORT = 3306,
  } = process.env;

  const sqlPath = path.resolve(__dirname, '..', 'database.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('database.sql not found at', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');

  let conn;
  try {
    // Connect without database first (to allow CREATE DATABASE)
    conn = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: DB_PORT,
      multipleStatements: true,
    });

    console.log('Connected to MySQL. Seeding...');
    await conn.query(sql);
    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
})();
