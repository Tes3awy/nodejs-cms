const express = require('express');
const router = express.Router();

const authenticate = require('./../middlewares/authenticate');

router.get('/', authenticate, (req, res) => {
  res.render('posts/posts', {
    showTitle: 'Posts',
    layout: 'postsLayout',
    user: req.user
  });
});

module.exports = router;
