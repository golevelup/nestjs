import * as ts from 'typescript';
import { getDecoratorName, isObjectLike } from './utils/ast-utils';
import { compact, head } from 'lodash';
import {
  getDecoratorOrUndefinedByNames,
  hasPropertyKey,
  getTypeReferenceAsString,
  replaceImportPath,
} from './utils/plugin-utils';
import { MetaField } from '../hasura.events.interfaces';

type DecoratorInput = {
  args: MetaField[];
};

const defaultTypesMapping = [
  [ts.SyntaxKind.NumberKeyword, 'Int'],
  [ts.SyntaxKind.StringKeyword, 'String'],
];

const isFilenameMatched = (patterns: string[], filename: string) =>
  patterns.some((path) => filename.includes(path));

function serializeSymbol(checker: ts.TypeChecker, symbol: ts.Symbol) {
  return {
    name: symbol.getName(),
    documentation: ts.displayPartsToString(
      symbol.getDocumentationComment(checker)
    ),
    type: checker.typeToString(
      checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
    ),
  };
}

function createArgsPropertyAssignment(input: DecoratorInput) {
  return ts.createPropertyAssignment(
    'args',
    ts.createArrayLiteral(
      input.args.map((field) =>
        ts.createObjectLiteral([
          ts.createPropertyAssignment(
            'name',
            ts.createStringLiteral(field.name)
          ),
          ts.createPropertyAssignment(
            'type',
            ts.createStringLiteral(field.type)
          ),
        ])
      )
    )
  );
}

function createDecoratorObjectLiteralExpr(
  node: ts.MethodDeclaration,
  typeChecker: ts.TypeChecker,
  input: DecoratorInput,
  existingProperties: ts.NodeArray<
    ts.PropertyAssignment
  > = ts.createNodeArray(),
  hostFilename: string
): ts.ObjectLiteralExpression {
  const properties = [
    ...existingProperties,
    createArgsPropertyAssignment(input),
    // createTypePropertyAssignment(
    //   node,
    //   typeChecker,
    //   existingProperties,
    //   hostFilename
    // ),
  ];
  return ts.createObjectLiteral(compact(properties));
}

// function createTypePropertyAssignment(
//   node: ts.MethodDeclaration,
//   typeChecker: ts.TypeChecker,
//   existingProperties: ts.NodeArray<ts.PropertyAssignment>,
//   hostFilename: string
// ) {
//   if (hasPropertyKey('type', existingProperties)) {
//     return undefined;
//   }
//   const signature = typeChecker.getSignatureFromDeclaration(node);
//   const type = typeChecker.getReturnTypeOfSignature(signature!);
//   if (!type) {
//     return undefined;
//   }
//   let typeReference = getTypeReferenceAsString(type, typeChecker);
//   if (!typeReference) {
//     return undefined;
//   }
//   if (typeReference.includes('node_modules')) {
//     return undefined;
//   }
//   typeReference = replaceImportPath(typeReference, hostFilename);
//   return ts.createPropertyAssignment(
//     'type',
//     ts.createIdentifier(typeReference!)
//   );
// }

function addDecoratorToNode(
  compilerNode: ts.MethodDeclaration,
  typeChecker: ts.TypeChecker,
  hostFilename: string,
  input: DecoratorInput
): ts.MethodDeclaration {
  const node = ts.getMutableClone(compilerNode);

  const nodeArray = node.decorators || ts.createNodeArray();
  const { pos, end } = nodeArray;

  node.decorators = Object.assign(
    [
      ...nodeArray,
      ts.createDecorator(
        ts.createCall(ts.createIdentifier(`HasuraActionInputSDL`), undefined, [
          createDecoratorObjectLiteralExpr(
            node,
            typeChecker,
            input,
            ts.createNodeArray(),
            hostFilename
          ),
        ])
      ),
    ],
    { pos, end }
  );
  return node;
}

export const before = (options?: Record<string, any>, program?: ts.Program) => {
  return (ctx: ts.TransformationContext): ts.Transformer<any> => {
    return (sf: ts.SourceFile) => {
      if (isFilenameMatched(['.service.ts'], sf.fileName)) {
        console.log(`Scanning ${sf.fileName} for Hasura action handlers`);

        // find methods with decorators

        const typeChecker = program!.getTypeChecker();
        // sf = this.updateImports(sourceFile);

        const visitNode = (node: ts.Node): ts.Node => {
          if (
            ts.isMethodDeclaration(node) &&
            getDecoratorOrUndefinedByNames(
              ['HasuraActionHandler'],
              node.decorators
            )
          ) {
            // We found a method that's designated as a Hasura action handler!

            const inputParam = node.parameters[0];
            if (!inputParam || !inputParam.type) {
              throw new Error('Action handler requires a parameter for input');
            }

            // We want to find out it's method arguments in the first position in order to build the Action input SDL
            const actionInputParamType = typeChecker.getTypeAtLocation(
              inputParam.type
            );

            // console.log(isObjectLike(actionInputParamType));

            if (isObjectLike(actionInputParamType)) {
              // const wishfulThinking = typeChecker
              //   .getPropertiesOfType(actionInputParamType)
              //   .map((x) => {
              //     console.log(serializeSymbol(typeChecker, x));

              //     const valueDeclaration = x.valueDeclaration;
              //     if (ts.isPropertySignature(valueDeclaration)) {
              //       return (<ts.PropertySignature>valueDeclaration).type!.kind;
              //     }
              //   });

              // console.log(wishfulThinking);

              return addDecoratorToNode(node, typeChecker, sf.fileName, {
                args: typeChecker
                  .getPropertiesOfType(actionInputParamType)
                  .map((x) => {
                    const propSig = <ts.PropertySignature>x.valueDeclaration;

                    return {
                      name: x.getName(),
                      type: `${propSig.type!.getText()}${
                        propSig.questionToken ? '' : '!'
                      }`,
                    };
                  }),
              });
            } else {
              throw new Error(
                `Cannot process action input of type '${inputParam.type!.getText()}'`
              );
            }
          }

          return ts.visitEachChild(node, visitNode, ctx);
        };

        return ts.visitNode(sf, visitNode);
      }

      return sf;
    };
  };
};
