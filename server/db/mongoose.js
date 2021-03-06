const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose
  .connect(
    'mongodb://localhost:27017/LoginApp',
    {
      useNewUrlParser: true,
      poolSize: 5,
      useFindAndModify: false,
      useCreateIndex: true
    }
  )
  .then((_db, err) => {
    if (err) {
      return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
  });
