"use strict";

declare let exports: {
    convert(options: ES.FX.JS.Gulp.Resx.IConvertOptions): any;
};
declare let require: any;
let $os = require("os");
let $through2 = require("through2");
let $Buffer = require("buffer").Buffer;
let $gutil = require("gulp-util");
var $PluginError = $gutil.PluginError;
let $path = require("path");
let $xml = require("xml2js");


exports.convert = (options: ES.FX.JS.Gulp.Resx.IConvertOptions): any => {
    return $through2.obj(function(file, enc, cb) {
        if (file.isStream()) {
            this.emit("error", new $PluginError("moonstone-resx", "Streaming not supported"));
        } else if (file.isBuffer()) {
            const convertedFiles = (new ES.FX.JS.Gulp.Resx.Converter(file, options)).convert();
            for (let convertedFile of convertedFiles) {
                this.push(convertedFile);
            }
        }
        return cb();
    });
};