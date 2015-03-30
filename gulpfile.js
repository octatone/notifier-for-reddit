'use strict';

var gulp = require('gulp');
var browserify = require('gulp-browserify');

var libs = [
  'react/addons'
];

var transforms = [
  'babelify',
  'reactify'
];

gulp.task('scripts-external', function () {

  gulp.src('./src/vendor/external.js')
    .pipe(browserify({
      'debug': false,
      'require': libs,
      'transform': transforms
    }))
    .pipe(gulp.dest('./extension/js/vendor/'));
});

gulp.task('scripts', ['scripts-external'], function () {

  gulp.src('./src/*.js')
    .pipe(browserify({
      'debug': false,
      'external': libs,
      'transform': transforms
    }))
    .pipe(gulp.dest('./extension/js/'));
});

gulp.task('watch', ['scripts'], function () {

  gulp.watch([
    './src/**/*',
  ],
  {
    'interval': 500
  },
  [
    'scripts'
  ]);
});

gulp.task('build', ['scripts'], function () {

});

gulp.task('develop', ['watch'], function () {

});

gulp.task('default', ['develop']);