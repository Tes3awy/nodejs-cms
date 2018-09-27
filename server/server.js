require('dotenv').config();

const path = require('path');

const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');

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
const tagsRoutes = require('./routes/tag');

const methodOverride = require('method-override');

const flash = require('connect-flash');

const helmet = require('helmet');
const compression = require('compression');

const logger = require('morgan');
const errorhandler = require('errorhandler');

const _ = require('lodash');
const moment = require('moment');
const sanitizeHtml = require('sanitize-html');

const publicPath = './../public';
const port = process.env.PORT || 3000;

// Serve Favicon Middleware
app.use(favicon(path.join(__dirname, publicPath, 'favicon.ico')));
// Serve Statics Middleware
app.use(
  serveStatic(path.join(__dirname, publicPath), {
    dotfiles: 'deny'
  })
);

/** Middlewares */
// Helmet Middleware (For Security Best Pratcices)
app.use(helmet());
// Express Middlware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Compression Middleware
app.use(compression({ level: 1 }));
// Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: 'sessionid',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 3600000,
      expires: new Date(Date.now() + 3600000)
    }
  })
);
// Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());
// Flash Middleware
app.use(flash());
// Error Handler
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  app.use(errorhandler());
}
// Global Vars
app.use(function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});
// Morgan Middleware
app.use(logger('dev'));
// Exp-hbs View Engine Middleware
app.engine(
  'hbs',
  hbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: 'views/partials',
    layoutsDir: 'views/layouts',
    // express-handlebars helper functions
    helpers: {
      getPrettyDate(date) {
        return moment(date).format('lll');
      },
      prettyCreatedAt(date) {
        return moment(date).format('ll');
      },
      getToday() {
        return moment().format('MMMM Do YYYY');
      },
      getCurrentYear() {
        return new Date().getFullYear();
      },
      truncateText(content) {
        return _.truncate(content, { length: 200 });
      },
      descriptionTruncate(description) {
        return _.truncate(description, { length: 220 });
      },
      titleTruncate(title) {
        return _.truncate(title, { length: 42 });
      },
      capitalize(tag) {
        return _.capitalize(tag);
      },
      sanitizeHtml(html) {
        return sanitizeHtml(_.truncate(html, { length: 250 }), {
          allowedTags: [],
          allowedAttributes: [],
          parser: {
            lowerCaseTags: true,
            decodeEntities: true
          }
        });
      },
      if_eq(a, b, opts) {
        if (a === b) {
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
// Routes
app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/posts', postsRoutes);
app.use('/tag', tagsRoutes);

// Serving locally on port 3000
app.listen(port, '127.0.0.1', () => {
  console.log(`Server started on port ${port}`);
  console.log('NODE_ENV:', `${process.env.NODE_ENV} environment`);
});

module.exports = {
  app
};
