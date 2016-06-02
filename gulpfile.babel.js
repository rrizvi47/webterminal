import gulp from "gulp";
import pkg from "./package.json";
import cssNano from "gulp-cssnano";
import uglify from "gulp-uglify";
import replace from "gulp-replace";
import rimraf from "gulp-rimraf";
import scss from "gulp-sass";
import rename from "gulp-rename";
import preprocess from "gulp-preprocess";
import browserify from "browserify";
import babelify from "babelify";
import sourceStream from "vinyl-source-stream";
import buffer from "vinyl-buffer";
//import sourcemaps from "gulp-sourcemaps";
import fs from "fs";

let INSTALLER_CLASS_NAME = `${ pkg["packageName"] }.Installer`;

let dir = __dirname,
    dest = `${dir}/build`,
    source = `${dir}/source`,
    context = {
        context: {
            package: pkg,
            compileAfter: "", // is set during "pre-cls" task.
            themes: "" // is set after css move task
        }
    },
    themes = [];

function themesReady () { // triggered when build is done
    themes = fs.readdirSync(`${ dest }/client/css/themes`);
    context.context.themes = themes.map(function (n) {
        return ', "' + n.replace(/\..*$/, "") + '": "css/themes/' + n + '"';
    }).join("");
}

gulp.task("clean", function () {
    return gulp.src(dest, { read: false })
        .pipe(rimraf());
});

gulp.task("html", ["clean"], function () {
    return gulp.src(`${ source }/client/index.html`)
        .pipe(gulp.dest(`${ dest }/client`));
});

gulp.task("scss", ["clean"], () => {
    return gulp.src([`${source}/client/scss/index.scss`])
        .pipe(preprocess(context))
        .pipe(scss())
        .pipe(cssNano({
            zindex: false
        }))
        .pipe(gulp.dest(`${dest}/client/css`));
});

gulp.task("js", ["clean", "css"], function () {
    let bundler = browserify({
        entries: `${source}/client/js/index.js`,
        debug: true
    });
    bundler.transform(babelify);
    return bundler.bundle()
        .on("error", function (err) { console.error("An error occurred during bundling:", err); })
        .pipe(sourceStream("index.js"))
        .pipe(buffer())
        //.pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(preprocess(context))
        .pipe(uglify({
            output: {
                ascii_only: true,
                width: 25000,
                max_line_len: 25000
            },
            preserveComments: "some"
        }))
        .pipe(replace(//g, "\\x0B"))
        .pipe(replace(/\x1b/g, "\\x1B"))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(`${ dest }/client/js`));
});

gulp.task("copy-css-themes", ["clean"], function () {
    return gulp.src(`${ source }/client/scss/themes/*.*`)
        .pipe(preprocess(context))
        .pipe(scss())
        .pipe(cssNano())
        .pipe(gulp.dest(`${ dest }/client/css/themes/`));
});

// Need css themes directory copied to collect themes names.
gulp.task("css", ["scss", "copy-css-themes"], function (cb) {
    themesReady();
    cb();
});

gulp.task("pre-cls", ["js", "js", "html", "css", "readme"], () => {
    return gulp.src([`${ source }/cls/**/*.cls`])
        .pipe(rename((f) => {
            f.basename = `${ f.dirname === "." ? "" : f.dirname + "." }${
                f.basename
            }`;
            f.dirname = ".";
            if (f.basename !== INSTALLER_CLASS_NAME)
                context.context.compileAfter +=
                    (context.context.compileAfter ? "," : "") + f.basename;
        }))
        .pipe(gulp.dest(`${dest}/cls`));
});

gulp.task("cls", ["pre-cls"], () => {
    return gulp.src([`${dest}/cls/**/*.cls`])
        .pipe(preprocess(context))
        .pipe(gulp.dest(`${dest}/cls`));
});

gulp.task("readme", ["clean"], function () {
    return gulp.src(`${ dir }/readme.md`)
        .pipe(gulp.dest(`${ dest }`));
});

gulp.task("default", ["cls"]);