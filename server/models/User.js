const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true
  },
  lastname: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
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
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  website: {
    type: String,
    unique: true,
    trim: true,
    default: ''
  },
  gender: {
    type: String,
    default: ''
  },
  birthdate: {
    type: Date,
    default: null
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

// Statics
UserSchema.statics.findByEmail = function(email) {
  var User = this;
  return User.findOne({ email });
}

UserSchema.statics.findByUsername = function(username) {
  var User = this;
  return User.findOne({ username });
}

// Pre save to hash password
UserSchema.pre('save', function (next) {
  var user = this;

  bcrypt.genSalt(10, (_err, salt) => {
    bcrypt.hash(user.password, salt, (_err, hash) => {
      user.password = hash;
      next();
    });
  });
});

// UserSchema.statics.findByCredentials = function(email, username) {
//   var User = this;
//   return User.findOne({ email, username });
// }

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};
