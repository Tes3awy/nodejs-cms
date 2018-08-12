const path = require('path');
const parseurl = require('parseurl');

const express = require('express');
const router = express.Router();

const { mongoose } = require('./../db/mongoose');
const { Post } = require('./../models/Post');
const { User } = require('./../models/User');

router.get('/', (req, res) => {
  // if (req.session.views) {
  //   return req.session.views++;
  // }
  // req.session.views = 1
  // var pathname = parseurl(req).pathname;
  // console.log('pathname:', pathname);
  // console.log('req.sessionID:', req.sessionID);
  // console.log('req.session.cookie:', req.session.cookie);
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
      showTitle: 'Homepage',
      posts,
      users,
      // views: req.session.views
    });
  });
});

module.exports = router;
