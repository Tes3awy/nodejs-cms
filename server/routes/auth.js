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

const gravatar = require('gravatar');

const keys = require('./../../config/credentials');

const authenticate = require('./../middlewares/authenticate');

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register', {
    layout: 'login-register',
    showTitle: 'Register page',
    errors: req.flash('error')
  });
});

// GET /auth/login
router.get('/login', (req, res) => {
  res.render('auth/login', {
    layout: 'login-register',
    showTitle: 'Login page',
    error: req.flash('error'),
    success: req.flash('success'),
    info: req.flash('info')
  });
});

// POST /auth/register
router.post('/register', [
  check('name', 'Name must be at least 5 characters').isLength({ min: 5 }).escape().trim(),
  check('email', 'Email is a required field').isEmail().normalizeEmail({'all_lowercase': false, 'gmail_remove_dots': false, 'outlookdotcom_lowercase': false}).escape().trim(),
  check('password', 'Password cannot be less than 5 characters').isLength({min: 5}),
  check('confPassword', 'Confirm password must have the same value as the password!!!').custom((value, { req }) => value === req.body.password)
], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    errors = _.map(errors.array(), (err) => { return _.pick(err, 'msg'); });
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
            req.flash('success', `Registered successfully. An e-mail has been sent to ${email} with further instructions.`)
            return res.redirect('/auth/login');
          }).catch(err => {
            throw err;
          });
        });
      });
    }).catch(err => {
      throw err;
    });

    // NodeMailer
    // create reusable transporter object using the default SMTP transport
    let smtpConfig = {
      host: 'vmegypt.webserversystems.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        type: 'login',
        user: keys.account.user,
        pass: keys.account.pass
      }
    }

    let transporter = nodemailer.createTransport(smtpConfig);

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Tes official website" <oabbas@vm.com.eg>', //sender address
      to: `${email}`, // list of receivers
      subject: 'Please verify your email account', //subject line
      html: `Hello ${name},<br> Please click on the link to verify your account.<br><a href="${link}" target="_blank">Click here to verify</a>` // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if(error) {
        return console.log('Send mail error:', error);
      }
      console.log('Message sent: %s', info.messageId);
      console.log('Envelope sent: %s', info.envelope);
      console.log('Accepted: %s', info.accepted);
      console.log('Rejected: %s', info.rejected);
      console.log('Pending: %s', info.pending);
      console.log('Response: %s', response);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    });
});

router.get('/verify/:ciphertext', (req, res) => {
  // Decrypt
  var ciphertext = req.params.ciphertext;
  var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), keys.verify.secret);
  var plainEmail = bytes.toString(CryptoJS.enc.Utf8);

  User.findOneAndUpdate({ email: plainEmail }, { $set: { verified: true, hash: "" } }, { new: true }).then(user => {
    if(user) {
      req.flash('success', 'Account verified.');
      return res.redirect('/auth/login');
    }
  }).catch(err => {
    req.flash('error', 'Unable to verify account!!!');
    return res.redirect('/auth/login');
  });
});

// POST /auth/login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// GET /auth/forget
router.get('/forget', (req, res) => {
  res.render('auth/forget', {
    showTitle: 'Forget password page'
  });
});

// POST /auth/forget
router.post('/forget', (req, res) => {
  const email = req.body.email;
  console.log('Email:', email);
});

// GET /auth/logout
router.get('/logout', authenticate, (req, res) => {
  req.logout();
  req.flash('info', 'Bye bye. See you soon!');
  return res.redirect('/auth/login');
});

module.exports = router;
