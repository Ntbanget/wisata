const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api';

const USER_EMAIL = 'user@wisata.com';
const USER_PASSWORD = 'user123';

const ADMIN_EMAIL = 'admin@wisata.com';
const ADMIN_PASSWORD = 'admin123';

let userToken = null;
let adminToken = null;
let bookingId = null;
let paymentId = null;

// Helper functions
function logFlow(flowNum, description) {
  console.log(`\n=== FLOW ${flowNum}: ${description} ===`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(flow, message) {
  console.log(`❌ ${flow}: ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// FLOW 1: User Login
async function testFlow1_UserLogin() {
  logFlow(1, 'User Login');

  try {
    const loginRes = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        email: USER_EMAIL,
        password: USER_PASSWORD
      }
    );

    userToken = loginRes.data.token;

    if (!userToken) {
      throw new Error('Token tidak ditemukan');
    }

    logSuccess('User login berhasil');
    logInfo(`User Token: ${userToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logError('Flow 1 failed', error.response?.data?.message || error.message);
    return false;
  }
}

// FLOW 2: Create Booking
async function testFlow2_CreateBooking() {
  logFlow(2, 'Create Booking');

  try {
    const bookingData = {
      user_name: 'Test User',
      email: USER_EMAIL,
      phone: '081234567890',
      city_id: 1,
      total_price: 500000,
      budget: 1000000,
      hotel_id: 1,
      tourist_places: [
        { id: 1, ticket_price: 50000 }
      ],
      vehicle_id: 1,
      guide_id: 1,
      payment_method: 'transfer',
      trip_date: '2024-12-25',
      nights: 2,
      total_rooms: 1,
      people_count: 2,
      vehicle_mode: 'automatic'
    };

    const bookingRes = await axios.post(
      `${BASE_URL}/booking`,
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    );

    console.log("===== RAW BOOKING RESPONSE =====");
    console.log(JSON.stringify(bookingRes.data, null, 2));

    if (!bookingRes.data.success) {
      throw new Error(bookingRes.data.error || 'Booking creation failed');
    }

    bookingId = bookingRes.data.data.id;

    if (!bookingId) {
      throw new Error('Booking ID tidak ditemukan');
    }

    logSuccess('Booking created successfully');
    logInfo(`Booking ID: ${bookingId}`);
    logInfo(`Booking Status: ${bookingRes.data.data.status}`);
    logInfo(`Payment Status: ${bookingRes.data.data.payment_status}`);
    return true;
  } catch (error) {
    logError('Flow 2 failed', error.response?.data?.message || error.message);
    return false;
  }
}

// FLOW 3: Upload Payment Proof
async function testFlow3_UploadProof() {
  logFlow(3, 'Upload Payment Proof');

  try {
    // Create a dummy image file for testing
    const dummyImagePath = './test_payment_proof.jpg';
    fs.writeFileSync(dummyImagePath, 'dummy image content');

    const formData = new FormData();
    formData.append('payment_proof', fs.createReadStream(dummyImagePath));

    const uploadRes = await axios.post(
      `${BASE_URL}/payments/upload-proof`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          ...formData.getHeaders()
        }
      }
    );

    if (!uploadRes.data.file_url) {
      throw new Error('File URL tidak ditemukan');
    }

    const proofUrl = uploadRes.data.file_url;

    // Clean up dummy file
    fs.unlinkSync(dummyImagePath);

    logSuccess('Payment proof uploaded successfully');
    logInfo(`Proof URL: ${proofUrl}`);
    return proofUrl;
  } catch (error) {
    logError('Flow 3 failed', error.response?.data?.message || error.message);
    return null;
  }
}

// FLOW 4: Create Payment
async function testFlow4_CreatePayment(proofUrl) {
  logFlow(4, 'Create Payment');

  try {
    if (!proofUrl) {
      throw new Error('Proof URL tidak tersedia');
    }

    const paymentData = {
      booking_id: bookingId,
      amount: 500000,
      payment_method: 'transfer',
      proof_image: proofUrl
    };

    const paymentRes = await axios.post(
      `${BASE_URL}/payments`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    );

    if (!paymentRes.data.success) {
      throw new Error(paymentRes.data.error || 'Payment creation failed');
    }

    paymentId = paymentRes.data.data.id;

    if (!paymentId) {
      throw new Error('Payment ID tidak ditemukan');
    }

    logSuccess('Payment created successfully');
    logInfo(`Payment ID: ${paymentId}`);
    logInfo(`Payment Status: ${paymentRes.data.data.status}`);
    return true;
  } catch (error) {
    logError('Flow 4 failed', error.response?.data?.message || error.message);
    return false;
  }
}

// FLOW 5: Admin Login
async function testFlow5_AdminLogin() {
  logFlow(5, 'Admin Login');

  try {
    const loginRes = await axios.post(
      `${BASE_URL}/auth/admin/login`,
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    );

    adminToken = loginRes.data.token;

    if (!adminToken) {
      throw new Error('Admin token tidak ditemukan');
    }

    logSuccess('Admin login berhasil');
    logInfo(`Admin Token: ${adminToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    logError('Flow 5 failed', error.response?.data?.message || error.message);
    return false;
  }
}

// FLOW 6: Admin Get Payments
async function testFlow6_AdminGetPayments() {
  logFlow(6, 'Admin Get Payments');

  try {
    const paymentsRes = await axios.get(
      `${BASE_URL}/admin/payments`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    if (!paymentsRes.data.success) {
      throw new Error('Failed to get payments');
    }

    logSuccess('Admin retrieved payments successfully');
    logInfo(`Total Payments: ${paymentsRes.data.data.length}`);

    // Find our payment
    const ourPayment = paymentsRes.data.data.find(p => p.id === paymentId);
    if (ourPayment) {
      logInfo(`Our Payment Found: ID=${ourPayment.id}, Status=${ourPayment.status}`);
    } else {
      logInfo('Our payment not found in list (might be filtered)');
    }

    return true;
  } catch (error) {
    logError('Flow 6 failed', error.response?.data?.message || error.message);
    return false;
  }
}

// FLOW 7: Admin Approve Payment
async function testFlow7_AdminApprovePayment() {
  logFlow(7, 'Admin Approve Payment');

  try {
    const approveRes = await axios.put(
      `${BASE_URL}/admin/payments/${paymentId}/verify`,
      {
        status: 'approved',
        admin_notes: 'Payment approved via E2E test'
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    if (!approveRes.data.success) {
      throw new Error(approveRes.data.error || 'Payment approval failed');
    }

    logSuccess('Payment approved successfully');
    logInfo(`Payment Status: ${approveRes.data.data.status}`);
    return true;
  } catch (error) {
    logError('Flow 7 failed', error.response?.data?.message || error.message);
    return false;
  }
}

// FLOW 8: Verify Booking Status = CONFIRMED
async function testFlow8_VerifyBookingConfirmed() {
  logFlow(8, 'Verify Booking Status = CONFIRMED');

  try {
    const bookingRes = await axios.get(
      `${BASE_URL}/booking/${bookingId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    if (!bookingRes.data.success) {
      throw new Error('Failed to get booking');
    }

    console.log("===== RAW BOOKING GET RESPONSE =====");
    console.log(JSON.stringify(bookingRes.data, null, 2));

    const booking = bookingRes.data.data;
    logInfo(`Booking Status: ${booking.status}`);
    logInfo(`Payment Status: ${booking.payment_status}`);

    if (booking.status !== 'CONFIRMED') {
      throw new Error(`Booking status is ${booking.status}, expected CONFIRMED`);
    }

    if (booking.payment_status !== 'paid') {
      throw new Error(`Payment status is ${booking.payment_status}, expected paid`);
    }

    logSuccess('Booking status is CONFIRMED');
    logSuccess('Payment status is paid');
    return true;
  } catch (error) {
    logError('Flow 8 failed', error.response?.data?.message || error.message);
    return false;
  }
}

// FLOW 9: Verify Booking in Admin Booking List
async function testFlow9_VerifyBookingInAdminList() {
  logFlow(9, 'Verify Booking in Admin Booking List');

  try {
    const bookingsRes = await axios.get(
      `${BASE_URL}/admin/bookings`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    if (!bookingsRes.data.success) {
      throw new Error('Failed to get admin bookings');
    }

    logSuccess('Admin retrieved bookings successfully');
    logInfo(`Total Bookings: ${bookingsRes.data.data.length}`);

    // Find our booking
    const ourBooking = bookingsRes.data.data.find(b => b.id === bookingId);
    if (ourBooking) {
      logSuccess('Our booking found in admin booking list');
      logInfo(`Booking ID: ${ourBooking.id}, Status: ${ourBooking.status}`);
      return true;
    } else {
      throw new Error('Our booking not found in admin booking list');
    }
  } catch (error) {
    logError('Flow 9 failed', error.response?.data?.message || error.message);
    return false;
  }
}

// MAIN TEST FUNCTION
async function runE2ETest() {
  console.log('\n========================================');
  console.log('   E2E TEST: BOOKING → PAYMENT → APPROVAL');
  console.log('========================================\n');

  const results = [];

  // Run all flows
  results.push(await testFlow1_UserLogin());
  results.push(await testFlow2_CreateBooking());
  const proofUrl = await testFlow3_UploadProof();
  results.push(await testFlow4_CreatePayment(proofUrl));
  results.push(await testFlow5_AdminLogin());
  results.push(await testFlow6_AdminGetPayments());
  results.push(await testFlow7_AdminApprovePayment());
  results.push(await testFlow8_VerifyBookingConfirmed());
  results.push(await testFlow9_VerifyBookingInAdminList());

  // Summary
  console.log('\n========================================');
  console.log('           TEST SUMMARY');
  console.log('========================================\n');

  const passed = results.filter(r => r === true).length;
  const failed = results.filter(r => r === false).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉\n');
    process.exit(0);
  } else {
    console.log('\n❌ SOME TESTS FAILED ❌\n');
    process.exit(1);
  }
}

// Run the test
runE2ETest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
