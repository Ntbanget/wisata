const http = require('http');

const data = JSON.stringify({
  email: 'test@test.com',
  password: 'test12345'
});

const options = {
  hostname: 'localhost',
  port: 5004,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('=== LOGIN ENDPOINT TEST ===');
console.log('Request Payload:', data);
console.log('\nSending request to http://localhost:5004/api/auth/login\n');

const req = http.request(options, (res) => {
  console.log(`Response Status: ${res.statusCode}`);
  console.log(`Response Headers:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    console.log(body);
    console.log('\n=== REQUEST COMPLETE ===');
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
  process.exit(1);
});

req.write(data);
req.end();
