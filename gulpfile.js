var fs = require('fs');
var gulp = require('gulp');
var inject = require('html-injector');
var log = require('gulp-util').log;
var minify = require('html-minifier').minify;
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
  inject('src/app.html')
  .replace('css', config.css)
  .replace('js', config.bundle) // config.bundlemin
  .replace('template', 'src/**/*.html')
  .write(config.html, minifyHtml);
});

gulp.task('html:clean', function() {
  trash([config.html]);
});
