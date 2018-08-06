const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const { mongoose } = require('./../db/mongoose');
const { User } = require('./../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) => {
      User.findOne({ email }).then((err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'Email is not registered!!!' });
        }
        bcrypt.compare(password, user.password, (err, res) => {
          if (err) {
            throw err;
          }
          if (!res) {
            return done(null, false, { message: 'Password is incorrect!!!' });
          }
          return done(null, user);
        });
      });
    }
  )
);
