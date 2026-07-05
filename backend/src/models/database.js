const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Database Configuration:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : '***EMPTY***');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

function convertQuestionMarksToPostgres(sql, params = []) {
  if (!Array.isArray(params) || params.length === 0) {
    return { sql, params };
  }

  let index = 0;
  const convertedSql = sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });

  return { sql: convertedSql, params };
}

function prepareInsertSql(sql) {
  const trimmed = sql.trim();
  if (!/^INSERT\s+/i.test(trimmed) || /RETURNING\b/i.test(trimmed)) {
    return sql;
  }

  return `${trimmed} RETURNING id`;
}

function buildQueryResponse(result, rows) {
  const command = result.command || 'SELECT';
  const fields = result.fields || [];
  const rowCount = result.rowCount || 0;
  let insertId = null;

  if (command === 'SELECT' && Array.isArray(rows)) {
    const numericKeys = ['price_per_night', 'ticket_price', 'price_per_day', 'total_price', 'budget', 'amount', 'rating', 'lat', 'lng', 'total_estimated_cost'];
    rows.forEach((row) => {
      numericKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(row, key) && typeof row[key] === 'string') {
          const parsed = Number(row[key]);
          if (!Number.isNaN(parsed)) {
            row[key] = parsed;
          }
        }
      });
    });
  }

  if (command === 'INSERT' && Array.isArray(rows) && rows.length > 0) {
    insertId = rows[0].id || rows[0].insertId || null;
  }

  if (command === 'INSERT' || command === 'UPDATE' || command === 'DELETE') {
    return {
      insertId,
      rowCount,
      affectedRows: rowCount,
      command,
      fields,
      rows
    };
  }

  const response = rows;
  response.insertId = insertId;
  response.rowCount = rowCount;
  response.affectedRows = rowCount;
  response.command = command;
  response.fields = fields;
  response.rows = rows;
  return response;
}

async function executeQuery(clientLike, sql, params = [], mode = 'query') {
  try {
    const { sql: convertedSql, params: convertedParams } = convertQuestionMarksToPostgres(sql, params);
    const preparedSql = prepareInsertSql(convertedSql);
    const result = await clientLike.query(preparedSql, convertedParams);
    const rows = Array.isArray(result.rows) ? result.rows : [];
    const response = buildQueryResponse(result, rows);

    if (mode === 'execute') {
      if (result.command === 'SELECT') {
        return [rows, result.fields || []];
      }
      return [response, result.fields || []];
    }

    return response;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

async function query(sql, params = []) {
  return executeQuery(pool, sql, params);
}

async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    client.execute = (sql, params = []) => executeQuery(client, sql, params, 'execute');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

pool.execute = (sql, params = []) => executeQuery(pool, sql, params, 'execute');

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    return result.rows[0];
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

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
