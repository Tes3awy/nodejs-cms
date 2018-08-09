const path = require('path');

const express = require('express');
const router = express.Router();

const _ = require('lodash');

const { check, validationResult } = require('express-validator/check');

const { mongoose } = require('./../db/mongoose');
const { Post } = require('./../models/Post');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, done) => {
    done(null, path.join(__dirname, './../../uploads/'));
  },
  filename: (req, file, done) => {
    console.log(file);
    done(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage
});

const authenticate = require('./../middlewares/authenticate');

// GET /posts
router.get('/', authenticate, (req, res) => {
  // const userId = req.user.id;
  Post.find({}).then((posts) => {
    res.render('posts/posts', {
      showTitle: 'Posts',
      layout: 'postsLayout',
      user: req.user,
      message: req.flash('error'),
      posts
    });
  }).catch(err => {
    req.flash('error', 'Unable to fetch posts');
    return res.redirect('/posts');
  });
});

// GET /posts/add
router.get('/add', authenticate, (req, res) => {
  res.render('posts/add', {
    showTitle: 'Add post',
    layout: 'postsLayout',
    message: req.flash('error'),
    user: req.user
  });
});

// POST /posts/add
router.post('/add', authenticate, upload.single('image'), (req, res) => {

  // let errors = validationResult(req);

  // if (!errors.isEmpty()) {
  //   errors = _.map(errors.array(), (errs) => { return _.pick(errs, 'msg'); });
  //   req.flash('error', errors);
  //   return res.redirect('/posts/add');
  // }

  const userId = req.user.id;

  const body = req.body;

  const title = body.title;
  const content = body.content;
  const image = req.file.filename;

  const newPost = new Post({
    userId,
    title,
    content,
    image
  });

  newPost.save().then(post => {
    if(!post) {
      console.log('Unable to add post!!!');
      return req.flash('error', 'Unable to add post!!!');
    }
    console.log('Added post successfully');
    req.flash('success', 'Added post successfully');
  }).catch((err) => {
    console.log(`Unable to add post!!!: ${err}`);
    return req.flash('error', `Unable to add post!!!: ${err}`);
  });

  res.redirect('/posts');
});

module.exports = router;
