const express = require('express');
const router = express.Router();

const { mongoose } = require('./../db/mongoose');
const { User } = require('./../models/User');

const axios = require('axios');

const { LookIP } = require('./../middlewares/geolocation');

const authenticate = require('./../middlewares/authenticate');

// GET user/profile
router.get('/profile', authenticate, (req, res) => {

  var getIP = () => {
    return LookIP.then(ip => {
      return ip;
    });
  }
  var getLocation = async () => {
    const location = await getIP();
    return location;
  };

  const apiKey = process.env.LOCATION_API;
  var ipStack = () => {
    axios.get(`http://api.ipstack.com/check?security=1&access_key=${apiKey}`).then(response => {
      if(response.status === 200) {
        console.log('ipstack data:', response.data);
        return response.data;
      }
    });

    // const apiKey = process.env.LOCATION_API;
    // request(`http://api.ipstack.com/check?security=1&access_key=${apiKey}`, (err, response, body) => {
    //   if(err === null) {
    //     return JSON.parse(response.body);
    //   }
    // });
  }


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
router.get('/edit/:id', authenticate, (req, res) => {
  const id = req.params.id;
  User.findById(id).then(user => {
    res.render('user/edit', {
      showTitle: 'Update profile',
      id,
      user,
      errors: req.flash('error')
    });
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

  res.redirect('/');
});

module.exports = router;
