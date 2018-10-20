const express = require('express');
const router = express.Router();

const { mongoose } = require('../db/mongoose');
const { Tag } = require('../models/Tag');

const _ = require('lodash');

const authenticate = require('../middlewares/authenticate');

router.get('/add', authenticate, (req, res) => {
  Tag.find().then(tag => {
    res.render('tag/add', {
      showTitle: 'Add Tag',
      tag,
      success: req.flash('success'),
      error: req.flash('error')
    });
  });
});

router.post('/add', (req, res) => {
  const tag = _.toLower(req.body.tagName);
  const newTag = new Tag({
    tag
  });
  newTag
    .save()
    .then(() => {
      req.flash('success', 'Tag added');
      return res.redirect('/tag/add');
    })
    .catch(_err => {
      req.flash('error', 'Tag already exists');
      return res.redirect('/tag/add');
    });
});

module.exports = router;
