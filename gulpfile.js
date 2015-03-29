'use strict';

var gulp = require('gulp');
var browserify = require('gulp-browserify');

gulp.task('scripts', function () {

  gulp.src('./src/*.js')
    .pipe(browserify({
      'debug': false,
      'transform': [
        'babelify',
        'reactify'
      ]
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