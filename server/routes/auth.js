const express = require('express');
const router = express.Router();

const { mongoose } = require('./../db/mongoose');
const { User } = require('./../models/User');
const bcrypt = require('bcryptjs');

const passport = require('passport');
const { passportConfig } = require('./../middlewares/passport');

const authenticate = require('./../middlewares/authenticate');

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register', {
    layout: 'login-register',
    showTitle: 'Register page'
  });
});

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('auth/login', {
    layout: 'login-register',
    showTitle: 'Login page'
  });
});

// POST /auth/register
router.post('/register', (req, res) => {
    const email = req.body.email;

    User.findOne({ email: email })
      .then(user => {
        if (user) {
          return res.redirect('/auth/register');
        }

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          username: req.body.username,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err;
            }

            newUser.password = hash;

            newUser.save().then(user => {
                return res.redirect('/auth/login');
              }).catch(err => {
                throw err;
              });
          });
        });
      }).catch(err => {
        throw err;
      });
  },
);

// POST /auth/login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// GET /auth/logout
router.get('/logout', authenticate, (req, res) => {
  req.logout();
  res.redirect('/auth/login');
});

module.exports = router;
