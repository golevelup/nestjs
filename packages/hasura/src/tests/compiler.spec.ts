import { convertInterfaceDeclarationToTypeMeta } from './../plugin/utils/additional-utils';
import * as ts from 'typescript';
import {
  exampleServiceText,
  basicInterfaceWithScalars,
  basicInterfaceWithScalarsArrays,
} from './fixtures/example.service';
import { before } from '../plugin';
import { extractTypeMeta } from '../plugin/utils/additional-utils';
import { TypeMeta } from '../hasura.events.interfaces';
import e = require('express');

const options: ts.CompilerOptions = {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ESNext,
  newLine: ts.NewLineKind.LineFeed,
  noEmitHelpers: true,
  strict: true,
};

const cases: [string, TypeMeta][] = [
  // [
  //   basicInterfaceWithScalars,
  //   {
  //     name: 'BasicInterfaceWithScalars',
  //     fields: [
  //       { name: 'val1', type: 'Int!' },
  //       { name: 'val2', type: 'String' },
  //     ],
  //   },
  // ],
  [
    basicInterfaceWithScalarsArrays,
    {
      name: 'BasicInterfaceWithScalarArrays',
      fields: [
        { name: 'val1', type: '[Int]!' },
        { name: 'val2', type: '[String]' },
      ],
    },
  ],
];

describe('Compiler Transformations', () => {
  it.skip('does things', () => {
    const fileName = 'example.service.ts';
    const fakeProgram = ts.createProgram([fileName], options);

    const result = ts.transpileModule(exampleServiceText, {
      compilerOptions: options,
      fileName: fileName,
      transformers: {
        before: [before({}, fakeProgram)],
      },
    });

    console.log(result.outputText);
  });

  it.each(cases)(
    'can convert to the right meta format %s',
    (typeString, typeMeta) => {
      const fileName = 'example.service.ts';
      const program = ts.createProgram([fileName], options);
      const checker = program.getTypeChecker();

      let nodeUnderTest: ts.Node;

      const visit = (node: ts.Node) => {
        if (node.kind !== ts.SyntaxKind.EndOfFileToken) {
          nodeUnderTest = node;
        }
      };

      const sourceFile = ts.createSourceFile(
        fileName,
        typeString,
        ts.ScriptTarget.ES2019
      );

      ts.forEachChild(sourceFile, visit);

      if (nodeUnderTest! == null) {
        throw new Error('Node under test should be defined');
      }

      if (nodeUnderTest.kind === ts.SyntaxKind.InterfaceDeclaration) {
        const interfaceDeclaration = <ts.InterfaceDeclaration>nodeUnderTest;
        const identifierNode = nodeUnderTest.getChildAt(
          0,
          sourceFile
        ) as ts.Identifier;

        const result = convertInterfaceDeclarationToTypeMeta(
          interfaceDeclaration,
          sourceFile,
          checker
        );

        console.log(result);
        expect(result).toMatchObject(typeMeta);
      }

      // console.log(nodeUnderTest.getChildAt(0, sourceFile).kind);

      // nodeUnderTest.forEachChild((x) => console.log(x.kind));

      // const tsType = checker.getTypeAtLocation(nodeUnderTest);

      // const result = extractTypeMeta(tsType);
      // expect(result).toMatchObject(typeMeta);
    }
  );
});
