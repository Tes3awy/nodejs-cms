const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');

const _ = require('lodash');

const { mongoose } = require('./../db/mongoose');
const { User } = require('./../models/User');
const bcrypt = require('bcryptjs');

const CryptoJS = require("crypto-js");

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
    error: req.flash('error')
  });
});

router.get('/registered', (req, res) => {
  res.render('auth/registered', {
    layout: 'login-register',
    showTitle: 'Register page',
    error: req.flash('error'),
    success: req.flash('success')
  })
});

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('auth/login', {
    layout: 'login-register',
    showTitle: 'Login page',
    error: req.flash('error'),
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
  const name = _.startCase(_.toLower(req.body.name));
  const image = gravatar.url(email, {s: '200', r: 'pg', d: 'retro'}, false);
  const password = req.body.password;

  // Encrypt
  var ciphertext = encodeURIComponent(CryptoJS.AES.encrypt(email, keys.verify.secret));
  var link = `${req.protocol}://${req.get('host')}/auth/verify/${ciphertext}`;

  const newUser = new User({
    name,
    email,
    gravatar: image,
    password,
    hash: ciphertext
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
            req.flash('success', 'Registered successfully. Check your email and verify your new account.')
            return res.redirect('/auth/registered');
          }).catch(err => {
            throw err;
          });
        });
      });
    }).catch(err => {
      throw err;
    });

    nodemailer.createTestAccount((err, account) => {
      acc = {
        user: 'oabbas@vm.com.eg',
        pass: 'vme123'
      }
      // create reusable transporter object using the default SMTP transport
      let smtpConfig = {
        host: 'vmegypt.webserversystems.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: acc.user,
          pass: acc.pass
        }
      }
      let transporter = nodemailer.createTransport(smtpConfig);

      // setup email data with unicode symbols
      let mailOptions = {
        from: '"Tes official website" <oabbas@vm.com.eg>', //sender address
        to: `${email}`, // list of receivers
        subject: 'Please verify your email account', //subject line
        html: `Hello ${name},<br> Please click on the link to verify your email address.<br><a href="${link}" target="_blank">Click here to verify</a>` // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
          return console.log('Send mail error:', error);
        }
        console.log('Message sent: %s', info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      });
    });
});

router.get('/verify/:ciphertext', (req, res) => {
  // Decrypt
  var ciphertext = req.params.ciphertext;
  var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), keys.verify.secret);
  var plaintext = bytes.toString(CryptoJS.enc.Utf8);

  User.findOneAndUpdate({ email: plaintext }, { $set: { verified: true, hash: "" } }, { new: true }).then(user => {
    if(user) {
      req.flash('success', 'Account verified.');
      return res.redirect('/auth/registered');
    }
  }).catch(err => {
    req.flash('error', 'Unable to verify account!!!');
    return res.redirect('/auth/registered');
  });
});

// POST /auth/registered
router.post('/registered', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/registered',
  failureFlash: true
}));

// GET /auth/logout
router.get('/logout', authenticate, (req, res) => {
  req.logout();
  req.flash('success', 'Bye bye. See you soon!');
  res.redirect('/auth/registered');
});

module.exports = router;
