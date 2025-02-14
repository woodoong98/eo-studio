var gulp = require('gulp');
var sass = require('gulp-sass');
var bless = require('gulp-bless');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var fileinclude = require('gulp-file-include');
var rename = require('gulp-rename');
var size = require('gulp-size');
var clean = require('gulp-clean');
var ver = require('gulp-ver');
var stripDebug = require('gulp-strip-debug');
var debug = require('gulp-debug');
var connect = require('gulp-connect');
var vendorScripts = require('./vendor.scripts.json');
var conf = require('./gulp.conf.json');
var browserSync = require('browser-sync').create();

// gulp build-watch -> localhost로 확인할 수 있게 해줌
gulp.task('build-watch', ['build', 'watch', 'connect']);

// gulp build -> template 파일 html 폴더로 추출
gulp.task('build', ['vendor', 'app', 'sass', 'html-template']);

// gulp dist -> css, js 압축
gulp.task('dist', ['build-css', 'concat-js']);

// 모바일도 확인할 수 있도록 해줌.
gulp.task('sync-watch', ['build', 'watch', 'browserSync']);

gulp.task('browserSync', function () {
    return browserSync.init(
      {
          port: 9000,
          server: {
            baseDir: './'
          }
      });
});

// ::: Build Task :::
gulp.task('concat-js', ['dist-clean-js'], function () {
    var vendor = conf.path.build.js + '/' + conf.name.vendor;
    var app = conf.path.build.js + '/' + conf.name.app;

    gulp.src([vendor, app])
        .pipe(concat(conf.name.default))
        .pipe(stripDebug()) // 콘솔 제거
        .pipe(ver())
        .pipe(uglify())
        .pipe(gulp.dest(conf.path.dist.js));
});

gulp.task('dist-clean-js', function () {

    return gulp.src(conf.path.dist.js + '/*', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('build-css', ['dist-clean-css'], function () {

    return gulp.src(conf.path.build.css + '/*.css')
        .pipe(ver())
        .pipe(cssmin({showLog: true}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(conf.path.dist.css));
});

gulp.task('dist-clean-css', function () {

    return gulp.src(conf.path.dist.css + '/*', {read: false}).pipe(clean({force: true}));
});

gulp.task('sass', ['clean-css'], function () {
    return gulp.src(conf.path.src.scss)
        .pipe(sass())
        .pipe(bless({
            imports: false
        }))
        .pipe(debug({title: 'console:'}))
        .pipe(gulp.dest(conf.path.build.css));
});

// css 적용이 잘 안될 때
gulp.task('clean-css', function () {
    return gulp.src(conf.path.build.css + '/*', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('app', function () {
    return gulp.src(conf.path.src.js)
        .pipe(concat(conf.name.app))
        .pipe(minify({
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(debug({title: 'console:'}))
        .pipe(gulp.dest(conf.path.build.js));
});

gulp.task('vendor', ['clean-js'], function () {
    // check
    vendorScripts.forEach(function (item) {
        gulp.src(item).pipe(size()).pipe(debug({title: 'script :'}));
    });

    return gulp.src(vendorScripts)
        .pipe(concat(conf.name.vendor))
        .pipe(minify({
            ext: {
                min: '.min.js'
            }
        }))
        .pipe(gulp.dest(conf.path.build.js));
});

gulp.task('clean-js', function () {
    return gulp.src(conf.path.build.js + '/*', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('html-template', ['clean-html-template'], function () {
    // Include partial HTML templates and compile them to the build directory.
    return gulp.src(conf.path.src.html)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(conf.path.build.html))
        .pipe(connect.reload());

});

gulp.task('clean-html-template', function () {
    return gulp.src(conf.path.build.html + '/*.html', {read: false})
        .pipe(clean({force: true}));

});

gulp.task('watch', function () {
    gulp.watch(conf.path.watch.js, ['app']);
    gulp.watch(conf.path.watch.scss, ['sass']);
    gulp.watch(conf.path.watch.html, ['html-template']);
});

// localhost port 번호
gulp.task('connect', function () {
    connect.server({
        root: './',
        port: 8888
    });
});