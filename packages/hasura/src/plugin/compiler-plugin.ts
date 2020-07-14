import * as ts from 'typescript';
import { getDecoratorName } from './utils/ast-utils';
import { compact, head } from 'lodash';
import {
  getDecoratorOrUndefinedByNames,
  hasPropertyKey,
  getTypeReferenceAsString,
  replaceImportPath,
} from './utils/plugin-utils';

const isFilenameMatched = (patterns: string[], filename: string) =>
  patterns.some((path) => filename.includes(path));

function createArgsPropertyAssignment() {
  return ts.createPropertyAssignment(
    'args',
    ts.createArrayLiteral([
      ts.createObjectLiteral([
        ts.createPropertyAssignment('name', ts.createStringLiteral('id')),
        ts.createPropertyAssignment('type', ts.createStringLiteral('uuid')),
      ]),
      ts.createObjectLiteral([
        ts.createPropertyAssignment('name', ts.createStringLiteral('userDto')),
        ts.createPropertyAssignment(
          'type',
          ts.createStringLiteral('UpdateUserProfileActionDto')
        ),
      ]),
    ])
  );
}

function createDecoratorObjectLiteralExpr(
  node: ts.MethodDeclaration,
  typeChecker: ts.TypeChecker,
  existingProperties: ts.NodeArray<
    ts.PropertyAssignment
  > = ts.createNodeArray(),
  hostFilename: string
): ts.ObjectLiteralExpression {
  const properties = [
    ...existingProperties,
    createArgsPropertyAssignment(),
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
  hostFilename: string
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

            // We want to find out it's method arguments in the first position in order to build the Action input SDL
            console.log(node.parameters[0].type!.getText());

            const inputParam = node.parameters[0];
            if (!inputParam || !inputParam.type) {
              throw new Error('Action handler requires a parameter for input');
            }

            // const something = inputParam
            //   .type!.getChildren()
            //   .map((x) => x.getText());

            // const something = inputParam!.type.getChildren()[0] as ts.Identifier;
            const something = inputParam!.type;

            const typeThing = typeChecker.getTypeAtLocation(inputParam.type);

            console.log(
              typeChecker.getPropertiesOfType(typeThing).map((x) => ({
                name: x.getName(),
                type: x.valueDeclaration.forEachChild((y) =>
                  console.log(y.kind)
                ),
              }))
            );

            // inputParam.type.forEachChild((x) => console.log(x.kind));

            // console.log(something);

            // ts.visitEachChild(inputParam.type, () => )

            return addDecoratorToNode(node, typeChecker, sf.fileName);
          }

          return ts.visitEachChild(node, visitNode, ctx);
        };

        return ts.visitNode(sf, visitNode);
      }

      return sf;
    };
  };
};
