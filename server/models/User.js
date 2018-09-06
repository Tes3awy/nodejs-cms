const mongoose = require('mongoose');
const moment = require('moment');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  alias: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  gravatar: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  title: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    unique: true,
    trim: true
  },
  gender: {
    type: String
  },
  birthdate: {
    type: Date
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
