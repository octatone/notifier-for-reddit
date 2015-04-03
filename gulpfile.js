'use strict';

var gulp = require('gulp');
var zip = require('gulp-zip');
var jsonEdit = require('gulp-json-editor');
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

gulp.task('build-copy', ['scripts'], function () {

  return gulp.src('extension/**/*')
    .pipe(gulp.dest('build/src'));
});

gulp.task('build-manifest', ['build-copy'], function () {

  var path = 'build/src';

  return gulp.src(path + '/manifest.json')
    .pipe(jsonEdit(function (json) {

      delete json.key;
      return json;
    }))
    .pipe(gulp.dest(path));
});

gulp.task('build-zip', ['build-copy', 'build-manifest', 'scripts'], function () {

  return gulp.src('build/src/**/*')
    .pipe(zip('notifier-for-reddit.zip'))
    .pipe(gulp.dest('build'));
});

gulp.task('build', ['build-zip'], function () {

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

gulp.task('develop', ['watch'], function () {

});

gulp.task('default', ['develop']);