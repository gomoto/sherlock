var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var fs = require('fs');
var gulp = require('gulp');
var inject = require('html-injector');
var log = require('gulp-util').log;
var minify = require('html-minifier').minify;
var path = require('path');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var trash = require('trash');
var tsify = require('tsify');
var watchify = require('watchify');


var config = require('./config.json');

var logError = (error) => {
  console.error(error.toString());
};

var minifyHtml = () => {
  var content = fs.readFileSync(config.dist.html, {encoding: 'utf-8'});
  var minified = minify(content, {
    collapseWhitespace: true,
    processScripts: ['text/ng-template']
  });
  fs.writeFileSync(config.dist.html, minified);
};

gulp.task('html', function() {
  inject(config.entry.html)
  .replace('css', config.dist.css)
  .replace('js', config.dist.js)
  .replace('template', config.src.html)
  .write(config.dist.html, minifyHtml);
});

gulp.task('html:clean', function() {
  trash([config.dist.html]);
});

gulp.task('sass', function() {
  return gulp
  .src(config.entry.scss)
  .pipe(sourcemaps.init())
  .pipe(sass(config.options.sass).on('error', sass.logError))
  .pipe(autoprefixer(config.options.autoprefixer))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(path.dirname(config.dist.css)));
});

gulp.task('sass:clean', function() {
  trash([config.dist.css])
});

gulp.task('sass:watch', function() {
  return gulp
  .watch(config.src.scss, ['sass'])
  .on('change', function(event) {
    console.log('File ' + event.path + ' ' + event.type);
  });
});

gulp.task('ts', function() {
  browserify(config.options.browserify)
  .add(config.entry.ts)
  .plugin(tsify, config.options.tsify)
  .bundle()
  .on('error', logError)
  .pipe(fs.createWriteStream(config.dist.js));
});

gulp.task('ts:clean', function() {
  trash([config.dist.js]);
});

var watchifyOptions = Object.assign({
  cache: {},
  packageCache: {},
  plugin: [watchify]
}, config.options.browserify);

gulp.task('ts:watch', function() {

  var b = browserify(watchifyOptions)
  .add(config.entry.ts)
  .plugin(tsify, config.options.tsify)
  .on('update', bundle)
  .on('update', console.log)
  .on('log', console.log);

  bundle();

  function bundle() {
    b.bundle()
    .on('error', logError)
    .pipe(fs.createWriteStream(config.dist.js));
  }

});

gulp.task('build', ['html', 'sass', 'ts']);

gulp.task('clean', ['html:clean','sass:clean','ts:clean']);
