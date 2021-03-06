// Required Modules
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');

const autoprefixer = require('autoprefixer');
const csscomb = require('gulp-csscomb');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const rtlcss = require('rtlcss');
const sass = require('gulp-sass');

const uglify = require('gulp-uglify');

gulp.task('compile:sass', () => {
  let plugins = [autoprefixer({ browsers: ['last 10 versions'] }), cssnano()];
  return gulp
    .src('node_modules/bootstrap/scss/bootstrap.scss')
    .pipe(plumber())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('public/css'));
});

// Autoprefix, Prettify and Minify main.css file
gulp.task('autoprefix', () => {
  let plugins = [
    autoprefixer({ browsers: ['last 10 versions'], cascade: true })
  ];
  return gulp
    .src(['public/css/main.css', 'public/css/ribbon.css'])
    .pipe(postcss(plugins))
    .pipe(csscomb())
    .pipe(gulp.dest('public/css'))
    .pipe(plumber())
    .pipe(postcss([cssnano()]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('public/css'));
});

// Generate RTL CSS for main.css file
gulp.task('rtlcss', () => {
  return gulp
    .src('public/css/main.css')
    .pipe(postcss([rtlcss()]))
    .pipe(rename({ basename: 'main', suffix: '-rtl', extname: '.css' }))
    .pipe(gulp.dest('public/css'))
    .pipe(plumber())
    .pipe(postcss([cssnano()]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('copy-hams', () => {
  return gulp
    .src('node_modules/hamburgers/_sass/hamburgers/**')
    .pipe(gulp.dest('public/sass/vendor/hamburgers'));
});

// Compile Hamburger Task
gulp.task('compile:ham', () => {
  let plugins = [autoprefixer({ browsers: ['last 10 versions'] }), cssnano()];
  return gulp
    .src('public/sass/vendor/hamburgers/hamburgers.scss')
    .pipe(plumber())
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('public/css'));
});

// Copy JS Files Task
gulp.task('copy-js', () => {
  return gulp
    .src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
      'node_modules/tinymce/tinymce.min.js',
      'node_modules/ekko-lightbox/dist/ekko-lightbox.min.js',
      'node_modules/sweetalert2/dist/sweetalert2.all.min.js',
      'node_modules/chart.js/dist/Chart.bundle.min.js',
      'node_modules/chosen-js/chosen.jquery.min.js',
      'node_modules/perfect-scrollbar/dist/perfect-scrollbar.min.js',
      'node_modules/tiny-date-picker/dist/tiny-date-picker.js',
      'node_modules/intl-tel-input/build/js/intlTelInput-jquery.min.js',
      'node_modules/intl-tel-input/build/js/utils.js',
      'node_modules/shufflejs/dist/shuffle.min.js'
    ])
    .pipe(gulp.dest('public/js'));
});

// Copy TinyMCE Folders Task
gulp.task('tinymce', () => {
  return gulp
    .src(['node_modules/tinymce/**'])
    .pipe(gulp.dest('public/js/vendor/tinymce'));
});

// Copy CSS Task
gulp.task('copy-css', () => {
  return gulp.src([]).pipe(gulp.dest('public/css'));
});

gulp.task('uglify', () => {
  return gulp
    .src('public/js/main.js')
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({ basename: 'index', suffix: '.min', extname: '.js' }))
    .pipe(gulp.dest('public/js/'));
});

// Watch Task
gulp.task('watch', () => {
  // gulp.watch('node_modules/bootstrap/scss/**/*.scss', ['compile:sass']);
  gulp.watch('public/js/main.js', ['uglify']);
  gulp.watch(['public/css/main.css'], ['autoprefix', 'rtlcss']);
  // gulp.watch(['public/css/ribbon.css'], ['autoprefix', 'rtlcss']);
  gulp.watch('public/sass/vendor/hamburgers/**', ['compile:ham']);
});

// Default Task
gulp.task('default', ['copy-js', 'copy-css']);
