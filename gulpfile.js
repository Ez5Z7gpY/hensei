const {src, dest, watch, series}  = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const preprocess = require('gulp-preprocess');
const browserSync = require('browser-sync');


// sass
const cssCompile = (done) => {
	src('./src/css/*.scss')
		.pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(cleanCSS())
		.pipe(dest('./docs'));
	done();
};

// js minify
const jsMinify = (done) => {
	src([
			'./src/js/**.js',
		])
		.pipe(preprocess())
		.pipe(uglify())
		.pipe(dest('./docs'));
	done();
};

// キャッシュ
const cache = (done) => {
	src([
			'./src/*.html',
			'!./docs/*.html'
		])
		.pipe(preprocess())
		.pipe(replace('.css"','.css?' + new Date().getTime() + '"'))
		.pipe(replace('.js"','.js?' + new Date().getTime() + '"'))
		.pipe(dest('./docs'));
	done();
};

const browser_sync = (done) => {
	browserSync.init({
	  server: {
		baseDir: './docs',
		index: 'index.html'
	  },
	  port: 3000
	});
};

const watching = (done) => {
	watch('./src/css/**/*.scss', series(cssCompile, cache));
	watch('./src/js/*.js', series(jsMinify, cache));
	watch('./src/*.html', series(cache));
    done();
};

const build = series(jsMinify, cssCompile, cache);

// ビルド
exports.build = build;

// 動作設定
exports.default = series(build, watching, browser_sync);
