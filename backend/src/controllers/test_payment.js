const axios = require('axios');

axios.post('http://localhost:5000/api/auth/admin/login', {
  email: 'admin@wisata.com',
  password: 'admin123'
}).then(r => {
  const token = r.data.token;
  return axios.get('http://localhost:5000/api/payments', {
    headers: { Authorization: 'Bearer ' + token }
  });
}).then(r => console.log(JSON.stringify(r.data, null, 2)))
.catch(e => console.error(e.response?.data || e.message));