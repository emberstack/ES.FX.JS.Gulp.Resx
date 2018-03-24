namespace ES.FX.JS.Gulp.Resx {
    "use strict";

    export interface IDictionary {
        [key: string]: {
            value,
            type: {
                csharp: string;
                typescript: string;
                raw: boolean;
            };
        };
    }
}