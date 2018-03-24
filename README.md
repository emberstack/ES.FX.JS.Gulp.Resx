# gulp-resx-convert - Overview [![NPM version][npm-image]][npm-url]
> A .resx file converter for gulp. Supports multiple output formats, including JSON, Typescript and C# constants class

## Packages & Status
EmberStack Frameworks contain multiple packages. For information about each package please follow the links

---
Package  | Build status | npm 
-------- | :------------ | :------------ 
gulp-resx-convert | [![VSTS](https://sintari.visualstudio.com/_apis/public/build/definitions/34e057ec-f09f-4d30-92f4-5895eeaa3f74/12/badge)](https://sintari.visualstudio.com/ES.FX) |  [![NPM version][npm-image]][npm-url]


## Installation

Add this module as a development dependency:
```shell
npm install --save-dev gulp-resx-convert
```

## Usage

This gulp plugin supports converting .resx files to multiple file types.

```javascript

var resxConverter = require("gulp-resx-convert");

gulp.task("test", function () {

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
                namespace:"Resx",
                //Enables converting to .ts files.
                //Default: false
                source: true,
                //Enables converting to .d.ts files
                //Default: false
                declaration: true
            },
			csharp: {
				//Sets the namespace to be used
				namespace: "Resx"
				//Output as properties or constants. Setting this to true will use properties
				properties: false;
				//Set this to true to create a partial class
				partial: false;
			}
        }))
        .pipe(gulp.dest("./Test/Output"));
});
```


## Types from Resx
To specify the type to use in output instead of a string, use the Comment property in the .resx file to describe the type as in the followin example:
```javascript
{"csharp":"int", "typescript":"number", "raw":true}
```

Setting the raw value to true means that the converter will output the value directly during assignment, without wrapping it in quotes. This should be used when the value is a number, boolean etc.


### Notes
This plugin does not handle scenarios where file names contain spaces or invalid characters.
Please use gulp-rename before converting the files.

[npm-url]: https://npmjs.org/package/gulp-resx-convert
[npm-image]: https://badge.fury.io/js/gulp-resx-convert.svg