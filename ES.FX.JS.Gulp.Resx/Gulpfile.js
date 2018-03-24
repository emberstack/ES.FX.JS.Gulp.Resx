/// <binding BeforeBuild='ProjectBeforeBuild' ProjectOpened='ProjectOpen' />
var gulp = require("gulp");
var watch = require("gulp-watch");
var jeditor = require("gulp-json-editor");
var util = require("gulp-util");


var $config = {
    package: {
        dir: "../npm-Publish/ES.FX.JS.Gulp.Resx",
        manifestSource: "package.json",
        manifest: "../npm-Publish/ES.FX.JS.Gulp.Resx/package.json"
    }

};


gulp.task("package",
    function() {
        gulp.src([
                "gulp-resx-convert.*",
                "../README.md",
                "../LICENSE"
            ])
            .pipe(gulp.dest($config.package.dir));

        gulp.src($config.package.manifestSource)
            .pipe(jeditor({
                    "version": util.env.version || "1.0.0",
                    "private": false,
                    "scripts": {
                        "test": "echo \"Error: no test specified\" && exit 1",
                        "postinstall": "echo \"Postinstall: No action needed\" ",
                        "Package": "echo \"Package: No action needed\" && exit 1"
                    }
                },
                {
                    "indent_char": "\t",
                    "indent_size": 1
                }))
            .pipe(gulp.dest($config.package.dir));
    });

gulp.task("test",
    function() {
        var resxConverter = require("./gulp-resx-convert.js");

        gulp.src(["./Test/*.resx"]) //Pipe one or more files at a time
            .pipe(resxConverter.convert({
                //Include this for JSON
                json: {},
                //Include this for TypeScript
                typescript: {
                    //Disables support for culture names in file name (ex: File.en-US.resx or File.en.resx).
                    //Default: false
                    culturesDisabled: false,
                    //Sets the namespace to be used.
                    //Default: Resx
                    namespace: "Resx",
                    //Enables converting to .ts files.
                    //Default: false
                    source: true,
                    //Enables converting to .d.ts files
                    //Default: false
                    declaration: true
                },
                csharp: {
                }
            }))
            .pipe(gulp.dest("./Test/Output"));
    });


gulp.task("watch",
    function() {
    });

gulp.task("ProjectOpen", ["watch"]);
gulp.task("ProjectBeforeBuild", function() {});