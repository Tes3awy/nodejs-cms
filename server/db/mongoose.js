const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose
  .connect(
    process.env.MONGODBURI_LOCAL,
    {
      useNewUrlParser: true,
      poolSize: 10,
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
