// NestJS 12 ships ESM only. Compile it to CommonJS for jest, rewriting the one
// ESM-only construct it uses (`import.meta.url` in @nestjs/common's loadPackage).
// ponytail: string swap, drop this file once the specs run as native ESM or on vitest.
const ts = require('typescript');

module.exports = {
  process(src, filename) {
    const { outputText, sourceMapText } = ts.transpileModule(
      src.replaceAll(
        'import.meta.url',
        "require('url').pathToFileURL(__filename).href",
      ),
      {
        fileName: filename,
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
          sourceMap: true,
        },
      },
    );
    return { code: outputText, map: sourceMapText };
  },
};
