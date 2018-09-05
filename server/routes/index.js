const express = require('express');
const router = express.Router();

const { mongoose } = require('./../db/mongoose');
const { Post } = require('./../models/Post');
const { User } = require('./../models/User');
const { Contact } = require('./../models/Contact');

const request = require('request');

const { check, validationResult } = require('express-validator/check');

const nodemailer = require('nodemailer');

// GET /
router.get('/', (req, res) => {
  var getPostsCount = () => {
    return Post.countDocuments({}).then(posts => {
      return posts;
    });
  }

  var getUserCount = () => {
    return User.countDocuments({}).then(users => {
      return users;
    });
  }

  var getCounts = async () => {
    const posts = await getPostsCount();
    const users = await getUserCount();

    return [posts, users];
  }

  getCounts().then(counts => {
    var posts = counts[0];
    var users = counts[1];
    res.render('home', {
      showTitle: 'Home page',
      posts,
      users,
      leaving: req.flash('warning')
    });
  });
});

// GET /about
router.get('/about', (req, res) => {
  res.render('about', {
    showTitle: 'About page',
  });
});

// GET /contact
router.get('/contact', (req, res) => {
  res.render('contact', {
    showTitle: 'Contact page',
    errors: req.flash('error'),
    captcha: req.flash('captchaError'),
    success: req.flash('success')
  });
});

// POST /contact
router.post('/contact', [
  check('name', 'Full name must be at least 5 characters').isLength({ min: 5 }).escape().trim(),
  check('subject', 'Subject must be at least 5 characters').isLength({ min: 5 }).escape().trim(),
  check('email', 'Email is a required field').isEmail().normalizeEmail({'all_lowercase': false, 'gmail_remove_dots': false, 'outlookdotcom_lowercase': false}).escape().trim(),
  check('message', 'Message must be between 50 to 500 characters').isLength({min: 50, max: 500}).escape().trim(),
], function (req, res) {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
      req.flash('error', errors.array());
      req.flash('captchaError', 'reCAPTCHA cannot be left unverified');
      return res.redirect('/contact');
    }
  }

  const secretKey = process.env.RECATPCHA_SECRET;

  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&remoteip=${req.connection.remoteAddress}&response=${req.body['g-recaptcha-response']}`;

  request(verifyURL, (err, response, body) => {
    const verify = JSON.parse(body);
    console.log('verifying recaptcha:', verify);
    if(!verify.success) {
      req.flash('captchaError', 'Unable to verify reCAPTCHA');
      return res.redirect('/contact');
    }
  });

  const name = req.body.name;
  const sender = req.body.email;
  const subject = req.body.subject;
  const message = req.body.message;

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

  let mailOptions = {
    from: `${name} <${sender}>`, // sender address
    to: process.env.EMAIL_ACCOUNT, // list of receivers
    subject: `${subject}`, // Subject line
    text: `${message}`, // plain text body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.flash('error', 'Unable to send your message right now. Please try again in a while');
      console.log(error);
      return res.redirect('/contact');
    }
    const newContact = new Contact({
      name,
      sender,
      message
    });
    console.log('Message sent: %s', info.messageId);

    newContact.save().then(sender => {
      console.log('Sender:', sender);
    }).catch(err => {
      console.log('Unable to add sender to database');
    })
    req.flash('success', 'Message sent.');
    return res.redirect('/contact');
  });
});

// GET /terms
router.get('/terms', (req, res) => {
  res.render('terms', {
    showTitle: 'Terms and Conditions page'
  });
});

module.exports = router;
