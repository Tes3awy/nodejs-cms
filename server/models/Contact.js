const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 11
  },
  sender: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
});

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = {
  Contact
};
