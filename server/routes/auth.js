const express = require('express');
const router = express.Router();

const _ = require('lodash');

const { mongoose } = require('./../db/mongoose');
const { User } = require('./../models/User');
const bcrypt = require('bcryptjs');

const { passportConfig } = require('./../middlewares/passport');
const passport = require('passport');

const { check, validationResult, body } = require('express-validator/check');

const authenticate = require('./../middlewares/authenticate');

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register', {
    layout: 'login-register',
    showTitle: 'Register page',
    message: req.flash('error')
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
router.post('/register', [check('name', 'Name cannot be less than 3 characters').isLength({ min: 3 }), check('username', 'Username cannot be less than 3 characters').isLength({ min: 3 }),check('email', 'This is not an email address!!!').isEmail(), check('password', 'Password cannot be less than 5 characters').isLength({min: 5}), check('password', 'Passwords do not match').custom((password, { req }) => {
  if (password !== req.body.confPassword) {
    // req.flash('error', 'Passwords do not match');
  }
}) ], (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors = _.map(errors.array(), (errs) => { return _.pick(errs, 'msg'); });
    console.log(errors);
    req.flash('error', errors);
    return res.redirect('/auth/register');
  }

  const email = req.body.email;
  const name = req.body.name;
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
      if (user) {
        req.flash('error', 'Email is already registered!!!');
        return res.redirect('/auth/register');
      }

      const newUser = new User({
        name,
        email,
        username,
        password
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
});

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
