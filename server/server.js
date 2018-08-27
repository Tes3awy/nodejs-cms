const path = require('path');

const express = require('express');
const app = express();

const compression = require('compression');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/User');

const session = require('express-session');

const { passportConfig } = require('./middlewares/passport');
const passport = require('passport');

const hbs = require('express-handlebars');

const favicon = require('serve-favicon');
const serveStatic = require('serve-static');

const routes = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postsRoutes = require('./routes/posts');

const methodOverride = require('method-override');

const flash = require('connect-flash');

const helmet = require('helmet');

const logger = require('morgan');

const _ = require('lodash');
const moment = require('moment');

const keys = require('./../config/credentials');
const publicPath = './../public';
const port = process.env.PORT || 3000;

// Serve Favicon Middleware
app.use(favicon(path.join(__dirname, publicPath, 'favicon.ico')));
// Serve Statics Middleware
app.use(serveStatic(path.join(__dirname, publicPath), {
  dotfiles: 'deny'
}));

/** Middlewares */
// Express Middlware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Compression Middleware
app.use(compression({ level: 1 }));
// Session Middleware
app.use(session({
  secret: keys.session.secret,
  name: 'sessionid',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000, expires: new Date(Date.now() + 3600000) }
}));
// Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());
// Flash Middleware
app.use(flash());
// Morgan Middleware
app.use(logger('dev'));
// Global Vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  // res.locals.success = req.flash('success');
  // res.locals.error = req.flash('error');
  next();
});
// HBS View Engine Template
app.engine('hbs', hbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: 'views/partials',
    layoutsDir: 'views/layouts',
    helpers: {
      getPrettyDate(date) {
        return moment(date).format('LLL');
      },
      getCurrentYear() {
        return new Date().getFullYear();
      },
      getToday() {
        return moment().format('MMMM Do YYYY');
      },
      truncateText(text) {
        return _.truncate(text, { length: 250 });
      },
      if_eq(a, b, opts) {
        if(a === b) {
          return opts.fn(this);
        } else {
          return opts.inverse(this);
        }
      }
    }
  })
);
app.set('view engine', 'hbs');
// Method Override Middleware
app.use(methodOverride('_method'));
// Helmet Middleware (For Security)
app.use(helmet());
// Routes
app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/posts', postsRoutes);

// Serving locally on port 3000
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});

module.exports = app;
