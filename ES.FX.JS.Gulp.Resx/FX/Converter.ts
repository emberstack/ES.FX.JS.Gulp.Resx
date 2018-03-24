namespace ES.FX.JS.Gulp.Resx {
    "use strict";

    export class Converter {
        private readonly $filePath: any;
        private readonly $dictionary: IDictionary = {};
        private readonly $culture: string = null;

        constructor(
            private readonly $file: any,
            private readonly $options: IConvertOptions) {

            this.$filePath = $path.parse(this.$file.path);

            const cultureRegex = new RegExp(/.*\.([a-zA-Z]{2}-[a-zA-Z]{2}|[a-zA-Z]{2})/g);
            const cultureMatches = cultureRegex.exec(this.$filePath.name);
            if (cultureMatches != null && cultureMatches.length > 1) {
                this.$culture = cultureMatches[1];
            }
            (new $xml.Parser()).parseString(this.$file.contents,
                (err: any, result: any) => {
                    if (err != null || result == null)
                        throw new Error(`Could not parse XML in file ${this.$file.path}`);
                    if (result.root.data != null) {
                        for (let resource of result.root.data) {
                            const key = resource.$.name;
                            const value = resource.value.toString();
                            const type = {
                                csharp: "string",
                                typescript: "string",
                                raw: false
                            };
                            if (resource.comment) {
                                const comment = resource.comment;
                                try {
                                    const commentType = JSON.parse(comment);
                                    if (commentType.csharp) type.csharp = commentType.csharp;
                                    if (commentType.typescript) type.typescript = commentType.typescript;
                                    if (commentType.raw === true) type.raw = commentType.raw;
                                } catch (Error) {
                                }
                            }
                            this.$dictionary[key] = { value: value, type: type };
                        }
                    }
                });
        }

        convert = (): any[] => {
            $gutil.log(
                `Converting file '${this.$file.path}' | Properties found: ${Object.keys(this.$dictionary).length
                } | Culture: '${this.$culture || ""}'`);
            var result = [];
            if (this.$options == null) {
                $gutil.log(`No options provided. No conversion possible`);
                return result;
            }

            if (this.$options.json) {
                result = result.concat(this.convertToJson());
            }
            if (this.$options.typescript) {
                result = result.concat(this.convertToTypeScript());
            }
            if (this.$options.csharp) {
                result = result.concat(this.convertToCSharp());
            }
            return result;
        };

        private convertToJson(): any[] {
            let source = `{${$os.EOL}`;
            const keys = Object.keys(this.$dictionary);
            for (let key of keys) {
                const property = this.$dictionary[key];
                const value: any = property.type.raw ? property.value : JSON.stringify(property.value);
                const comma = keys.indexOf(key) !== keys.length - 1 ? "," : "";
                source += `\t"${key}": ${value}${comma}${$os.EOL}`;
            }
            source += `}`;

            const file = this.$file.clone();
            file.path = $path.join(this.$filePath.dir, `${this.$filePath.name}.json`);
            file.contents = new $Buffer(source);
            return [file];
        }

        private convertToTypeScript(): any[] {
            let result = [];
            if (!this.$options.typescript.source && !this.$options.typescript.declaration) return result;

            const namespace = this.$options.typescript.namespace ? this.$options.typescript.namespace : "Resx";
            let interfaceName = this.$filePath.name;
            let variableName = `$Resx_${interfaceName}`;

            if (!this.$options.typescript.culturesDisabled && this.$culture !== null) {
                interfaceName = interfaceName.substring(0, interfaceName.lastIndexOf(`.${this.$culture}`));
                variableName = `$Resx_${interfaceName}_${this.$culture.replace("-", "_")}`;
            }

            if (this.$options.typescript.declaration) {
                let declaration = `declare namespace ${namespace} { ${$os.EOL}`;
                declaration += `\tinterface ${interfaceName} { ${$os.EOL}`;
                for (let key of Object.keys(this.$dictionary)) {
                    const property = this.$dictionary[key];
                    declaration += `\t\t${key}: ${property.type.typescript};${$os.EOL}`;
                }
                declaration += `\t}${$os.EOL}`;
                if (this.$options.typescript.source) {
                    declaration += `\tvar ${variableName}: ${interfaceName};${$os.EOL}`;
                }
                declaration += `}${$os.EOL}`;

                const declarationFile = this.$file.clone();
                declarationFile.path = $path.join(this.$filePath.dir, `${this.$filePath.name}.d.ts`);
                declarationFile.contents = new $Buffer(declaration);
                result.push(declarationFile);
            }

            if (this.$options.typescript.source) {
                let source = `namespace ${namespace} { ${$os.EOL}`;

                source += `\texport interface ${interfaceName} { ${$os.EOL}`;
                for (let key of Object.keys(this.$dictionary)) {
                    const property = this.$dictionary[key];
                    source += `\t\t${key}: ${property.type.typescript};${$os.EOL}`;
                }
                source += `\t}${$os.EOL}`;

                source += `\texport var ${variableName}: ${interfaceName} = <${interfaceName}>{ ${$os.EOL}`;
                const keys = Object.keys(this.$dictionary);
                for (let key of keys) {
                    const property = this.$dictionary[key];
                    const value: any = property.type.raw ? property.value : JSON.stringify(property.value);
                    let comma = keys.indexOf(key) !== keys.length - 1 ? "," : "";
                    source += `\t\t${key}: ${value}${comma}${$os.EOL}`;
                }
                source += `\t}${$os.EOL}`;

                source += `}${$os.EOL}`;


                const sourceFile = this.$file.clone();
                sourceFile.path = $path.join(this.$filePath.dir, `${this.$filePath.name}.ts`);
                sourceFile.contents = new $Buffer(source);
                result.push(sourceFile);
            }

            return result;
        }

        private convertToCSharp(): any[] {
            const result = [];

            const namespace = this.$options.csharp.namespace ? this.$options.csharp.namespace : "Resx";
            const className = `${this.$filePath.name.replace("-", "_").replace(".", "_")}`;


            let source = `using System; ${$os.EOL}  ${$os.EOL}`;
            source += `namespace ${namespace}${$os.EOL}`;
            source += `{${$os.EOL}`;

            source += `\tpublic ${this.$options.csharp.partial ? "partial " : ""}class ${className}${$os.EOL}`;
            source += `\t{${$os.EOL}`;


            const keys = Object.keys(this.$dictionary);
            for (let key of keys) {
                const property = this.$dictionary[key];
                const value: any = property.type.raw ? property.value : JSON.stringify(property.value);
                const equal = this.$options.csharp.properties ? "=>" : "=";
                const memberType = this.$options.csharp.properties ? "static" : "const";
                source += `\t\tpublic ${memberType} ${property.type.csharp} ${key} ${equal} ${value.toString()};${
                    $os.EOL}`;
            }

            source += `\t}${$os.EOL}`;
            source += `}${$os.EOL}`;


            const sourceFile = this.$file.clone();
            sourceFile.path = $path.join(this.$filePath.dir, `${this.$filePath.name}.cs`);
            sourceFile.contents = new $Buffer(source);
            result.push(sourceFile);

            return result;
        }
    }


}