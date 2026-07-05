const bcrypt = require('bcryptjs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

(async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pool.connect();
    const email = process.env.ADMIN_EMAIL || 'admin@wisata.test';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const name = process.env.ADMIN_NAME || 'System Admin';

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      console.log('ADMIN_EXISTS', exists.rows[0].id);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
      [name, email, passwordHash, 'admin', '081234567890', true]
    );

    console.log('ADMIN_CREATED', result.rows[0].id);
  } catch (err) {
    console.error('ADMIN_FAIL', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
