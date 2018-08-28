const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

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
  postTag: [{
    type: String,
    required: true
  }],
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
  updatedAt: {
    type: Date,
    default: null
  }
});

// Mongoose Plugins
PostSchema.plugin(mongoosePaginate);
const Post = mongoose.model('Post', PostSchema);

// Functions
var findImgById = (id) => {
  return Post.findById(id).then(post => {
    return post.image;
  });
}

module.exports = {
  Post,
  findImgById
};
