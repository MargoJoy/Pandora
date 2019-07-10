const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
const less = require('gulp-less');
const smartgrid = require('smart-grid');

const isDev = (process.argv.indexOf('--dev') !== -1);
const isProd = !isDev;
const isSync = (process.argv.indexOf('--sync') !== -1);


function clear() {
    return del('public/*')
}

function styles() {
    return gulp.src('./src/css/style.less')
        .pipe(gulpif(isDev, sourcemaps.init()))
        .pipe(less())
        .pipe(gcmq())
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 0.1%'],
            cascade: false
        }))
        .pipe(gulpif(isProd, cleanCSS({
            level: 2
        })))
        .pipe(gulpif(isDev, sourcemaps.write()))
        .pipe(gulp.dest('./public/css'))
        .pipe(browserSync.stream());
}

function img() {
    return gulp.src('./src/images/**/*')
        .pipe(gulp.dest('./public/images'))
}

function html() {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./public'))
        .pipe(gulpif(isSync, browserSync.stream()));
}

function watch() {
    if(isSync) {
        browserSync.init({
            server: {
                baseDir: "./public"
            }
        });
    }
    gulp.watch('./src/css/**/*.less', styles);
    gulp.watch('./src/**/*.html', html);
    gulp.watch('./smartgrid.js', grid);
}


function grid(done){
    delete require.cache[require.resolve('./smartgrid.js')];

    let settings = require('./smartgrid.js');
    smartgrid('./src/css', settings);

    settings.offset = '3.1%';
    settings.filename = 'smart-grid-per';
    smartgrid('./src/css', settings);

    done();
}

let build = gulp.series(clear,
    gulp.parallel(styles, img, html)
);

gulp.task('build', build);
gulp.task('watch', gulp.series(build, watch));
gulp.task('grid', grid);