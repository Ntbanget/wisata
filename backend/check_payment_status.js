const mysql = require('mysql2/promise');

async function checkPaymentStatus() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wisata_db'
  });

  try {
    // Check payments table structure
    const [columns] = await connection.query("DESCRIBE payments");
    console.log('=== PAYMENTS TABLE STRUCTURE ===');
    columns.forEach(col => {
      if (col.Field === 'status') {
        console.log(`status column: Type=${col.Type}, Null=${col.Null}, Default=${col.Default}`);
      }
    });

    // Check payment status values
    const [rows] = await connection.query("SELECT id, status FROM payments WHERE id IN (12, 24)");
    console.log('\n=== PAYMENT STATUS VALUES ===');
    rows.forEach(row => {
      console.log(`ID ${row.id}: status = "${row.status}" (length: ${row.status?.length || 0})`);
    });
  } finally {
    await connection.end();
  }
}

checkPaymentStatus().catch(console.error);
