const axios = require('axios');

var LookIP = axios.get('http://ip-api.com/json').then(response => {
  // console.log('response:', response);
    return response;
  })
  .catch((data, status) => {
    // console.log('status:', status);
    // console.log('data:', data);
    return status;
  });

module.exports = {
  LookIP
};
