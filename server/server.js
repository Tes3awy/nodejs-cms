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
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000, expires: new Date(Date.now() + 3600000) }
}));
// Passport Middlewares
app.use(passport.initialize());
app.use(passport.session());
// Global Vars
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  // res.locals.success = req.flash('success');
  // res.locals.error = req.flash('error');
  next();
});
// Flash Middleware
app.use(flash());
// Morgan
// app.use(morgan('dev'));
// HBS
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
      capitalize(name) {
        return _.startCase(_.toLower(name));
      },
      getToday() {
        return moment().format('MMMM Do YYYY');
      },
      trimString(content) {
        var content = _.unescape(content).toString();
        return content.substring(0, 250);
      },
      htmlDecode(text) {
        var text = sanitizeHtml(text, {
          allowedTags: false,
          allowedAttributes: false,
          parser: {
            lowerCaseTags: true
          }
        });
        return _.unescape(text);
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
