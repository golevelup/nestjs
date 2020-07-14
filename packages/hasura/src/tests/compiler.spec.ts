import * as ts from 'typescript';
import { exampleServiceText } from './fixtures/example.service';
import { before } from '../plugin';

describe('stuff', () => {
  it('does things', () => {
    const options: ts.CompilerOptions = {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      newLine: ts.NewLineKind.LineFeed,
      noEmitHelpers: true,
      strict: true,
    };
    const filename = 'example.service.ts';
    const fakeProgram = ts.createProgram([filename], options);

    const result = ts.transpileModule(exampleServiceText, {
      compilerOptions: options,
      fileName: filename,
      transformers: {
        before: [before({}, fakeProgram)],
      },
    });

    console.log(result.outputText);
  });

  it('generates hasura decorator config automatically', () => {
    expect(42).toBe(42);
  });
});
