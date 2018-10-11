const { writeFile } = require('fs');
const mkdirp        = require('mkdirp');
const del           = require('del');
const gulp          = require('gulp');
const babel         = require('gulp-babel');
const uglify        = require('gulp-uglify-es').default;
const pug           = require('gulp-pug');
const stylus        = require('gulp-stylus');
const webserver     = require('gulp-webserver');
const concat        = require('gulp-concat');
const download      = require('gulp-download-stream');
const responsive    = require('gulp-responsive');
const swagList = require('../data.json');

const escapeName = s => s.replace(/[^a-z0-9]/gi, '_').replace(/_{2,}/g, '_').toLowerCase();
const builtSwagList = swagList.map(s => Object.assign({}, s, {
    image: `/assets/swag-img/${escapeName(s.image)}.jpg`,
}));


gulp.task('webserver', function () {
    return gulp.src('dist')
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});

gulp.task('pug', () => {
    const tags = Array.from(builtSwagList.reduce(
        (tagList, { tags }) => {
            tags.forEach(tag => tagList.add(tag));
            return tagList;
        },
        new Set()
    )).sort();

    return gulp.src('src/pug/*.pug')
        .pipe(pug({
            pretty: true,
            locals: {swagList: builtSwagList, tags}
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
            presets: [
                ['@babel/env', {
                    targets: {
                        browsers: ['> 75%'],
                    }
                }]
            ]
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js'));
});

gulp.task('img', () => {
    return gulp.src('src/img/*')
        .pipe(responsive({
            'logo.png': {
                width: 128,
                height: 128,
            },
            '**/!(logo.png)': {},
        }, {
            quality: 90,
            progressive: true,
            compressionLevel: 9,
            errorOnEnlargement: false,
            errorOnUnusedConfig: false,
        }))
        .pipe(gulp.dest('dist/assets/img'));
});

gulp.task('swag-img:download', () => {
    const downloadList = swagList.map(s => ({
        url: s.image,
        file: escapeName(s.image) + '.jpg',
    }));
    return download(downloadList)
        .pipe(gulp.dest('dist/assets/swag-img'));
});

gulp.task('swag-img:optimize', () => {
    return gulp.src('dist/assets/swag-img/*')
        .pipe(responsive({
            '**/*': {
                height: 300,
                format: 'jpeg',
                flatten: true,
            },
        }, {
            quality: 90,
            progressive: true,
            compressionLevel: 9,
            errorOnEnlargement: false,
            errorOnUnusedConfig: false,
        }))
        .pipe(gulp.dest('dist/assets/swag-img'));
});

gulp.task('swag-img:clean', () => {
    return del('dist/assets/swag-img/**/*');
});

gulp.task('swag-img:build-data', (cb) => {
    return mkdirp('dist/assets', () => {
        writeFile('dist/assets/data.json', JSON.stringify(builtSwagList), cb);
    });
});

gulp.task('swag-img', gulp.parallel('swag-img:build-data', gulp.series('swag-img:clean', 'swag-img:download' , 'swag-img:optimize')));

gulp.task('build', gulp.parallel('pug', 'styl', 'js', 'img', 'swag-img'));

gulp.task('watch', () => {
    gulp.watch('src/pug/**/*.pug', gulp.parallel('pug'));
    gulp.watch('src/styl/**/*.styl', gulp.parallel('styl'));
    gulp.watch('src/js/**/*.js', gulp.parallel('js'));
    gulp.watch('src/img/**/*', gulp.parallel('img'));
    gulp.watch('../data.json', gulp.parallel('swag-img'));
});

gulp.task('default', gulp.parallel('webserver', 'build', 'watch'));
