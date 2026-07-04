const mysql = require('mysql2/promise');
require('dotenv').config();

async function runFix() {
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

    // Check table structure
    const [structure] = await connection.query("DESCRIBE bookings");
    console.log('Bookings table structure:');
    structure.forEach(col => {
      if (col.Field === 'status') {
        console.log(`  status column: Type=${col.Type}, Null=${col.Null}, Key=${col.Key}, Default=${col.Default}, Extra=${col.Extra}`);
      }
    });

    // Modify ENUM to only have uppercase values (MySQL ENUM is case-insensitive, stores as first match)
    console.log('Modifying status column ENUM to only uppercase values...');
    await connection.query("ALTER TABLE bookings MODIFY COLUMN status ENUM('PENDING_PAYMENT','CONFIRMED','CANCELLED') NULL DEFAULT 'PENDING_PAYMENT'");
    console.log('ENUM modified successfully');

    // Update existing lowercase statuses to uppercase (direct match)
    const [result1] = await connection.query("UPDATE bookings SET status = 'PENDING_PAYMENT' WHERE status = 'pending'");
    console.log(`Updated ${result1.affectedRows} pending to PENDING_PAYMENT`);

    const [result2] = await connection.query("UPDATE bookings SET status = 'CONFIRMED' WHERE status = 'confirmed'");
    console.log(`Updated ${result2.affectedRows} confirmed to CONFIRMED`);

    const [result3] = await connection.query("UPDATE bookings SET status = 'CANCELLED' WHERE status = 'cancelled'");
    console.log(`Updated ${result3.affectedRows} cancelled to CANCELLED`);

    // Verify the update
    const [verifyRows] = await connection.query("SELECT id, status FROM bookings WHERE id IN (44, 45, 46, 47)");
    console.log('Verification of updated bookings:');
    verifyRows.forEach(row => console.log(`  ID ${row.id}: status = ${row.status}`));

    // Display summary
    const [rows] = await connection.query("SELECT status, COUNT(*) as count FROM bookings GROUP BY status");
    console.log('Current status distribution:');
    rows.forEach(row => console.log(`  ${row.status}: ${row.count}`));

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error running fix:', error);
    process.exit(1);
  }
}

runFix();
