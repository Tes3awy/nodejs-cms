const mongoose = require('mongoose');
const moment = require('moment');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  gravatar: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    trim: true
  },
  job: {
    type: String,
    trim: true
  },
  alias: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  hash: {
    type: String,
    required: true,
    trim: true
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
