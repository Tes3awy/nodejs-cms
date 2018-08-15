const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();

const _ = require('lodash');
const moment = require('moment');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const { mongoose } = require('./../db/mongoose');
const { Post } = require('./../models/Post');
const { User } = require('./../models/User');

const uploadPath = path.join(__dirname, './../../public/uploads/');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (_req, file, done) => {
    // console.log('Destination file:', file);
    done(null, uploadPath);
  },
  filename: (_req, file, done) => {
    // console.log('Filename file:', file);
    done(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage
});

const authenticate = require('./../middlewares/authenticate');

// GET /posts
router.get('/', (req, res) => {
  Post.find({}).sort({ featured: -1, createdAt: -1 }).then(posts => {
    res.render('posts/posts', {
      showTitle: 'Articles',
      layout: 'postsLayout',
      user: req.user,
      posts,
      error: req.flash('error'),
      success: req.flash('success')
    });
  }).catch(err => {
    req.flash('error', 'Unable to fetch articles!!!');
    return res.redirect('/posts');
  });
});

// GET /posts/add
router.get('/add', authenticate, (req, res) => {
  res.render('posts/add', {
    showTitle: 'Add article',
    layout: 'postsLayout',
    user: req.user,
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// POST /posts/add
router.post('/add', authenticate, upload.single('image'),
  [
    check('title')
      .isLength({ min: 10 })
      .trim()
      .escape()
      .withMessage('Title cannot be less than 10 characters'),
    check('content')
      .isLength({ min: 300 })
      .trim()
      .escape()
      .withMessage('Article cannot be less than 300 characters'),
    sanitizeBody('content')
  ], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = _.map(errors.array(), errs => {
        return _.pick(errs, 'msg');
      });
      req.flash('error', errors);
      return res.redirect('/posts/add');
    }

    const userId = req.user.id;

    const body = req.body;

    const title = body.title;
    const content = body.content;
    const featured = body.featured;
    const image = req.file.filename;

    const newPost = new Post({
      title,
      content,
      image,
      userId,
      featured
    });

    newPost.save().then(post => {
      req.flash('success', 'Added article successfully');
      return res.redirect('/posts');
    })
    .catch(err => {
      req.flash('error', 'Unable to add article into database!!!');
      return res.redirect('/posts');
    });
  }
);

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
    req.flash('error', 'Unable to find article');
    return res.redirect('/posts');
  });
});

// GET /post/edit (GET Edit post)
router.get('/post/edit/:id', authenticate, (req, res) => {
  const id = req.params.id;
  Post.findById(id).then(post => {
      res.render('posts/edit', {
        layout: 'postsLayout',
        showTitle: `Edit - ${post.title}`,
        user: req.user,
        post,
    });
  }).catch(err => {
    req.flash('error', 'Unable to edit article!!!');
    return res.redirect('/posts');
  });
});

// PUT /post/edit (PUT Edit post)
router.put('/post/edit/:id', authenticate, upload.single('image'), (req, res) => {
    const id = req.params.id;

    const body = req.body;

    const title = body.title;
    const content = body.content;
    const featured = body.featured;
    let image;

    if(!req.file) {
      findImgById(req.params.id).then(dbImg => {
        Post.findOneAndUpdate(id, { $set: { title, content, featured, dbImg } }, { new: true }).then(post => {
          req.flash('success', 'Edits submitted successfully');
          return res.redirect('/posts');
        }).catch(err => {
          req.flash('error', 'Unable to edit article');
          return res.redirect('/posts');
        });
      });
    } else {
      image = req.file.filename;
      Post.findOneAndUpdate(id, { $set: { title, content, featured, image } }, { new: true }).then(post => {
        req.flash('success', 'Edits submitted successfully');
        return res.redirect('/posts');
      }).catch(err => {
        req.flash('error', 'Unable to edit article');
        return res.redirect('/posts');
      });
    }
  }
);

// DELETE /post/delete (DELETE Edit post)
router.delete('/post/delete/:id', authenticate, (req, res) => {
  const id = req.params.id;
  Post.findByIdAndRemove(id).then(post => {
    if(post) {
      fs.unlink(`${uploadPath}${post.image}`, (err) => {
        if(err) {
          throw err;
        }
        req.flash('success', 'Article deleted successfully');
        return res.redirect('/posts');
      });
    }
  }).catch(err => {
    req.flash('error', 'Unable to delete article!!!');
    return res.redirect('/posts');
  });
});

module.exports = router;
