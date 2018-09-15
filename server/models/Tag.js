const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  tag: {
    type: String,
    unique: true,
    trim: true,
    default: ''
  }
});

const Tag = mongoose.model('Tag', TagSchema);

module.exports = {
  Tag
};
