var autoprefixer = require('gulp-autoprefixer');
var browserify = require('browserify');
var fs = require('fs');
var gulp = require('gulp');
var htmlminifier = require('html-minifier').minify;
var inject = require('html-injector');
var log = require('gulp-util').log;
var minifyify = require('minifyify');
var path = require('path');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var trash = require('trash');
var tsify = require('tsify');
var uglify = require('uglify-js');
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

  var options = {
    transforms: {
      angular: () => { return vendor.angular },
      uiRouter: () => { return vendor['angular-ui-router'] },
      pouchdb: () => { return vendor.pouchdb }
    }
  };

  inject(config.entry.html)
  .replace('angular', config.entry.html, options)
  .replace('angular-ui-router', config.entry.html, options)
  .replace('pouchdb', config.entry.html, options)
  .replace('js', config.dist.js)
  .replace('css', config.dist.css)
  .replace('template', config.src.html)
  .write(config.dist.html, minifyHtml);
});

gulp.task('html:clean', function() {
  trash([config.dist.html]);
});

gulp.task('html:watch', function() {
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

gulp.task('sass:watch', function() {
  return gulp.watch(config.src.scss, ['sass'])
  .on('change', logWatchEvent)
  .on('add', logWatchEvent)
  .on('delete', logWatchEvent)
  .on('rename', logWatchEvent);
});

gulp.task('ts', function() {
  return browserify(config.options.browserify)
  .add(config.entry.ts)
  .plugin(tsify, config.options.tsify)
  .plugin(minifyify, config.options.minifyify)
  .bundle()
  .on('error', logError)
  .pipe(fs.createWriteStream(config.dist.js));
});

gulp.task('ts:clean', function() {
  trash([config.dist.js, config.options.minifyify.output]);
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
  .plugin(minifyify, config.options.minifyify)
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

gulp.task('build', ['html', 'sass', 'ts', 'minify']);

gulp.task('clean', ['html:clean','sass:clean','ts:clean']);

gulp.task('watch', ['html:watch','sass:watch','ts:watch']);

// Only minify if NODE_ENV=production
gulp.task('minify', ['ts'], function() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  var output = uglify.minify(config.dist.js, {
    mangle: true,
    compress: {}
  });
  fs.writeFileSync(config.dist.js, output.code);
});
