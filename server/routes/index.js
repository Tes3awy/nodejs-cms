const express = require('express');
const router = express.Router();

const authenticate = require('./../middlewares/authenticate');

router.get('/', authenticate, (req, res) => {
  res.render('home', {
    showTitle: 'Homepage'
  });
});

module.exports = router;
