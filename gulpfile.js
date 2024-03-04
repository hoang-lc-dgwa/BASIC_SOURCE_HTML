import { register } from "node:module";
import { pathToFileURL } from "node:url";
register("module", pathToFileURL("./"));
register("ts-node/esm", pathToFileURL("./"));

import gulp from "gulp";
import plumber from "gulp-plumber";
import autoprefixer from "gulp-autoprefixer";
import browserSync from "browser-sync";
import { sync as rimraf } from "rimraf";
import ssi from "gulp-ssi";
import prettyHtml from "gulp-pretty-html";
import htmlhint from "gulp-htmlhint";
import gulpSass from "gulp-sass";
import * as sass from "sass";
import sourcemaps from "gulp-sourcemaps";
import wait from "gulp-wait";
import notify from "gulp-notify";
import babel from "gulp-babel";
import imagemin from "gulp-imagemin";
import gifsicle from "imagemin-gifsicle";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import cpx from "cpx";

const SRC_PATH = "./src";
const DIST_PATH = "./dist";
const PUBLIC_PATH = "./public";
const assetsPath = "/assets";

const minFiles = `${DIST_PATH}/**/[^_]*.{png,jpg,gif,svg}`;
const minOptions = [
  imageminPngquant({
    quality: [0.7, 0.85],
    speed: 1,
  }),
  imageminMozjpeg({
    quality: 85,
    progressive: true,
  }),
  gifsicle(),
];

const minImageFiles = () => {
  return gulp
    .src(minFiles)
    .pipe(
      imagemin(minOptions, {
        verbose: true,
      })
    )
    .pipe(gulp.dest(DIST_PATH));
};

const htmlFiles = [`${SRC_PATH}/html/**/[^_]*.html`];

const html = () => {
  return gulp
    .src(htmlFiles)

    .pipe(
      ssi({
        root: `${SRC_PATH}/assets`,
      })
    )
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(
      prettyHtml({
        indent_size: 2,
      })
    )
    .pipe(gulp.dest(DIST_PATH));
};

const htmlInclude = () => {
  return (
    gulp
      .src(htmlFiles)
      .pipe(
        plumber({
          errorHandler: notify.onError("Error: <%= error.message %>"),
        })
      )
      // .pipe(ssi({
      //   root: `${SRC_PATH}/assets/include`
      // }))
      .pipe(
        prettyHtml({
          indent_size: 2,
        })
      )
      .pipe(gulp.dest(DIST_PATH))
  );
};

const validateHTML = () => {
  return gulp
    .src(`${DIST_PATH}/**/*.html`)
    .pipe(htmlhint(".htmlhintrc"))
    .pipe(htmlhint.reporter());
};

const gulpSassCompiler = gulpSass(sass);

const scss = () => {
  return (
    gulp
      .src(`${SRC_PATH}/assets/scss/**/*.scss`)
      .pipe(wait(500))
      .pipe(sourcemaps.init())
      .pipe(
        plumber({
          errorHandler: notify.onError("Error: <%= error.message %>"),
        })
      )
      .pipe(gulpSassCompiler())
      // .pipe(gulpSassCompiler({ outputStyle: "compressed" }))
      .pipe(
        gulpSassCompiler({
          outputStyle: "expanded",
        })
      )
      .pipe(
        autoprefixer({
          cascade: false,
          overrideBrowserslist: [
            "last 2 versions",
            "ie 11",
            "firefox >= 30",
            "ios >= 9",
            "android >= 4.4",
          ],
        })
      )
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(`${DIST_PATH}/assets/`))
      .pipe(browserSync.stream())
  );
};

const script = () => {
  return gulp
    .src(`${SRC_PATH}/assets/scripts/**/[^_]*.js`)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(babel())
    .pipe(gulp.dest(`${DIST_PATH}/assets/`));
};

const staticFiles = () => {
  return gulp
    .src(`${SRC_PATH}/assets/static/**/[^_]*`)
    .pipe(gulp.dest(`${DIST_PATH}/assets/`));
  // .pipe(browserSync.stream());
};

const staticFilesInclude = () => {
  return gulp
    .src(`${SRC_PATH}/assets/include/**/[^_]*`)
    .pipe(gulp.dest(`${DIST_PATH}/assets/include`));
  // .pipe(browserSync.stream());
};

const clean = (done) => {
  rimraf(DIST_PATH, done());
};

const routesOptions = {};
routesOptions[assetsPath] = `${SRC_PATH}/assets/static`;

const serve = (done) => {
  browserSync({
    server: {
      baseDir: [DIST_PATH],
      routes: routesOptions,
    },
    port: 4444,
    open: "external",
    startPath: "/",
  });
  done();
};

const browserReload = (done) => {
  browserSync.reload();
  done();
};

const sync = (done) => {
  cpx.copy(
    `${DIST_PATH}/**/*.*`,
    PUBLIC_PATH,
    {
      clean: true,
      filter: (filePath) => !filePath.includes(".DS_Store"),
    },
    done
  );
};

const watchFiles = (done) => {
  gulp.watch(
    `${SRC_PATH}/html/**/*.html`,
    gulp.series(html, validateHTML, browserReload)
  );
  gulp.watch(`${SRC_PATH}/assets/scss/**/*.scss`, scss);
  gulp.watch(`${SRC_PATH}/assets/static/**/*`, gulp.series(browserReload));
  gulp.watch(
    `${SRC_PATH}/assets/scripts/**/*.js`,
    gulp.series(script, browserReload)
  );
  gulp.watch(
    `${SRC_PATH}/assets/include/**/*`,
    gulp.series(html, validateHTML, browserReload)
  );

  done();
};

const buildFiles = gulp.series(
  clean,
  gulp.parallel(html, scss, script),
  validateHTML
);
const buildFilesInclude = gulp.series(
  clean,
  gulp.parallel(htmlInclude, scss, script),
  validateHTML
);

const min = gulp.series(minImageFiles);
const dev = gulp.series(buildFiles, serve, watchFiles);
const build = gulp.series(buildFiles, staticFiles, minImageFiles);
const prod = gulp.series(
  buildFilesInclude,
  staticFiles,
  staticFilesInclude,
  minImageFiles,
  sync
);

export {
  minImageFiles,
  html,
  validateHTML,
  scss,
  script,
  staticFiles,
  staticFilesInclude,
  clean,
  serve,
  browserReload,
  sync,
  watchFiles,
  buildFiles,
  buildFilesInclude,
  min,
  dev,
  build,
  prod,
};
