const fs            = require('fs');
const babel         = require('gulp-babel');
const gulp          = require('gulp');
const uglify        = require('gulp-uglify-es').default;
const pug           = require('gulp-pug');
const stylus        = require('gulp-stylus');
const webserver     = require('gulp-webserver');
const concat        = require('gulp-concat');
const download      = require('gulp-download-stream');
const imagemin      = require('gulp-imagemin');
const source        = require('vinyl-source-stream');
const buffer 				= require('vinyl-buffer');

const filenameSafe  = s => s.replace(/[^a-z0-9.]/gi, '_').replace(/_{2,}/g, '_').toLowerCase();

let SWAG_LIST       = JSON.parse(fs.readFileSync('../data.json'));

gulp.task('webserver', function () {
    return gulp.src('dist')
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
});

gulp.task('styl', () => {
    return gulp.src('src/styl/index.styl')
        .pipe(stylus({
            compress: true
        }))
        .pipe(gulp.dest('dist/assets/css'));
});

gulp.task('js', () => {
    return gulp.src('src/js/*.js')
        .pipe(concat('index.js'))
        .pipe(babel({
            'presets': [
                [
                    '@babel/env',
                    {
                        'targets': {
                            'browsers': ['> 75%']
                        }
                    }
                ]
            ]
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js'));
});

gulp.task('img', () => {
    return gulp.src('src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/img'));
});

gulp.task('swag-img:download', () => {
    const downloadList 	= SWAG_LIST.map(s => ({
        url: s.image,
        file: filenameSafe(s.image),
    }));
    return download(downloadList)
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/swag-img'));
});

gulp.task('swag-img:update-data', () => {
    const newSwagList = SWAG_LIST.map(s => {
        const name = filenameSafe(s.image);
        s.image = `/assets/swag-img/${name}`;
        return s;
    });
    SWAG_LIST = newSwagList;
    const stream = source('data.json');
    stream.end(JSON.stringify(newSwagList));
    return stream.pipe(gulp.dest('dist/assets'));
});

gulp.task('swag-img', ['swag-img:download','swag-img:update-data']);

gulp.task('default', ['webserver', 'pug', 'styl', 'js', 'img', 'swag-img'], () => {
    gulp.watch(['src/pug/**/*.pug', 'src/styl/**/*.styl', 'src/js/*.js'], ['pug', 'styl', 'js']);
});

gulp.task('build', ['pug', 'styl', 'js', 'img', 'swag-img']);
