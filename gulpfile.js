const del = require('del');
const gulp = require('gulp');
const cachebust = require('gulp-rev');
const cacheClean = require('gulp-rev-delete-original');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify-es').default;
const pug = require('gulp-pug');
const htmlmin = require('gulp-htmlmin');
const stylus = require('gulp-stylus');
const webserver = require('gulp-webserver');
const concat = require('gulp-concat');
const responsive = require('gulp-responsive');
const merge = require('merge-stream');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const {readFile} = require('fs').promises;

const {swagList, swagImages} = require('./scripts/get-data');
const downloadImages = require('./scripts/download-images');

const PRODUCTION = process.env.NODE_ENV === 'production';

const REV_PATH = './dist/rev-manifest.json';
const RESIZE_OPTS = {
	quality: 90,
	progressive: true,
	compressionLevel: 9,
	errorOnEnlargement: false,
	errorOnUnusedConfig: false
};

let manifest = {
	'css/index.css': 'css/index.css',
	'js/index.js': 'js/index.js'
};

const assetsToBeInlined = ['css/index.css'];

async function getInlinedAssets(config, manifest) {
	const fileMap = new Map();
	const promises = [];
	const assetBasePath = 'dist/assets/';

	config.forEach(name => {
		const assetPath = assetBasePath + manifest[name];
		promises.push(readFile(assetPath, 'utf8')
			.then(contents => fileMap.set(name, contents)));
	});

	await Promise.all(promises);
	return fileMap;
}

gulp.task('pug', async done => {
	const tags = Array.from(swagList.reduce(
		(tagList, {tags}) => {
			tags.filter(tag => tag !== 'expired').forEach(tag => tagList.add(tag));
			return tagList;
		},
		new Set()
	)).sort();

	if (PRODUCTION) {
		delete require.cache[require.resolve(REV_PATH)];
		manifest = require(REV_PATH);
	}

	const bustedAssets = {
		css: `/assets/${manifest['css/index.css']}`,
		js: `/assets/${manifest['js/index.js']}`
	};

	const inlinedAssets = await getInlinedAssets(assetsToBeInlined, manifest);

	gulp.src('src/pug/*.pug')
		.pipe(pug({
			pretty: true,
			locals: {swagList, tags, bustedAssets, inlinedAssets}
		}))
		.pipe(htmlmin({
			collapseWhitespace: true,
			removeComments: true
		}))
		.pipe(gulp.dest('dist/'))
		.on('end', () => done());
});

gulp.task('styl', () => {
	return gulp.src('src/styl/index.styl')
		.pipe(stylus({compress: true}))
		.pipe(postcss([
			autoprefixer()
		]))
		.pipe(gulp.dest('dist/assets/css'));
});

gulp.task('binaries', () => {
	const paths = {
		'src/img/*': 'dist/assets/img',
		'src/fonts/*': 'dist/assets/fonts'
	};

	return merge(Object.entries(paths).map(([from, to]) =>
		gulp.src(from).pipe(gulp.dest(to))
	));
});

gulp.task('js', () => {
	const presets = [
		['@babel/env', {targets: {browsers: ['> 75%']}}]
	];
	return gulp.src('src/js/*.js')
		.pipe(concat('index.js'))
		.pipe(babel({presets}))
		.pipe(uglify())
		.pipe(gulp.dest('dist/assets/js'));
});

gulp.task('swag-img:clean', () => {
	return del('dist/assets/swag-img/*');
});

gulp.task('swag-img:download', async () => {
	const success = await downloadImages(swagImages, 'dist/assets/swag-img');
	if (!success) {
		throw new Error('Failed to download images');
	}
});

gulp.task('swag-img:optimize', cb => {
	const jpegOutputConfig = {
		name: '*.jpeg',
		height: 300,
		flatten: true
	};
	const webpOutputConfig = Object.assign({
		rename: i => `${i.basename}.webp`
	}, jpegOutputConfig);

	return gulp.src('dist/assets/swag-img/*')
		.pipe(responsive([jpegOutputConfig, webpOutputConfig], RESIZE_OPTS))
		.pipe(gulp.dest('dist/assets/swag-img'))
		.on('end', () => {
			swagList.forEach(swag => {
				const baseName = swag.image.split('.').slice(0, -1).join('.');
				swag.images = {
					jpeg: swag.image,
					webp: `${baseName}.webp`
				};
			});
			cb();
		});
});

gulp.task('swag-img', gulp.series('swag-img:clean', 'swag-img:download', 'swag-img:optimize'));

gulp.task('clean:styl', () => del('dist/assets/css/*'));
gulp.task('clean:js', () => del('dist/assets/js/*'));
gulp.task('clean:binaries', () => del(['dist/assets/img/*', 'dist/assets/fonts/*']));
gulp.task('clean:assets', gulp.parallel('clean:styl', 'clean:js', 'clean:binaries'));
gulp.task('clean:pug', () => del('dist/index.html'));
gulp.task('clean', gulp.parallel('clean:pug', 'clean:assets'));

gulp.task('cachebust', cb => {
	if (!PRODUCTION) {
		return cb();
	}

	const basePath = 'dist/assets';
	const bustedFiles = [
		'dist/assets/css/*',
		'dist/assets/js/*',
		'dist/assets/swag-img/*'
	];

	return gulp.src(bustedFiles, {base: basePath})
		.pipe(cachebust())
		.pipe(cacheClean())
		.pipe(gulp.dest(basePath))
		.pipe(cachebust.manifest({
			path: REV_PATH,
			base: basePath
		}))
		.pipe(gulp.dest(basePath))
		.on('end', () => {
			delete require.cache[require.resolve(REV_PATH)];
			manifest = require(REV_PATH);
			swagList.forEach(swag => {
				Object.entries(swag.images).forEach(([extension, fileName]) => {
					fileName = `swag-img/${fileName.split('/').pop()}`;
					if (!manifest[fileName]) {
						console.warn(`Unable to find image ${fileName} in the manifest`);
						return;
					}

					swag.images[extension] = `/assets/${manifest[fileName]}`;
				});
			});

			cb();
		});
});

gulp.task('webserver', () => {
	return gulp.src('dist')
		.pipe(webserver({
			livereload: true,
			open: true,
			host: process.env.GULP_LISTEN_HOST || '127.0.0.1',
			port: Number.parseInt(process.env.GULP_LISTEN_PORT || '8080', 10)
		}));
});

gulp.task('watch', () => {
	gulp.watch('src/pug/**/*.pug', gulp.series('pug'));
	gulp.watch('src/styl/**/*.styl', gulp.series('styl'));
	gulp.watch('src/js/*.js', gulp.series('js'));
});

gulp.task('build', gulp.series(
	'clean',
	gulp.parallel(
		gulp.series('swag-img', 'styl', 'cachebust', 'pug'), 'js', 'binaries'
	)
));

gulp.task('default', gulp.series('build', 'webserver', 'watch'));
