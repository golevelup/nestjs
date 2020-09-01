import { TypeMeta, MetaField } from '../../hasura.events.interfaces';
import { isObjectLike } from './ast-utils';
import * as ts from 'typescript';

const defaultTypesMapping: [ts.SyntaxKind, string][] = [
  [ts.SyntaxKind.NumberKeyword, 'Int'],
  [ts.SyntaxKind.StringKeyword, 'String'],
  [ts.SyntaxKind.BooleanKeyword, 'Boolean'],
];

const defaultTypeMap = new Map(defaultTypesMapping);

export const extractTypeMeta = (tsType: ts.Type): TypeMeta => {
  if (!isObjectLike(tsType)) {
    throw new Error('TypeMeta can only be extracted from object like types');
  }
  return {
    name: tsType.symbol.name,
    fields: [],
  };
};

export const extractMetaField = (tsType: ts.Type): MetaField => {
  return {
    name: 'asdf',
    type: 'asdf',
  };
};

const getTypeLabelForSynxtaxKind = (syntaxKind: ts.SyntaxKind) => {
  const matchingType = defaultTypeMap.get(syntaxKind);
  return matchingType || '';
};

export const extractMetaFieldFromPropertySignature = (
  propertySignature: ts.PropertySignature
): MetaField => {
  let typeName = '';

  const propType = propertySignature.type!;
  const propTypeKind = propType.kind;

  if (ts.isTypeReferenceNode(propType)) {
    console.log('found a type reference');
  } else if (ts.isArrayTypeNode(propType)) {
    typeName = `[${getTypeLabelForSynxtaxKind(propType.elementType.kind)}]`;
  } else {
    typeName = getTypeLabelForSynxtaxKind(propTypeKind);
  }

  const matchingType = defaultTypeMap.get(propTypeKind);
  if (matchingType) {
    typeName = matchingType;
  }

  return {
    name: (propertySignature.name as ts.Identifier).text,
    type: propertySignature.questionToken ? typeName : `${typeName}!`,
  };
};

export const convertInterfaceDeclarationToTypeMeta = (
  interfaceDeclaration: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): TypeMeta => {
  const members = interfaceDeclaration.members as ts.NodeArray<
    ts.PropertySignature
  >;

  return {
    name: interfaceDeclaration.name.text,
    fields: members.map((x) => extractMetaFieldFromPropertySignature(x)),
  };
};
