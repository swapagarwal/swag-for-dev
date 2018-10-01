const babel         = require("gulp-babel");
const gulp          = require("gulp");
const uglify        = require('gulp-uglify-es').default;
const pug           = require("gulp-pug");
const stylus        = require("gulp-stylus");
const webserver     = require("gulp-webserver");
const concat        = require("gulp-concat");

gulp.task('webserver', function () {
	return gulp.src("dist")
		.pipe(webserver({
			livereload: true,
			open: true
		}));
});

gulp.task('pug', () => {
    return gulp.src('src/pug/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('dist/'));
})

gulp.task('styl', () => {
    return gulp.src('src/styl/index.styl')
        .pipe(stylus({
            compress: true
        }))
        .pipe(gulp.dest('dist/assets/css'));
})

gulp.task('js', () => {
    return gulp.src('src/js/*.js')
        .pipe(concat('index.js'))
        .pipe(babel({
            "presets": [
                [
                  "env",
                  {
                    "targets": {
                      "browsers": ["> 75%"]
                    }
                  }
                ]
              ]
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js'))
})

gulp.task('default', ['webserver', 'pug', 'styl', 'js'], () => {
    gulp.watch(['src/pug/**/*.pug', 'src/styl/**/*.styl', 'src/js/*.js'], ['pug', 'styl', 'js']);
})

gulp.task('build', ['pug', 'styl', 'js']);