const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');

async function runSeed() {
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wisata_db',
    multipleStatements: true
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database');

    const seedSql = fs.readFileSync('./seed_data.sql', 'utf8');
    await connection.query(seedSql);
    console.log('Seed data executed successfully');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error running seed:', error);
    process.exit(1);
  }
}

runSeed();
