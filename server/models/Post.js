const mongoose = require('mongoose');
const moment = require('moment');

const PostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  likesCount: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  featured: {
    type: Boolean,
    required: false,
    default: false
  },
  postViews: {
    type: Number,
    required: false,
    min: 0,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});

const Post = mongoose.model('Post', PostSchema);

module.exports = {
  Post
};
