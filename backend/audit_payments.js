const mysql = require('mysql2/promise');
const axios = require('axios');

async function auditPayments() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wisata_db'
  });

  try {
    console.log('=== PAYMENT TABLE AUDIT ===');
    const [payments] = await connection.query(`
      SELECT id, booking_id, status, payment_method, proof_image, created_at
      FROM payments
      ORDER BY id DESC
      LIMIT 10
    `);
    
    console.log('Total payments:', payments.length);
    payments.forEach(p => {
      console.log(`ID ${p.id}: booking_id=${p.booking_id}, status="${p.status}", method=${p.payment_method}, proof=${p.proof_image ? 'YES' : 'NO'}, created=${p.created_at}`);
    });

    console.log('\n=== ADMIN ENDPOINT TEST ===');
    
    // Get admin token
    const loginRes = await axios.post('http://localhost:5004/api/auth/admin/login', {
      email: 'admin@wisata.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('Admin token obtained');

    // Test /api/admin/payments
    console.log('\n--- GET /api/admin/payments ---');
    try {
      const adminRes = await axios.get('http://localhost:5004/api/admin/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response:', JSON.stringify(adminRes.data, null, 2));
    } catch (e) {
      console.error('Error:', e.response?.data || e.message);
    }

    // Test /api/payments/status/pending
    console.log('\n--- GET /api/payments/status/pending ---');
    try {
      const pendingRes = await axios.get('http://localhost:5004/api/payments/status/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Response:', JSON.stringify(pendingRes.data, null, 2));
    } catch (e) {
      console.error('Error:', e.response?.data || e.message);
    }

  } finally {
    await connection.end();
  }
}

auditPayments().catch(console.error);
