const path = require('path');

const express = require('express');
const router = express.Router();

const _ = require('lodash');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const { mongoose } = require('./../db/mongoose');
const { Post } = require('./../models/Post');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (_req, _file, done) => {
    done(null, path.join(__dirname, './../../public/uploads/'));
  },
  filename: (_req, file, done) => {
    done(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({
  storage
});

const authenticate = require('./../middlewares/authenticate');

// GET /posts
router.get('/', (req, res) => {
  Post.find({}).sort('asc').then((posts) => {
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
router.post('/add', authenticate, upload.single('image'), [
  check('title').isLength({ min: 10 }).trim().escape().withMessage('Title cannot be less than 10 characters'),
  check('content').isLength({ min: 100}).trim().escape().withMessage('Content cannot be less than 100 characters'),
  check('image').isEmpty().withMessage('Image cannot be empty'),
  sanitizeBody('content')
],(req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors = _.map(errors.array(), (errs) => { return _.pick(errs, 'msg'); });
    console.log(errors);
    req.flash('error', errors);
    return res.redirect('/posts/add');
  }

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
      return req.flash('error', 'Unable to add post!!!');
    }
    req.flash('success', 'Added post successfully');
  }).catch((err) => {
    return req.flash('error', `Unable to add post!!!: ${err}`);
  });

  res.redirect('/posts');
});

// GET /post (Single post)
router.get('/post/:id', (req, res) => {
  const id = req.params.id;

  Post.findById(id).then(post => {
      res.render('posts/post', {
        layout: 'postsLayout',
        showTitle: post.title,
        user: req.user,
        post
      });
  }).catch(err => {
    return req.flash('error', 'Unable to find post');
  });
});

module.exports = router;
