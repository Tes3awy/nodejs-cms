const mongoose = require('mongoose');
const moment = require('moment');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: String,
    default: moment().format('ll')
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};
