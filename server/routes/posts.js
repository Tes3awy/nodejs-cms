const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();

const _ = require('lodash');

const { check, validationResult } = require('express-validator/check');

const { mongoose } = require('./../db/mongoose');
const { Post, findImgById } = require('./../models/Post');
const { User } = require('./../models/User');

const uploadPath = path.join(__dirname, './../../public/uploads/');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (_req, file, done) => {
    done(null, uploadPath);
  },
  filename: (_req, file, done) => {
    done(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage
});

const authenticate = require('./../middlewares/authenticate');
// GET /posts
router.get('/', (req, res) => {
  if(req.session.views) {
    const views = req.session.views++
  }
  Post.find().sort({ featured: -1, createdAt: -1 }).then(posts => {
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
      .withMessage('Title cannot be less than 10 characters'),
    check('content')
      .isLength({ min: 300 })
      .trim()
      .withMessage('Article cannot be less than 300 characters')
  ], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = _.map(errors.array(), err => {
        return _.pick(err, 'msg');
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
router.get('/:id', (req, res) => {
  const id = req.params.id;

  Post.findById(id).then(post => {
    User.findById(post.userId).then(author => {
        res.render('posts/post', {
          layout: 'postsLayout',
          showTitle: post.title,
          user: req.user,
          post,
          author
      });
    }).catch(err => {
      req.flash('error', 'Unable to find author');
      return res.redirect(`/posts/${post.id}`);
    });
  }).catch(err => {
    req.flash('error', 'Unable to find article');
    return res.redirect('/posts');
  });
});

// GET /post/edit (GET Edit post)
router.get('/edit/:id', authenticate, (req, res) => {
  const id = req.params.id;
  Post.findById(id).then(post => {
      res.render('posts/edit', {
        layout: 'postsLayout',
        showTitle: `Edit - ${post.title}`,
        user: req.user,
        post
    });
  }).catch(err => {
    req.flash('error', 'Unable to find article to edit!!!');
    return res.redirect('/posts');
  });
});

// PUT /post/edit (Edit post)
router.put('/edit/:id', authenticate, upload.single('image'), (req, res) => {
    const id = req.params.id;

    const body = req.body;

    const title = body.title;
    const content = body.content;
    const featured = body.featured;
    const updatedAt = new Date();
    let image;

    if(!req.file) {
      findImgById(id).then(dbImg => {
        Post.findOneAndUpdate(id, { $set: { title, content, featured, dbImg, updatedAt } }, { new: true }).then(post => {
          req.flash('success', 'Updated successfully');
          return res.redirect('/posts');
        }).catch(err => {
          req.flash('error', 'Unable to update article!!!');
          return res.redirect('/posts');
        });
      });
    } else {
      image = req.file.filename;
      Post.findOneAndUpdate(id, { $set: { title, content, featured, image, updatedAt } }, { new: true }).then(post => {
        req.flash('success', 'Updated successfully');
        return res.redirect('/posts');
      }).catch(err => {
        req.flash('error', 'Unable to update article!!!');
        return res.redirect('/posts');
      });
    }
  }
);

// DELETE /post/delete (DELETE Edit post)
router.delete('/delete/:id', authenticate, (req, res) => {
  const id = req.params.id;
  Post.findByIdAndRemove(id).then(post => {
    if(post) {
      fs.unlink(`${uploadPath}${post.image}`, (err) => {
        if(err) {
          throw err;
        }
        req.flash('success', 'Article deleted');
        return res.redirect('/posts');
      });
    }
  }).catch(err => {
    req.flash('error', 'Unable to delete article!!!');
    return res.redirect('/posts');
  });
});

module.exports = router;
