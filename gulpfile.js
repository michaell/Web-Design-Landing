const gulp = require('gulp');

const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const autoprefixer = require('gulp-autoprefixer');
const minifycss = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const uglify = require('gulp-uglify');
const del = require('del');
const runSequence = require('run-sequence');

/*-----------------------if dev or app----------------*/
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';


//pathes to JS files
let moduleJs = [
    'app/js/first.js',
    'app/js/second.js',
    'app/js/third.js',
    'app/js/main.js'
];

//pathes to outer plugins and JS libraries
let vendorJs = [
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/owl.carousel/dist/owl.carousel.min.js'
];

//pathes to outer plugins and style libraries
let vendorCss = [
    'node_modules/normalize-css/normalize.css',
    'node_modules/owl.carousel/dist/assets/owl.carousel.css'
];

//server
gulp.task('browser-sync', ['html', 'styles', 'fonts', 'images', 'build:js', 'vendor:js', 'vendor:css'], function(){
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
    browserSync.watch(['./dist/**/*.*', '!**/*.css'], browserSync.reload);
});

//transfer HTML files
gulp.task('html', function(){
    return gulp.src('app/pages/**/*.*')
        .pipe(gulp.dest('dist'))
});

//transfer fonts files
gulp.task('fonts', function(){
    return gulp.src('app/fonts/**/*.*')
        .pipe(gulp.dest('dist/fonts'))
});

//transfer images
gulp.task('images', function(){
    return gulp.src('app/images/**/*.*')
        .pipe(gulp.dest('dist/images'))
});

//styles
gulp.task('styles', function(){
    return gulp.src('app/scss/main.scss')
        .pipe(plumber({
            errorHandler: notify.onError(function (err){
                return {title: 'Style', message: err.message}
            })
        }))
        .pipe(gulpIf(isDevelopment, sourcemaps.init())) //make sourcemaps in dev mode
        .pipe(sass())
        .pipe(autoprefixer('last 4 versions'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulpIf(isDevelopment, sourcemaps.write())) //write sourcemaps in dev mode
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream())
});

//js
gulp.task('build:js', function(){
    return gulp.src(moduleJs)
        .pipe(plumber({
            errorHandler: notify.onError(function (err){
                return {title: 'javaScript', message: err.message}
            })
        }))
        .pipe(gulpIf(isDevelopment, sourcemaps.init()))
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(gulpIf(isDevelopment, sourcemaps.write())) //write sourcemaps in dev mode
        .pipe(gulp.dest('dist/js'))
});

/*-------combining outer plugins and JS libraries in one file--------*/
gulp.task('vendor:js', function(){
    return gulp
    .src(vendorJs)
    .pipe(concat('vendor.min.js'))
    .pipe(gulp.dest('dist/js'));
});

/*-------combining outer plugins and style libraries--------*/
gulp.task('vendor:css', function(){
    return gulp
    .src(vendorCss)
    .pipe(concat('vendor.min.css'))
    .pipe(gulp.dest('dist/css'));
});

//watcher
gulp.task('watch', function(){
    gulp.watch('app/pages/**/*.html', ['html']);
    gulp.watch('app/scss/**/*.scss', ['styles']);
    gulp.watch('app/images/**/*.*', ['images']);
    gulp.watch('app/js/**/*.js', ['build:js']);
});

//defining default task
gulp.task('default', ['browser-sync', 'watch']);




//cleaning
gulp.task('clean', function(){
    return del(['dist'], {force: true}).then(paths => {
        console.log('Deleted files and folders:\n', paths.join());
    });
});

//build project (delete dist folder and then create it again)
gulp.task('build', function(cb){
    runSequence(
        ['clean'],
        ['html', 'styles', 'fonts', 'images', 'build:js', 'vendor:js', 'vendor:css'],
        cb
    )
})