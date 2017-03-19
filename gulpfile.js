"use strict";

const gulp = require('gulp'),
  path = require('path');

const mocha = require('gulp-mocha');


gulp.task('tests', function () {
  return gulp.src('./test/**/model.test.js', { read: false })
      .pipe(mocha({
        ui: 'exports',
        reporter: 'spec',
        timeout: 10000
      }))
      .on('error', function(err) {
        console.error(err.stack);
        process.exit(-1);
      })
    ;
});


gulp.task('default', ['tests']);
