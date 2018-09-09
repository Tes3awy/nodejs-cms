const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    type: Date,
    default: new Date()
  }
});

// Pre save to hash password
UserSchema.pre('save', function (next) {
  var user = this;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      console.log('Password hashed by pre("save") from mongoose');
      next();
    });
  });
});

// Pre update to hash password
UserSchema.pre('update', function (next) {
  var user = this;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.newPassword, salt, (err, hash) => {
      user.newPassword = hash;
      console.log('Password hashed by pre("update") from mongoose');
      next();
    });
  });
});

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};
