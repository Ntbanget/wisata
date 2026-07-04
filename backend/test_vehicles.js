const mysql = require('mysql2/promise');

async function testVehicles() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'wisata_db'
    });

    console.log('=== CHECKING VEHICLES TABLE ===');
    const [rows] = await conn.execute('SELECT id, name, category, capacity, price_per_day, available FROM vehicles');
    console.log('Total vehicles:', rows.length);
    console.log(JSON.stringify(rows, null, 2));

    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testVehicles();
