require('dotenv').config();
const path = require('path');

const express = require('express');
const app = express();

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

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
const cors = require('cors');

const logger = require('morgan');
const errorhandler = require('errorhandler');
const notifier = require('node-notifier');

const _ = require('lodash');
const moment = require('moment');
const sanitizeHtml = require('sanitize-html');
const ms = require('ms');

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
// app.use(
//   helmet({
//     referrerPolicy: true,
//     noCache: true,
//     expectCt: true,
//     crossdomain: true,
//     isNoOpen: true
//   })
// );
// Express Middlware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Compression Middleware
app.use(compression({ level: 3 }));
// CORS Middleware
app.use(cors({
  origin: 'localhost:3000',
  optionsSuccessStatus: 200
}));
// Session Middleware
app.use(
  session({
    secret: '123',
    name: 'sessionid',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: ms('14 days'),
      expires: new Date(Date.now() + ms('14 days'))
    },
    store: new MongoStore({
      url: 'mongodb://localhost:27017/LoginApp',
      autoRemove: 'native',
      ttl: ms('14 days') / 1000,
      touchAfter: ms('1d') / 1000 // to be updated every 24 hours only
    })
  })
);
// Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());
// Flash Middleware
app.use(flash());
// Error Handler
if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler({ log: errorNotification }));
}
// Custom Error Handler (Notification)
var errorNotification = (_err, message, req) => {
  const title = `Error in ${req.method} ${req.url}`;
  notifier.notify({
    title,
    message
  });
};
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
  notifier.notify({
    title: 'Server is up and running',
    message: `Server started on port ${port}`
  });
});

module.exports = {
  app
};
