/* jshint node: true */
'use strict';

// Most modules are loaded in the tasks that require them.
// This isn't ideal, but it vastly improves gulp's load time.
var gulp = require('gulp'),
	livereload = require('gulp-livereload'),
	rename = require('gulp-rename'),

	javascriptLintPaths = [
		'gulpfile.js',
        'index.js'
	],

	browserifyShare = function(watch) {
		var bundle, browserify = require('browserify'),
			watchify = require('watchify'),
			exorcist = require('exorcist'),
			source = require('vinyl-source-stream'),
			b = browserify({
				basedir: __dirname,
                debug: true,
				entries: './index.js',
				cache: {},
				packageCache: {},
				fullPaths: watch
			});

		if (watch) {
			b = watchify(b);
		}

		bundle = function() {
			var stream = b.bundle();

			stream.on('error', function(msg) { console.log(msg.message); });

			stream = stream.pipe(exorcist('./build.js.map'))
				.pipe(source('build.js'))
				.pipe(gulp.dest('.'));

			if (watch) {
				return stream.pipe(livereload());
			} else {
				return stream;
			}
		};

		b.on('update', bundle);

		return bundle();
	};

gulp.task('javascript-lint', function() {
	var jscs = require('gulp-jscs'),
		jshint = require('gulp-jshint'),
		terminus = require('terminus');

	gulp.src(javascriptLintPaths)
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jscs())
		.on('error', function(e) {
			console.log(e.message);
			jscs().end();
		})
		.pipe(terminus.devnull({ objectMode: true }));
});

gulp.task('javascript', function() {
    browserifyShare(false);
});

gulp.task('javascript-watch', ['javascript-lint'], function() {
	browserifyShare(true);
});

gulp.task('javascript-clean', function(cb) {
	var del = require('del');

	del(['build.js', 'build.js.map'], cb);
});

gulp.task('javascript-build', ['javascript-clean', 'javascript-lint'], function() {
	var streamify = require('gulp-streamify'),
		uglify = require('gulp-uglify');

    browserifyShare(false)
        .pipe(streamify(uglify()))
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('startwatch', function() {
	livereload.listen();
});

gulp.task('watch', ['javascript-watch', 'startwatch'], function() {
	gulp.watch(javascriptLintPaths, ['javascript-lint']);
});

gulp.task('build', ['javascript-build']);

gulp.task('default', ['build']);