var gulp = require('gulp'),
	sass = require('gulp-sass'),
	ejs = require("gulp-ejs"),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	clean = require('gulp-clean'),
	notify = require('gulp-notify');

var sassSource = 'styles/*.scss',
	cssDist = 'public/styles/css/',
	imagesSource = 'images/*',
	imagesDist = 'public/images';

options = {
    imagemin: { optimizationLevel: 3, progressive: true, interlaced: true },
    clean: { read: false }
};

// Clean
gulp.task('clean', function() {
    return gulp.src([
            cssDist, imagesDist
        ], options.clean )
        .pipe( clean() )
        .pipe( notify( { message: 'Clean task complete.' } ) )
});

// Styles
gulp.task('styles', function() {
    gulp.src(sassSource)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(cssDist))
        .pipe(notify( { message: 'CSS task complete.' } ))
});

// Images
gulp.task('images', function() {
    return gulp.src(imagesSource)
        .pipe(cache(imagemin( options.imagemin)))
        .pipe(gulp.dest( imagesDist ) )
        .pipe(notify( { message: 'Images task complete.' }))
});

gulp.task('watch',function() {
    gulp.watch(sassSource,['styles']);
    gulp.watch(imagesSource,['images']);
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'images', 'watch');
});
