const mongoose = require('mongoose');
const moment = require('moment');

const PostSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  likesCount: {
    type: Number,
    required: false,
    default: null,
  },
  createdAt: {
    type: String,
    default: moment().format('LLL'),
  },
});

const Post = mongoose.model('Post', PostSchema);

module.exports = {
  Post,
};
