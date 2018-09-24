const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const { mongoose } = require('./../db/mongoose');
const { User } = require('./../models/User');
const bcrypt = require('bcryptjs');

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) => {
      User.findByEmail(email).then(user => {
        if (!user) {
          return done(
            null,
            false,
            req.flash('error', { msg: 'Email is not registered!!!' })
          );
        }
        if (user.verified === false) {
          return done(
            null,
            false,
            req.flash('error', {
              msg: 'Your email address is not yet verified'
            })
          );
        }
        bcrypt.compare(password, user.password, (err, res) => {
          if (err) {
            throw err;
          }
          if (res) {
            return done(null, user);
          }
          return done(
            null,
            false,
            req.flash('error', { msg: 'Password is incorrect!!!' })
          );
        });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});
