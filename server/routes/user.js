const express = require('express');
const router = express.Router();

const { mongoose } = require('./../db/mongoose');
const { User } = require('./../models/User');

const { LookIP } = require('./../middlewares/geolocation');

const authenticate = require('./../middlewares/authenticate');

// GET user/profile
router.get('/profile', authenticate, (req, res) => {
  const getIP = () => {
    return LookIP.then(ip => {
      return ip;
    });
  }
  const getLocation = async () => {
    const location = await getIP();
    return location;
  };

  getLocation().then(location => {
    if(location.data.status === "success") {
      const country = location.data.country;
      const city = location.data.city;
      res.render('user/profile', {
        showTitle: 'Profile page',
        city,
        country
      });
    }
  });
});

// GET user/edit
router.post('/edit', authenticate, (req, res) => {
  res.render('user/edit', {
    showTitle: 'Edit profile'
  });
});

// GET user/delete
router.delete('/delete/:id', authenticate, (req, res) => {
  const id = req.params.id;

  User.findByIdAndRemove(id).then(user => {
    req.flash('warning', 'We are sorry to see you leaving.');
    return res.redirect('/');
  }).catch(err => {
    req.flash('error', 'Unable to delete your account right now');
    return res.redirect('/user/profile');
  });

  console.log('id:', id);
  res.redirect('/user/profile');
});

module.exports = router;
