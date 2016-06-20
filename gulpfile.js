var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var fs = require('fs');
var gulp = require('gulp');
var htmlminifier = require('html-minifier').minify;
var inject = require('html-injector');
var log = require('gulp-util').log;
var path = require('path');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var trash = require('trash');
var tsify = require('tsify');
var uglify = require('uglify-js');
var uglifyify = require('uglifyify');
var watchify = require('watchify');


var config = require('./config.json');

var logError = (error) => {
  console.error(error.toString());
};

var logWatchEvent = (event) => {
  console.log(event.path + ' ' + event.type);
};

var minifyHtml = () => {
  var content = fs.readFileSync(config.dist.html, {encoding: 'utf-8'});
  var minified = htmlminifier(content, {
    collapseWhitespace: true,
    processScripts: ['text/ng-template']
  });
  fs.writeFileSync(config.dist.html, minified);
};

gulp.task('html', function() {
  var vendor = (process.env.NODE_ENV === 'production') ? config.vendor.production : config.vendor.default;
  inject(config.entry.html)
  .replaceValues('js', {
    angular: vendor.angular,
    'angular-ui-router': vendor['angular-ui-router'],
    lodash: vendor.lodash,
    pouchdb: vendor.pouchdb,
    app: config.dist.js
  })
  .replaceValues('css', {
    app: config.dist.css
  })
  .replace('template', config.src.html)
  .write(config.dist.html, minifyHtml);
});

gulp.task('html:clean', function() {
  trash([config.dist.html]);
});

gulp.task('html:watch', ['html'], function() {
  return gulp.watch([config.src.html, config.entry.html], ['html'])
  .on('change', logWatchEvent)
  .on('add', logWatchEvent)
  .on('delete', logWatchEvent)
  .on('rename', logWatchEvent);
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

gulp.task('sass:watch', ['sass'], function() {
  return gulp.watch(config.src.scss, ['sass'])
  .on('change', logWatchEvent)
  .on('add', logWatchEvent)
  .on('delete', logWatchEvent)
  .on('rename', logWatchEvent);
});

var browserifyCore = function(watch) {
  var b = browserify(config.options.browserify);
  b.add(config.entry.ts);
  if (watch) {
    b.plugin(watchify);
    b.on('update', bundle.bind(null, b));
    b.on('update', console.log);
    b.on('log', console.log);
  }
  b.plugin(tsify, config.options.tsify);
  b.transform(uglifyify);
  return b;
};

var bundle = function(b) {
  b.bundle()
  .on('error', logError)
  .pipe(fs.createWriteStream(config.dist.js));
};

gulp.task('ts', function() {
  bundle(browserifyCore());
});

gulp.task('ts:clean', function() {
  trash([config.dist.js]);
});

gulp.task('ts:watch', function() {
  bundle(browserifyCore(true));
});

gulp.task('build', ['html', 'sass', 'ts', 'minify']);

gulp.task('clean', ['html:clean','sass:clean','ts:clean']);

gulp.task('watch', ['html:watch','sass:watch','ts:watch']);

// Only minify if NODE_ENV=production
gulp.task('minify', ['ts'], function() {
  if (process.env.NODE_ENV !== 'production') {
    log('Skipping minify');
    return;
  }
  var output = uglify.minify(config.dist.js, {
    mangle: true,
    compress: {}
  });
  fs.writeFileSync(config.dist.js, output.code);
});
