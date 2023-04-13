var argv = require('minimist')(process.argv.slice(2)),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    sass = require('gulp-sass')(require('sass')),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    minify = require('gulp-minify');

var config = {
  maps: !argv.production
};

gulp.task('sass', function() {
  return gulp.src('./src/*.sass')
    .pipe(gulpif(config.maps, sourcemaps.init()))
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('js', function() {
  return gulp.src('./src/*.js')
    .pipe(minify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('serve', gulp.series('sass', 'js', function() {
  gulp.watch("./src/*.sass", gulp.series('sass'));
  gulp.watch('./src/*.js', gulp.series('js'));
}));

gulp.task('default', gulp.series('serve'));