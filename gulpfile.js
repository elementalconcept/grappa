const gulp = require('gulp');
const imprint = require('gulp-imprint');
const spawn = require('child_process').spawn;
const del = require('del');

imprint(gulp, {
  buildDir: 'staging/dist',
  buildSequence: ['clean', 'packagr'],
  cleanBuildDir: false,
  overlays: ['./README.md', 'LICENSE']
});

gulp.task('clean', () => {
  del.sync('staging');
});

gulp.task('prepare:src', () => {
  return gulp.src('src/app/grappa/**/*')
    .pipe(gulp.dest('staging/src/app/grappa'));
});

gulp.task('prepare:meta', () => {
  return gulp.src(['package/package.json', 'public_api.ts', 'ng-package.json'])
    .pipe(gulp.dest('staging'));
});

gulp.task('prepare', ['prepare:src', 'prepare:meta']);

gulp.task(
  'packagr',
  ['prepare'],
  done => spawn('npm', ['run', 'packagr'], {cwd: '.', stdio: 'inherit'}).on('close', done));
