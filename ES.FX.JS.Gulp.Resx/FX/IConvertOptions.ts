namespace ES.FX.JS.Gulp.Resx {
    "use strict";

    export interface IConvertOptions {
        json: {
        };
        typescript: {
            culturesDisabled: boolean;
            namespace: string;
            source: boolean;
            declaration: boolean;
        };
        csharp: {
            namespace: string;
            properties: boolean;
            partial: boolean;
        };
    }
}