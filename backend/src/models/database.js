const mysql = require('mysql2/promise');
require('dotenv').config();

// Debug environment variables
console.log('🔍 Database Configuration:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : '***EMPTY***');
console.log('DB_NAME:', process.env.DB_NAME);

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wisata_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Query helper function
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);

    // Check for column not found error
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      const columnMatch = error.message.match(/Unknown column '(\w+)'/);
      if (columnMatch) {
        const columnName = columnMatch[1];
        let suggestedColumn = columnName;

        // Map incorrect column names to correct ones based on table context
        if (columnName === 'available') {
          // Check if SQL mentions tour_guides or vehicles to determine correct column
          if (sql.toLowerCase().includes('tour_guides')) {
            suggestedColumn = 'is_available';
          } else if (sql.toLowerCase().includes('vehicles')) {
            suggestedColumn = 'is_active';
          } else {
            suggestedColumn = 'is_active or is_available (check table context)';
          }
        }

        const enhancedError = new Error(`Database schema mismatch terdeteksi. Periksa apakah tabel menggunakan is_active atau is_available. Column '${columnName}' does not exist. Expected '${suggestedColumn}'.`);
        enhancedError.code = 'SCHEMA_MISMATCH';
        enhancedError.originalError = error;
        throw enhancedError;
      }
    }

    throw error;
  }
}

// Transaction helper function
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Close connection pool
async function close() {
  await pool.end();
  console.log('Database connection pool closed');
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  close
};
