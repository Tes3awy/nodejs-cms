const express = require('express');
const router = express.Router();

const authenticate = require('./../middlewares/authenticate');

router.get('/profile', authenticate, (req, res) => {
  res.render('user/profile', {
    showTitle: 'Profile',
    user: req.user
  });
});

module.exports = router;
