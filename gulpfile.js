const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const wait = require('gulp-wait');
const rename = require('gulp-rename');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');

// gulp.task('compile:sass', () => {
//   let plugins = [autoprefixer({ browsers: ['last 2 versions'] }), cssnano()];
//   return gulp
//     .src('node_modules/bootstrap/scss/bootstrap.scss')
//     .pipe(plumber())
//     .pipe(wait(50))
//     .pipe(sass.sync().on('error', sass.logError))
//     .pipe(postcss(plugins))
//     .pipe(rename({ suffix: '.min' }))
//     .pipe(gulp.dest('public/css'));
// });

gulp.task('autoprefix', () => {
  let plugins = [autoprefixer({ browsers: ['last 20 versions'], cascade: true })];
  return gulp
    .src(['public/css/main.css', 'public/css/ribbon.css'])
    .pipe(postcss(plugins))
    .pipe(gulp.dest('public/css'));
});

// gulp.task('copy-hams', () => {
//   return gulp
//     .src('node_modules/hamburgers/_sass/hamburgers/**')
//     .pipe(gulp.dest('public/sass/vendor/hamburgers'));
// });

gulp.task('compile:ham', () => {
  let plugins = [autoprefixer({ browsers: ['last 2 versions'] }), cssnano()];
  return gulp
    .src('public/sass/vendor/hamburgers/hamburgers.scss')
    .pipe(plumber())
    .pipe(wait(50))
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('copy-js', () => {
  return gulp
    .src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map',
      'node_modules/ekko-lightbox/dist/ekko-lightbox.min.js',
      'node_modules/ekko-lightbox/dist/ekko-lightbox.min.js.map',
      'node_modules/chart.js/dist/Chart.bundle.min.js',
      'node_modules/chosen-js/chosen.jquery.min.js',
      'node_modules/perfect-scrollbar/dist/perfect-scrollbar.min.js'
    ])
    .pipe(gulp.dest('public/js'));
});

gulp.task('tinymce', () => {
  return gulp.src([
    'node_modules/tinymce/**'
  ])
  .pipe(gulp.dest('public/js/vendor/tinymce'))
});

gulp.task('copy-css', () => {
  return gulp
    .src([
      // 'node_modules/chosen-js/chosen.min.css',
      // 'node_modules/chosen-js/chosen-sprite.png'
      'node_modules/perfect-scrollbar/css/perfect-scrollbar.css'
    ])
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch', () => {
  // gulp.watch('node_modules/bootstrap/scss/**/*.scss', ['compile:sass']);
  gulp.watch(['public/css/main.css', 'public/css/ribbon.css'], ['autoprefix']);
  gulp.watch('public/sass/vendor/hamburgers/**', ['compile:ham']);
});

gulp.task('default', ['copy-js', 'copy-css']);
