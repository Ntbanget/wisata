const { query } = require('./src/models/database');

(async () => {
  try {
    console.log('=== CHECKING TOUR_GUIDES TABLE STRUCTURE ===\n');
    
    const columns = await query('SHOW COLUMNS FROM tour_guides');
    console.log('TOUR_GUIDES TABLE COLUMNS:');
    columns.forEach(col => console.log(`  ${col.Field} - ${col.Type}`));
    
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
})();
