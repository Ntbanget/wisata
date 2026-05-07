/**
 * Jest global setup. Silences the noisy DB-connection logs that fire when
 * src/models/database.js is loaded, since most tests mock out the models
 * anyway and never need a real connection.
 *
 * Tests that DO need a real DB should override these via beforeAll().
 */

// Quiet "🔍 Database Configuration: …" lines from src/models/database.js
// when modules import it transitively.
const noop = () => {};
const realLog = console.log;
console.log = (...args) => {
  if (typeof args[0] === 'string' && (
    args[0].startsWith('🔍') ||
    args[0].startsWith('DB_HOST') ||
    args[0].startsWith('DB_USER') ||
    args[0].startsWith('DB_PASSWORD') ||
    args[0].startsWith('DB_NAME')
  )) {
    return;
  }
  realLog(...args);
};

// Suppress the unhandled connection error mysql2 throws when no DB is reachable.
process.on('unhandledRejection', noop);
