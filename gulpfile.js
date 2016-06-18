var autoprefixer = require('gulp-autoprefixer');
var fs = require('fs');
var gulp = require('gulp');
var inject = require('html-injector');
var log = require('gulp-util').log;
var minify = require('html-minifier').minify;
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var trash = require('trash');

var config = require('./config.json');

var minifyHtml = () => {
  var content = fs.readFileSync(config.html, {encoding: 'utf-8'});
  var minified = minify(content, {
    collapseWhitespace: true,
    processScripts: ['text/ng-template']
  });
  fs.writeFileSync(config.html, minified);
};

gulp.task('html', function() {
  inject(config.entry.html)
  .replace('css', config.css)
  .replace('js', config.bundle) // config.bundlemin
  .replace('template', 'src/**/*.html')
  .write(config.html, minifyHtml);
});

gulp.task('html:clean', function() {
  trash([config.html]);
});

gulp.task('sass', function() {
  return gulp
  .src(config.entry.scss)
  .pipe(sourcemaps.init())
  .pipe(sass(config.options.sass).on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(autoprefixer(config.options.autoprefixer))
  .pipe(gulp.dest('build'));
});

gulp.task('sass:clean', function() {
  trash([config.css])
});
