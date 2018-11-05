const del           = require('del');
const gulp          = require('gulp');
const cachebust     = require('gulp-rev');
const cacheClean    = require('gulp-rev-delete-original');
const babel         = require('gulp-babel');
const uglify        = require('gulp-uglify-es').default;
const pug           = require('gulp-pug');
const htmlmin       = require('gulp-htmlmin');
const stylus        = require('gulp-stylus');
const webserver     = require('gulp-webserver');
const concat        = require('gulp-concat');
const download      = require('gulp-download-stream');
const responsive    = require('gulp-responsive');

const {swagList, swagImages} = require('./get-data');

const RESIZE_OPTS = {
    quality: 90,
    progressive: true,
    compressionLevel: 9,
    errorOnEnlargement: false,
    errorOnUnusedConfig: false
};

gulp.task('pug', () => {
    const tags = Array.from(swagList.reduce(
        (tagList, { tags }) => {
            tags.forEach(tag => tagList.add(tag));
            return tagList;
        },
        new Set()
    )).sort();

    const manifest = require('./rev-manifest.json');
    const bustedAssets = {
        css: `/assets/${manifest['css/index.css']}`,
        js: `/assets/${manifest['js/index.js']}`
    };

    return gulp.src('src/pug/*.pug')
        .pipe(pug({
            pretty: true,
            locals: {swagList, tags, bustedAssets}
        }))
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('styl', () => {
    return gulp.src('src/styl/index.styl')
        .pipe(stylus({ compress: true }))
        .pipe(gulp.dest('dist/assets/css'));
});

gulp.task('js', () => {
    const presets = [
        ['@babel/env', { targets: { browsers: ['> 75%'] } }]
    ];
    return gulp.src('src/js/*.js')
        .pipe(concat('index.js'))
        .pipe(babel({ presets }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/assets/js'));
});

gulp.task('swag-img:clean', () => {
    return del('dist/assets/swag-img/*');
});

gulp.task('img', () => {
    return gulp.src('src/img/*')
        .pipe(responsive([{
            name: 'logo.png',
            width: 128,
            height: 128
        }], RESIZE_OPTS))
        .pipe(gulp.dest('dist/assets/img'));
});

gulp.task('swag-img:download', () => {
    return download(swagImages)
        .pipe(gulp.dest('dist/assets/swag-img'));
});

gulp.task('swag-img:optimize', () => {
    return gulp.src('dist/assets/swag-img/*')
        .pipe(responsive([{
            name: '*',
            height: 300,
            format: 'jpeg',
            flatten: true
        }], RESIZE_OPTS))
        .pipe(gulp.dest('dist/assets/swag-img'));
});

gulp.task('swag-img', gulp.series('swag-img:clean', 'swag-img:download' , 'swag-img:optimize'));

gulp.task('clean', () => {
    return del([
        './rev-manifest.json',
        'dist/assets/css/*',
        'dist/assets/js/*',
        'dist/assets/swag-img/*'
    ]);
});

gulp.task('cachebust', cb => {
    const bustedFiles = [
        'dist/assets/css/*',
        'dist/assets/js/*',
        'dist/assets/swag-img/*'
    ];

    return gulp.src(bustedFiles, {base: 'dist/assets/'})
        .pipe(cachebust())
        .pipe(cacheClean())
        .pipe(gulp.dest('dist/assets'))
        .pipe(cachebust.manifest({
            base: 'dist/assets',
            merge: true
        }))
        .pipe(gulp.dest('dist/assets/'))
        .on('end', () => {
            delete require.cache[require.resolve('./rev-manifest.json')];
            const manifest = require('./rev-manifest.json');
            swagList.forEach(swag => {
                const filename = `swag-img/${swag.image.split('/').pop()}`;
                if (!manifest[filename]) {
                    console.warn('Unable to find image in manifest:', filename);
                    return;
                }
                swag.image = `/assets/${manifest[filename]}`;
            });

            cb();
        });
});

gulp.task('webserver', () => {
    return gulp.src('dist')
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});

gulp.task('watch', () => {
    gulp.watch('src/pug/**/*.pug', gulp.parallel('pug'));
    gulp.watch('src/styl/**/*.styl', gulp.series('clean', 'styl', 'cachebust'));
    gulp.watch('src/js/*.js', gulp.series('clean', 'js', 'cachebust'));
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel(
        gulp.series('swag-img', 'cachebust', 'pug'), 'styl', 'js', 'img'
    )
));

gulp.task('default', gulp.series('build', 'webserver', 'watch'));
