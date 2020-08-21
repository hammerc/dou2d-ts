var gulp = require("gulp");
var rename = require("gulp-rename");
var ts = require("gulp-typescript");
var uglify = require("gulp-uglify-es").default;
var del = require("del");
var fs = require("fs");

gulp.task("ts", function () {
  var tsProject = ts.createProject("tsconfig.json");
  del.sync(["bin"]);
  return tsProject.src()
    .pipe(tsProject())
    .pipe(gulp.dest("bin"));
});

gulp.task("Dou", function (cb) {
  let content = fs.readFileSync("bin/dou2d.d.ts", { encoding: "utf8" });
  content = content.replace(/declare\s+namespace\s+dou2d([\.a-zA-Z0-9$_]*)\s\{/g, "declare namespace Dou$1 {");
  content = content.replace(/declare\s+module\s+dou2d([\.a-zA-Z0-9$_]*)\s\{/g, "declare module Dou$1 {");
  content = content.replace(/declare\s+namespace\s+dou([\.a-zA-Z0-9$_]*)\s\{/g, "declare namespace Dou$1 {");
  content = content.replace(/declare\s+module\s+dou([\.a-zA-Z0-9$_]*)\s\{/g, "declare module Dou$1 {");
  content = content.replace(/\s+dou\s*\./g, " Dou.");
  fs.writeFileSync("bin/Dou.2d.d.ts", content, { encoding: "utf8" });
  cb();
});

gulp.task("uglify", function () {
  return gulp.src("bin/dou2d.js")
    .pipe(uglify({ compress: { global_defs: { DEBUG: false, RELEASE: true } } }))
    .pipe(rename({ basename: "dou2d.min" }))
    .pipe(gulp.dest("bin"));
});

gulp.task("copy", function () {
  return gulp.src("bin/**/*")
    .pipe(gulp.dest("../examples/lib"));
});

gulp.task("default", gulp.series("ts", "Dou", "uglify", "copy"));
