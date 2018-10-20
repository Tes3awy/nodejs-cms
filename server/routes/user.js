const express = require('express');
const router = express.Router();

const { ObjectID } = require('mongodb');

const { mongoose } = require('../db/mongoose');
const { User } = require('../models/User');

const axios = require('axios');

const authenticate = require('../middlewares/authenticate');

// const swal = require('sweetalert2');

// Require authenticate middleware for all route verbs /user/
router.all('*', authenticate);

// GET user/profile
router.get('/profile/:username', (req, res) => {
  const username = req.params.username;
  console.log('username:', username);

  User.findByUsername(username)
    .then(username => {
      if (username) {
        return ipStack().then(geolocation => {
          const country = geolocation.country_name;
          const flag = geolocation.location.country_flag;
          res.render('user/profile', {
            showTitle: 'Profile page',
            country,
            flag
          });
        });
      }
      req.flash('error', 'Unable to find profile');
      return res.redirect('/');
    })
    .catch(_err => {
      return res.redirect('/');
    });

  var ipStack = () => {
    const apiKey = process.env.LOCATION_API;
    return axios
      .get(`http://api.ipstack.com/check?security=1&access_key=${apiKey}`)
      .then(response => {
        if (response.status === 200) {
          return response.data;
        }
      });
  };
});

// GET user/edit
router.get('/edit/:username', (req, res) => {
  const username = req.params.username;

  User.findByUsername(username).then(user => {
    res.render('user/edit', {
      showTitle: 'Update profile',
      user,
      errors: req.flash('error', 'Unable to find profile')
    });
  });
});

// GET user/delete
router.delete('/delete/:id', (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  User.findByIdAndRemove(id)
    .then(() => {
      req.flash('warning', 'We are sorry to see you leaving.');
      return res.redirect('/');
    })
    .catch(_err => {
      req.flash('error', 'Unable to delete your account right now');
      return res.redirect('/user/profile');
    });
});

module.exports = router;
