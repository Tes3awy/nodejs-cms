const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');

const _ = require('lodash');

const { mongoose } = require('./../db/mongoose');
const { User } = require('./../models/User');
const bcrypt = require('bcryptjs');

const { passportConfig } = require('./../middlewares/passport');
const passport = require('passport');

const { check, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const gravatar = require('gravatar');

const keys = require('./../../config/credentials');

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
    showTitle: 'Login page',
    message: req.flash('error'),
    success: req.flash('success')
  });
});

// POST /auth/register
router.post('/register', [
  check('name', 'Name must be at least 5 characters').isLength({ min: 5 }).escape().trim(),
  check('email', 'This is not an email address!!!').isEmail().normalizeEmail({'all_lowercase': false, 'gmail_remove_dots': false, 'outlookdotcom_lowercase': false}).escape().trim(),
  check('password', 'Password cannot be less than 5 characters').isLength({min: 5}),
  check('confPassword', 'Confirm password must have the same value as the password!!!').custom((value, { req }) => value === req.body.password)
], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors = _.map(errors.array(), (errs) => { return _.pick(errs, 'msg'); });
    req.flash('error', errors);
    return res.redirect('/auth/register');
  }

  const email = req.body.email;
  const name = req.body.name;
  const image = gravatar.url(email, {s: '200', r: 'pg', d: 'retro'}, false);
  const password = req.body.password;

  var hash = _.random(0, 1000, false) + 54;
  var link = `${req.protocol}://${req.get('host')}/auth/verify/${hash}`;

  const newUser = new User({
    name,
    email,
    gravatar: image,
    password,
    hash
  });

  User.findOne({ email }).then(user => {
      if (user) {
        req.flash('error', { msg: 'Email is already registered!!!' });
        return res.redirect('/auth/register');
      }

      bcrypt.genSalt(10, (_err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          }

          newUser.password = hash;

          newUser.save().then(user => {
            req.flash('success', 'Registered successfully. Verify your account and you are ready to login.')
            return res.redirect('/auth/login');
          }).catch(err => {
            throw err;
          });
        });
      });
    }).catch(err => {
      throw err;
    });

    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: keys.account.user,
          pass: keys.account.pass
        }
      });

      // setup email data with unicode symbols
      let mailOptions = {
        from: '"Tes official website" <no_reply@tes3awy.com>', //sender address
        to: `${email}`, // list of receivers
        subject: 'Please verify your email account', //subject line
        text: 'Verify your account', // plain text body
        html: `Hello,<br> Please Click on the link to verify your email address.<br><a href="${link}" target="_blank">Click here to verify</a>` // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
          return console.log('Send mail error:', error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview url: %s', nodemailer.getTestMessageUrl(info));
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      });
    });
});

router.get('/verify/:hash', (req, res) => {
  var hash = req.params.hash;
  console.log('verify hash: %s', hash);
  // Compare both hashes
  // Get this user from DB to change `active` to true
  req.flash('Account verified.');
  return res.redirect('/auth/login');
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
  req.flash('success', 'Bye bye. See you soon!');
  res.redirect('/auth/login');
});

module.exports = router;
