const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    console.log('=== REGISTER TEST ===\n');
    
    const email = 'test@test.com';
    const password = 'test12345';
    
    // Check if user exists
    console.log('1. Checking if user exists...');
    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      console.log('User already exists, deleting...');
      await User.delete(existingUser.id);
      console.log('Old user deleted');
    }
    
    // Create user
    console.log('\n2. Creating new user...');
    const password_hash = await bcrypt.hash(password, 10);
    const userId = await User.create({
      name: 'Test User',
      email,
      password_hash,
      phone: '08123456789',
      role: 'user'
    });
    console.log('User created with ID:', userId);
    
    // Get user from database
    console.log('\n3. Retrieving user from database...');
    const user = await User.getByEmail(email);
    console.log('User data:', JSON.stringify(user, null, 2));
    
    // Test password match
    console.log('\n4. Testing password match...');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', passwordMatch);
    
    console.log('\n=== REGISTER TEST COMPLETE ===');
    process.exit(0);
  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();
