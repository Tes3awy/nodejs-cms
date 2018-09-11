const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');

const _ = require('lodash');

const { mongoose } = require('./../db/mongoose');
const { User } = require('./../models/User');

const CryptoJS = require("crypto-js");

const { passportConfig } = require('./../middlewares/passport');
const passport = require('passport');

const { check, validationResult } = require('express-validator/check');

const gravatar = require('gravatar');

const request = require('request');

const authenticate = require('./../middlewares/authenticate');

// GET /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register', {
    layout: 'login-register',
    showTitle: 'Register page',
    errors: req.flash('error'),
    captcha: req.flash('captchaError')
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
    req.flash('error', errors.array());
    return res.redirect('/auth/register');
  }

  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    req.flash('captchaError', 'reCAPTCHA cannot be left unverified');
    return res.redirect('/auth/register');
  }

  const secretKey = process.env.RECATPCHA_SECRET;

  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&remoteip=${req.connection.remoteAddress}&response=${req.body['g-recaptcha-response']}`;

  request(verifyURL, (err, response, body) => {
    const verify = JSON.parse(body);
    if(!verify.success) {
      req.flash('captchaError', 'Unable to verify reCAPTCHA');
      return res.redirect('/auth/register');
    }
  });

  const email = req.body.email;
  const name = _.startCase(_.toLower(req.body.name));
  const image = gravatar.url(email, {s: '600', r: 'pg', d: 'retro'}, false);
  const password = req.body.password;

  // Ciphering
  var ciphertext = encodeURIComponent(CryptoJS.AES.encrypt(email, process.env.EMAIL_VERIFY));
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
        req.flash('error', 'Email is already registered!!!');
        return res.redirect('/auth/register');
      }

      newUser.save().then(() => {
        req.flash('success', `Registered successfully. An e-mail has been sent to ${email} with further instructions.`)
        return res.redirect('/auth/login');
      }).catch(err => {
        throw err;
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
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD
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
    });
});

router.get('/verify/:ciphertext', (req, res) => {
  // Deciphering
  const ciphertext = req.params.ciphertext;
  const bytes = CryptoJS.AES.decrypt(ciphertext.toString(), process.env.EMAIL_VERIFY);
  const plainEmail = bytes.toString(CryptoJS.enc.Utf8);

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
    showTitle: 'Forget password page',
    success: req.flash('success'),
    error: req.flash('error')
  });
});

// POST /auth/forget
router.post('/forget', [
  check('email', 'Email is a required field').isEmail().normalizeEmail({'all_lowercase': false, 'gmail_remove_dots': false, 'outlookdotcom_lowercase': false}).escape().trim()
], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('error', errors.array());
    return res.redirect('/auth/forget');
  }

  const email = req.body.email;

  User.findOne({ email }).then(user => {
    if(!user) {
      req.flash('error', { msg: 'This email is not registered!!!' });
      return res.redirect('/auth/forget');
    }

    const email = user.email;
    const name = user.name;
    // Ciphering
    var ciphertext = encodeURIComponent(CryptoJS.AES.encrypt(email, process.env.RESET_PASSWORD  ));
    const link = `${req.protocol}://${req.get('host')}/auth/reset/${ciphertext}`;

    // create reusable transporter object using the default SMTP transport
    let smtpConfig = {
      host: 'vmegypt.webserversystems.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD
      }
    }

    let transporter = nodemailer.createTransport(smtpConfig);

    let mailOptions = {
      from: '"Tes official website" <oabbas@vm.com.eg>', //sender address
      to: `${email}`, // list of receivers
      subject: 'Reset your password', //subject line
      html: `Hello ${name},<br> Please click on the link to reset your password.<br><a href="${link}" target="_blank">Click here to reset your password.</a><br> If it's not you who requested your password reset, you can just ignore this email.` // html body
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
    });
    req.flash('success', `Email has been sent to ${email}. Don't forget to check your spam folder if you can't find the email.`);
    return res.redirect('/auth/forget');
  }).catch(err => {
    req.flash('error', 'Cannot get your email from DB right now! Try again in a moment');
    return res.redirect('/auth/forget');
  });
});

// GET /auth/reset
router.get('/reset/:ciphertext', (req, res) => {
  // Deciphering
  const ciphertext = req.params.ciphertext;
  const bytes = CryptoJS.AES.decrypt(ciphertext.toString(), process.env.EMAIL_VERIFY);
  const plainEmail = bytes.toString(CryptoJS.enc.Utf8);

  res.render('auth/reset', {
    showTitle: 'Reset password',
    email: plainEmail,
    ciphertext
  });
});

// POST /auth/reset
router.put('/reset/:ciphertext', [
  check('newPassword', 'Password cannot be less than 6 characters').isLength({min: 6}),
  check('confPassword', 'Confirm password must have the same value as the password!!!').custom((value, { req }) => value === req.body.password)
] ,(req, res) => {

  const email = req.body.email;
  const newPassword = req.body.newPassword;

  User.findOneAndUpdate({ email },
    { $set: { password: newPassword } },
    { new: true }).then(user => {
      if(user) {
        req.flash('success', 'Password updated successfully.');
        return res.redirect('/auth/login');
      }
    }).catch(err => {
      req.flash('error', 'Couldn\'t update your password right now. Please try again in a moment');
      return res.redirect('/auth/login');
    });
});

// GET /auth/logout
router.get('/logout', authenticate, (req, res) => {
  req.logout();
  req.flash('info', 'Bye bye. See you soon!');
  return res.redirect('/auth/login');
});

module.exports = router;
