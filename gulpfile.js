const gulp = require('gulp');
const babel = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const buffer = require('vinyl-buffer');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const autoprefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const historyApiFallback = require('connect-history-api-fallback');

gulp.task('js', () => {
    browserify('dev/scripts/main.js')
        .transform('babelify', {
            presets: ['es2015','react']
        })
        .bundle()
        .on('error',notify.onError({
            message: "Error: <%= error.message %>",
            title: 'Error in JS 💀'
        }))
        .pipe(source('main.js'))
        .pipe(buffer())
        .pipe(gulp.dest('public/scripts/'))
        .pipe(reload({stream:true}));
});

gulp.task('bs', () => {
    browserSync.init({
        server: {
            baseDir: './'
        }, 
        middleware: [historyApiFallback()]
    });
});

gulp.task("styles", () => {
   return gulp.src("./dev/styles/**/*.scss")
   .pipe(sass().on("error",sass.logError))
   .pipe(autoprefixer('last 5 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
   .pipe(concat("style.css"))
   .pipe(plumber())
   .pipe(gulp.dest("./public/styles"))
   .pipe(reload({stream: true}));
});


gulp.task('default', ['js','bs', 'styles'], () => {
    gulp.watch('dev/**/*.js',['js']);
    gulp.watch('./public/style.css',reload);
    gulp.watch('./dev/styles/*.scss', ['styles']);
});