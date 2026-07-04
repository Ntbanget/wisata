const { query } = require('./src/models/database');

async function checkVehicles() {
  try {
    console.log('=== CHECKING VEHICLES TABLE ===');
    const vehicles = await query('SELECT id, name, category, capacity, price_per_day, available FROM vehicles');
    console.log('Total vehicles:', vehicles.length);
    console.log(JSON.stringify(vehicles, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkVehicles();
