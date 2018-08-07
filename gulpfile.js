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
  let plugins = [autoprefixer({ browsers: ['last 2 versions'], cascade: true })];
  return gulp
    .src('public/css/main.css')
    .pipe(postcss(plugins))
    .pipe(gulp.dest('public/css'));
});

gulp.task('copy-js', () => {
  return gulp
    .src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    ])
    .pipe(gulp.dest('public/js'));
});

gulp.task('watch', () => {
  // gulp.watch('node_modules/bootstrap/scss/**/*.scss', ['compile:sass']);
  gulp.watch('public/css/main.css', ['autoprefix']);
});

gulp.task('default', ['copy-js']);
