const express = require('express');
const router = express.Router();

const authenticate = require('./../middlewares/authenticate');

router.get('/', (req, res) => {
  // if (req.session.views) {
  //   req.session.views++;
  // } else {
  //   req.session.views = 1;
  // }
  res.render('home', {
    showTitle: 'Homepage',
    user: req.user
  });
});

module.exports = router;
