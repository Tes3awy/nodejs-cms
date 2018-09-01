const axios = require('axios');

// var ipLookUp = () => {
//   $('').then(
//     function success(response) {
//       return response;
//       // console.log("User's Location Data is ", response.city);
//       // console.log("User's Country", response.country);
//     },
//     function fail(data, status) {
//       return status;
//       // console.log('Request failed. Returned status of', status);
//     }
//   );
// };

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
