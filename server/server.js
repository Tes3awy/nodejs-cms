const path = require('path');

const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/User');

const bodyParser = require('body-parser');

const session = require('express-session');

const { passportConfig } = require('./middlewares/passport');
const passport = require('passport');

const hbs = require('express-handlebars');

const favicon = require('serve-favicon');

const routes = require('./routes/index');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postsRoutes = require('./routes/posts');

const methodOverride = require('method-override');

const flash = require('connect-flash');

const helmet = require('helmet');

// const morgan = require('morgan');

const _ = require('lodash');
const moment = require('moment');
const sanitizeHtml = require('sanitize-html');

const keys = require('./../config/credentials');
const publicPath = './../public';
const port = process.env.PORT || 3000;

// Static Files
app.use(favicon(path.join(__dirname, publicPath, 'favicon.ico')));
app.use(express.static(path.join(__dirname, publicPath)));

/** Middlewares */
// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Session Middleware
app.use(session({
  secret: keys.session.secret,
  name: 'sessionid',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: 'auto', maxAge: 86400000 }
}));
// Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());
// Flash Middleware
app.use(flash());
// Morgan
// app.use(morgan('dev'));
// HBS
app.engine('hbs',
  hbs({
    defaultLayout: 'main',
    extname: '.hbs',
    partialsDir: 'views/partials',
    layoutsDir: 'views/layouts',
    helpers: {
      getCurrentYear() {
        return new Date().getFullYear();
      },
      capitalize(name) {
        return _.startCase(_.toLower(name));
      },
      getToday() {
        return moment().format('MMMM Do YYYY');
      },
      trimString(content) {
        return content.substring(0, 300);
      },
      htmlDecode(content) {
        var content = _.unescape(content);
        return sanitizeHtml(content, {
          allowedTags: ['b', 'i', 'em', 'strong', 'a'],
          allowedAttributes: {
            'a': ['href', 'title', 'target'],
            'img': ['alt', 'title', 'src']
          }
        });
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
// Method Override
app.use(methodOverride('_method'));
// Helmet (For Security)
app.use(helmet());
// Global Vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  // res.locals.success = req.flash('success');
  // res.locals.error = req.flash('error');
  next();
});
// Routes
app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/posts', postsRoutes);


// Serving
app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});

module.exports = app;
