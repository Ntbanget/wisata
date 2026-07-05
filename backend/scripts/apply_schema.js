const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '-' && next === '-') {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (char === '\\') {
      current += char;
      escaped = true;
      continue;
    }

    if (char === "'" && !inDouble) {
      if (inSingle && next === "'") {
        current += "''";
        i += 1;
      } else {
        inSingle = !inSingle;
        current += char;
      }
      continue;
    }

    if (char === '"' && !inSingle) {
      inDouble = !inDouble;
      current += char;
      continue;
    }

    if (char === ';' && !inSingle && !inDouble) {
      const stmt = current.trim();
      if (stmt) statements.push(stmt);
      current = '';
      continue;
    }

    current += char;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

(async () => {
  const sqlPath = path.resolve(__dirname, '..', '..', 'database', 'schema_postgresql.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const statements = splitStatements(sql);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('CONNECTED');
    console.log('STATEMENTS', statements.length);

    for (let i = 0; i < statements.length; i += 1) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
      } catch (err) {
        console.error('STATEMENT_FAIL', i + 1, err.message);
        console.error(stmt.slice(0, 400));
        process.exit(1);
      }
    }

    console.log('SCHEMA_EXECUTED');
    const tableRes = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log('TABLE_COUNT', tableRes.rows.length);
    console.log('TABLES', tableRes.rows.map((r) => r.table_name).join(','));
  } catch (err) {
    console.error('SCHEMA_FAIL');
    console.error(err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
