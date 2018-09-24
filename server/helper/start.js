const exec = require('child_process').exec;

if (process.env.OS == 'Windows_NT') {
  console.log('Running on a Windows');
  exec('set NODE_ENV=development && nodemon server/server.js');
} else if (process.env.OS == 'Darwin') {
  console.log('Running on a Mac');
  exec('export NODE_ENV=development && nodemon server/server.js');
} else {
  console.log(`Unsupported OS: ${process.env.OS}`);
}
