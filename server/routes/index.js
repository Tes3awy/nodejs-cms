const express = require('express');
const router = express.Router();

const { mongoose } = require('./../db/mongoose');
const { Post } = require('./../models/Post');
const { User } = require('./../models/User');
const { Contact } = require('./../models/Contact');

const nodemailer = require('nodemailer');
const keys = require('./../../config/credentials');

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
      baseUrl: req.baseUrl,
      user: req.user
    });
  });
});

// GET /about
router.get('/about', (req, res) => {
  res.render('about', {
    showTitle: 'About page',
    user: req.user
  });
});

// GET /contact
router.get('/contact', (req, res) => {
  res.render('contact', {
    showTitle: 'Contact page',
    user: req.user,
    error: req.flash('error'),
    success: req.flash('success')
  });
});

// POST /contact
router.post('/contact', function (req, res) {
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
      user: keys.account.user,
      pass: keys.account.pass
    }
  }

  let transporter = nodemailer.createTransport(smtpConfig);

  let mailOptions = {
    from: `${name} <${sender}>`, // sender address
    to: keys.account.user, // list of receivers
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
    showTitle: 'Terms and Conditions page',
    user: req.user
  });
});

module.exports = router;
