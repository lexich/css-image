"use strict";

var gulp = require("gulp");
var istanbul = require("gulp-istanbul");
var mocha = require("gulp-mocha");

gulp.task("test", function (cb) {
  gulp.src(["test/main.js"])
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on("finish", function () {
      gulp.src(["test/main.js"])
        .pipe(mocha())
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
        .on("end", cb);
    });
});
