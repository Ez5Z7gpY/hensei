const {src, dest, watch, series}  = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const replace = require('gulp-replace');
const preprocess = require('gulp-preprocess');

// sass
function cssCompile(done){
	src('./src/css/*.scss')
		.pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(cleanCSS())
		.pipe(dest('./docs'));
	done();
};

// js minify
function jsMinify(done){
	src([
			'./src/js/**.js',
		])
		.pipe(preprocess())
		.pipe(uglify())
		.pipe(dest('./docs'));
	done();
};

// キャッシュ
function cache(done) {
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

// ビルド
exports.build = series(jsMinify, cssCompile, cache);

// 動作設定
exports.default = function() {
	watch('./src/css/**/*.scss', series(cssCompile, cache));
	watch('./src/js/*.js', series(jsMinify, cache));
	watch('./src/*.html', series(cache));
};
