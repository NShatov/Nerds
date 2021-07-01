const {src, dest, series, watch, parallel} = require('gulp')
const sass = require('gulp-sass')
const plumber = require('gulp-plumber')
const sourcemap = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')
const del = require('del')
const svgstore = require('gulp-svgstore')
const rename = require('gulp-rename')
const htmlmin = require('gulp-htmlmin')
const csso = require('gulp-csso')
const include = require('gulp-file-include')
const imagemin = require('gulp-imagemin')
const uglify = require('gulp-uglify')
const autoprefixer = require('gulp-autoprefixer')
const sync = require('browser-sync').create()

//HTML

const html = () => {
  return src('src/**.html')
    .pipe(include({
      prefix: '@@'
    }))
    /*.pipe(htmlmin({
      collapseWhitespace: true
    }))*/
    .pipe(dest('dist'))
}

exports.html = html;

//Styles

const styles = () => {
  return src('src/scss/style.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 version']
    }))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(dest('dist/css'))
    .pipe(sync.stream());
}

exports.styles = styles;

//IMAGES

const images = () => {
  return src('src/img/**/*.{jpg,png,svg}')
    .pipe(imagemin([
      imagemin.mozjpeg({
        quality: 80,
        progressive: true
      }),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(dest('dist/img'))
}

exports.images = images;

//Sprite

const sprite = () => {
  return src('src/img/*-icon.svg')
    .pipe(svgstore({
      inLineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(dest('dist/img'))
}

exports.sprite = sprite;

//COPY

const copy = (done) => {
  src([
    "src/fonts/*.{woff2,woff}",
    "src/*.ico"
  ], {
    base: "src"
  })
    .pipe(dest("dist"))
  done();
}

exports.copy = copy;

//Scripts

const scripts = () => {
  return src('src/js/script.js')
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(dest('dist/js'))
    .pipe(sync.stream())
}

exports.scripts = scripts;

//CLEAR

const clear = () => {
  return del('dist')
}

exports.clear = clear;

//Server

const server = () => {
  sync.init({
    server:'./dist'
  });

  watch('src/**/*.html', series(html)).on('change', sync.reload);
  watch('src/scss/**/*.scss', series(styles)).on('change', sync.reload);
}

exports.server = series(
  clear,
  parallel(
    styles,
    html,
    images,
    scripts,
    sprite,
    copy
  ),
  series(
    server
  )
  );

exports.build = series(clear, styles, html, images, scripts, copy, sprite);
