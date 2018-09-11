const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();

const slugify = require('slugify')
// const swal = require('sweetalert2');

const { check, validationResult } = require('express-validator/check');

const { ObjectID } = require('mongodb');

const { mongoose } = require('./../db/mongoose');
const { Post } = require('./../models/Post');
const { User } = require('./../models/User');
const { Tag } = require('./../models/Tag');

const uploadPath = path.join(__dirname, './../../public/uploads/');

const multer = require('multer');
const storage = multer.diskStorage({
  destination: (_req, _file, done) => {
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
  Post.find().sort({featured: -1, createdAt: -1}).then(posts => {
    res.render('posts/posts', {
      showTitle: 'Posts',
      layout: 'postsLayout',
      posts,
      error: req.flash('error'),
      success: req.flash('success')
    });
  }).catch(err => {
    req.flash('error', 'Unable to fetch posts!!!');
    return res.redirect('/posts');
  });
});

// GET /posts/add
router.get('/add', authenticate, (req, res) => {
  Tag.find().then(tag => {
    res.render('posts/add', {
      showTitle: 'Add post',
      layout: 'postsLayout',
      tag,
      error: req.flash('error'),
      success: req.flash('success')
    });
  });
});

// POST /posts/add
const postUpload = upload.single('image');
router.post('/add', authenticate, postUpload,
  [
    check('title')
      .isLength({ min: 10 })
      .trim()
      .withMessage('Title cannot be less than 10 characters'),
    check('content')
      .isLength({ min: 300 })
      .trim()
      .withMessage('Post content cannot be less than 300 characters')
  ], (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors = errors.array();
      req.flash('error', errors);
      return res.redirect('/posts/add');
    }

    const userId = req.user.id;

    const body = req.body;

    const title = body.title;
    const slug = slugify(title, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
    const content = body.content;
    const featured = body.featured;
    const image = req.file.filename;
    const tag = body.tag;

    const newPost = new Post({
      title,
      slug,
      content,
      image,
      userId,
      featured,
      postTag: tag
    });
    // Check if title already exists for insertion
    Post.findOne({ title }).then(exists => {
      if(exists) {
        req.flash('error', { msg: 'Title already exists! Please choose another title.' });
        return res.redirect('/posts/add');
      }
      newPost.save().then(() => {
        req.flash('success', 'Added post successfully');
        return res.redirect('/posts');
      })
      .catch(err => {
        req.flash('error', 'Unable to add post into database!!!');
        return res.redirect('/posts');
      });
    });
  }
);

// GET /post (Single post)
router.get('/:slug', (req, res) => {
  const slug = req.params.slug;
  // console.log('post slug:', slug);
  Post.findBySlug(slug).then(post => {
    User.findById(post.userId).then(author => {
        res.render('posts/post', {
          layout: 'postsLayout',
          showTitle: post.title,
          post,
          author
      });
    }).catch(err => {
      req.flash('error', 'Unable to find author!!!');
      return res.redirect(`/posts/${post.id}`);
    });
  }).catch(err => {
    req.flash('error', 'Unable to find post!!!');
    return res.redirect('/posts');
  });
});

// GET /post/edit (GET Edit post)
router.get('/edit/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Post.findById(id).then(post => {
      res.render('posts/edit', {
        layout: 'postsLayout',
        showTitle: `Edit - ${post.title}`,
        post
    });
  }).catch(err => {
    req.flash('error', 'Unable to find post to edit!!!');
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
    const slug = slugify(title, {
      replacement: '-',
      remove: /[*+~.()'"!:@]/g,
      lower: true
    });
    const updatedAt = new Date();
    let image;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    if(!req.file) {
      Post.findImgById(id).then(dbImg => {
        Post.findByIdAndUpdate(id, { $set: { title, content, featured, slug, dbImg, updatedAt } }).then(post => {
          req.flash('success', 'Updated successfully');
          return res.redirect('/posts');
        }).catch(err => {
          req.flash('error', 'Unable to update post!!!');
          return res.redirect('/posts');
        });
      });
    } else {
      image = req.file.filename;
      Post.findByIdAndUpdate(id, { $set: { title, content, featured, slug, image, updatedAt } }).then(post => {
        req.flash('success', 'Updated successfully');
        return res.redirect('/posts');
      }).catch(err => {
        req.flash('error', 'Unable to update post!!!');
        return res.redirect('/posts');
      });
    }
  }
);

// DELETE /post/delete (DELETE Edit post)
router.delete('/delete/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Post.findByIdAndRemove(id).then(post => {
    if(post) {
      fs.unlink(`${uploadPath}${post.image}`, (err) => {
        if(err) {
          return req.flash('error', `${err}`);
        }
      });
      req.flash('success', 'Deleted successfully');
      return res.redirect('/posts');
    }
  }).catch(err => {
    req.flash('error', 'Unable to delete post!!!');
    return res.redirect('/posts');
  });
});

module.exports = router;
