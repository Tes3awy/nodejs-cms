const express = require('express');
const router = express.Router();

const authenticate = require('./../middlewares/authenticate');

router.get('/profile', authenticate, (req, res) => {
  res.render('user/profile', {
    showTitle: 'Profile page',
    user: req.user
  });
});

router.post('/edit', authenticate, (req, res) => {
  res.render('user/edit', {
    showTitle: 'Edit profile',
    user: req.user
  });
});

module.exports = router;
