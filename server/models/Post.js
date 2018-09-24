const mongoose = require('mongoose');

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
  slug: {
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
  postTag: [
    {
      type: String,
      required: true
    }
  ],
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

// Add updatedAt pre('update')
// PostSchema.pre('update', function() {
//   var Post = this;
//   console.log('Updated updatedAt time using pre');
//   Post.findOneAndUpdate({},{ $set: { updatedAt: new Date() } });
// });

// Statics
PostSchema.statics.findBySlug = function(slug) {
  var Post = this;
  return Post.findOne({ slug });
};

PostSchema.statics.findByTitle = function(title) {
  var Post = this;
  return Post.findOne({ title });
};

PostSchema.statics.findImgById = function(id) {
  var Post = this;
  return Post.findById(id);
};

// Mongoose Plugins
const Post = mongoose.model('Post', PostSchema);

module.exports = {
  Post
};
