const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();

const slugify = require('slugify');
const stringSimilarity = require('string-similarity');
const _ = require('lodash');

const { check, validationResult } = require('express-validator/check');

const { ObjectID } = require('mongodb');

const { mongoose } = require('../db/mongoose');
const { Post } = require('../models/Post');
const { User } = require('../models/User');
const { Tag } = require('../models/Tag');

const uploadPath = path.join(__dirname, '../../public/uploads/');

const maxFileSize = 1 * 1024 * 1024;
const multer = require('multer');
const storage = multer.diskStorage({
  filename: (_req, file, done) => {
    done(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
  destination: (_req, _file, done) => {
    done(null, uploadPath);
  }
});
const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: 1
  }
}).single('image');

const authenticate = require('../middlewares/authenticate');

// GET /posts
router.get('/', (req, res) => {
  Post.find()
    .sort({ featured: -1, createdAt: -1 })
    .then(posts => {
      res.render('posts/posts', {
        showTitle: 'Posts',
        layout: 'postLayout',
        posts,
        views: req.session.views ? req.session.views++ : 1,
        error: req.flash('error'),
        success: req.flash('success')
      });
    })
    .catch(_err => {
      req.flash('error', { msg: 'Unable to fetch posts!!!' });
      return res.redirect('/posts');
    });
});

// GET /posts/add
router.get('/add', authenticate, (req, res) => {
  Tag.find().then(tag => {
    res.render('posts/add', {
      showTitle: 'Add post',
      layout: 'postLayout',
      tag,
      error: req.flash('error'),
      success: req.flash('success')
    });
  });
});

// POST /posts/add
router.post('/add', authenticate, (req, res) => {
  check('title')
    .isLength({ min: 10, max: 60 })
    .trim()
    .withMessage('Title cannot be less than 10 or more than 60 characters');
  check('content')
    .isLength({ min: 300 })
    .trim()
    .withMessage('Post content cannot be less than 300 characters');

  upload(req, res, err => {
    let errors = validationResult(req);
    // Upload Error
    if (err) {
      req.flash('error', { msg: err.message });
      return res.redirect('/posts/add');
    }
    // Form Elements Error
    if (!errors.isEmpty()) {
      errors = errors.array();
      req.flash('error', errors);
      return res.redirect('/posts/add');
    }

    let image;
    const userId = req.user.id;
    const body = req.body;
    const title = body.title;
    const slug = slugify(title, {
      replacement: '-',
      remove: /[*+~.()'"!:@,]/g,
      lower: true
    });
    const content = body.content;
    const featured = body.featured;
    if (req.file) {
      image = req.file.filename;
    }
    const tag = body.tag;

    // Saving New Post
    const newPost = new Post({
      title,
      slug,
      content,
      image,
      userId,
      featured,
      tag
    });

    // Check if title already exists for insertion
    Post.findByTitle(title).then(exists => {
      if (exists) {
        req.flash('error', {
          msg: 'Title already exists! Please choose another title.'
        });
        return res.redirect('/posts/add');
      }
      newPost
        .save()
        .then(() => {
          req.flash('success', 'Added post successfully');
          return res.redirect('/posts');
        })
        .catch(_err => {
          req.flash('error', { msg: 'Unable to add post into database!!!' });
          return res.redirect('/posts');
        });
    });
  });
});

// GET /post (Single post)
router.get('/:slug', (req, res) => {
  const slug = req.params.slug;
  Post.findBySlug(slug)
    .then(post => {
      User.findById(post.userId)
        .then(author => {
          res.render('posts/post', {
            layout: 'postLayout',
            showTitle: post.title,
            post,
            author,
            error: req.flash('error'),
            success: req.flash('success')
          });
        })
        .catch(_err => {
          req.flash('error', { msg: 'Unable to find author!!!' });
          return res.redirect(`/posts/${post.id}`);
        });
    })
    .catch(_err => {
      req.flash('error', { msg: 'Unable to find post!!!' });
      return res.redirect('/posts');
    });
});

// GET /post/edit (GET Edit post)
router.get('/edit/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Post.findById(id)
    .then(post => {
      res.render('posts/edit', {
        layout: 'postLayout',
        showTitle: `Edit - ${post.title}`,
        post,
        featured: post.featured,
        error: req.flash('error')
      });
    })
    .catch(_err => {
      req.flash('error', { msg: 'Unable to find post to edit!!!' });
      return res.redirect('/posts');
    });
});

// PUT /post/edit (Edit post)
router.put('/edit/:id', authenticate, upload, (req, res) => {
  const id = req.params.id;

  const body = req.body;

  const title = body.title;
  const content = body.content;

  const featured = body.featured;
  const updatedAt = new Date();
  let image;
  const slug = slugify(title, {
    remove: /[*+~.()'"!:@,]/g,
    replacement: '-',
    lower: true
  });

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  // Check if title and body are completely changed
  Post.findById(id)
    .then(existingPost => {
      var contentSimilarity = stringSimilarity.compareTwoStrings(
        _.toString(existingPost.content),
        _.toString(content)
      );

      var titleSimilarity = stringSimilarity.compareTwoStrings(
        _.toString(existingPost.title),
        _.toString(title)
      );

      if (contentSimilarity < 0.5) {
        req.flash('error', {
          msg:
            'You cannot change the whole content!!! Create a new post instead.'
        });
        return res.redirect(`/posts/edit/${id}`);
      }

      if (titleSimilarity < 0.5) {
        req.flash('error', {
          msg: 'You cannot change the whole title!!! Create a new post instead.'
        });
        return res.redirect(`/posts/edit/${id}`);
      }

      if (req.file) {
        image = req.file.filename;
        Post.findImgById(id).then(dbImg => {
          if (dbImg) {
            fs.unlink(`${uploadPath}${dbImg.image}`, err => {
              if (err) {
                return req.flash('error', `${err}`);
              }
            });
            Post.findByIdAndUpdate(id, {
              $set: {
                title,
                content,
                featured,
                slug,
                image,
                updatedAt
              }
            })
              .then(() => {
                req.flash('success', 'Updated successfully');
                return res.redirect(`/posts/${slug}`);
              })
              .catch(_err => {
                req.flash('error', { msg: 'Unable to update post!!!' });
                return res.redirect(`/posts/${slug}`);
              });
          }
        });
      } else {
        Post.findImgById(id).then(dbImg => {
          Post.findByIdAndUpdate(id, {
            $set: {
              title,
              content,
              featured,
              slug,
              dbImg,
              updatedAt
            }
          })
            .then(() => {
              req.flash('success', 'Updated successfully');
              return res.redirect(`/posts/${slug}`);
            })
            .catch(_err => {
              req.flash('error', { msg: 'Unable to update post!!!' });
              return res.redirect(`/posts/${slug}`);
            });
        });
      }
    })
    .catch(_err => {
      req.flash('error', { msg: 'Unable to compare!!!' });
      return res.redirect('/posts');
    });
});

// DELETE /post/delete (DELETE Edit post)
router.delete('/delete/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Post.findByIdAndRemove(id)
    .then(post => {
      if (post) {
        fs.unlink(`${uploadPath}${post.image}`, err => {
          if (err) {
            return req.flash('error', `${err}`);
          }
        });
        req.flash('success', 'Deleted successfully');
        return res.redirect('/posts');
      }
    })
    .catch(_err => {
      req.flash('error', { msg: 'Unable to delete post!!!' });
      return res.redirect('/posts');
    });
});

module.exports = router;
