const axios = require('axios');

var LookIP = axios.get('http://ip-api.com/json').then(res => {
    return res;
  })
  .catch((data, status) => {
    return status;
  });

module.exports = {
  LookIP
};
