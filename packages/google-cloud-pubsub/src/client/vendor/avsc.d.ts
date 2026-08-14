// Vendored types from 'avsc' package.

import * as stream from 'stream';

export namespace schema {
  export type AvroSchema = DefinedType | DefinedType[];
  export type DefinedType =
    | PrimitiveType
    | ComplexType
    | LogicalType
    | any
    | string;
  export type PrimitiveType =
    | 'null'
    | 'boolean'
    | 'int'
    | 'long'
    | 'float'
    | 'double'
    | 'bytes'
    | 'string';
  export type ComplexType =
    | NamedType
    | RecordType
    | EnumType
    | MapType
    | ArrayType
    | FixedType;
  export type LogicalType = ComplexType & LogicalTypeExtension;

  export interface NamedType {
    type: PrimitiveType;
  }

  export interface RecordType {
    type: 'record' | 'error';
    name: string;
    namespace?: string;
    doc?: string;
    aliases?: string[];
    fields: {
      name: string;
      doc?: string;
      type: AvroSchema;
      default?: any;
      order?: 'ascending' | 'descending' | 'ignore';
    }[];
  }

  export interface EnumType {
    type: 'enum';
    name: string;
    namespace?: string;
    aliases?: string[];
    doc?: string;
    symbols: string[];
    default?: string;
  }

  export interface ArrayType {
    type: 'array';
    items: AvroSchema;
  }

  export interface MapType {
    type: 'map';
    values: AvroSchema;
  }

  export interface FixedType {
    type: 'fixed';
    name: string;
    aliases?: string[];
    size: number;
  }
  export interface LogicalTypeExtension {
    logicalType: string;
    [param: string]: any;
  }
}

export type Schema = schema.AvroSchema;

type Callback<V, Err = any> = (err: Err | null, value?: V) => void;

type Codec = (buffer: Uint8Array, callback: Callback<Uint8Array>) => void;

export interface CodecOptions {
  [name: string]: Codec;
}

export interface DecoderOptions {
  noDecode: boolean;
  readerSchema: string | object | Type;
  codecs: CodecOptions;
  parseHook: (schema: Schema) => Type;
}

export interface EncoderOptions {
  blockSize: number;
  codec: string;
  codecs: CodecOptions;
  writeHeader: boolean | 'always' | 'never' | 'auto';
  syncMarker: Uint8Array;
}

export type BranchProjection = (
  types: ReadonlyArray<Type>,
) => ((val: unknown) => number) | undefined;

export interface ForSchemaOptions {
  assertLogicalTypes: boolean;
  logicalTypes: {
    [type: string]: new (schema: Schema, opts?: any) => types.LogicalType;
  };
  namespace: string;
  noAnonymousTypes: boolean;
  omitRecordMethods: boolean;
  registry: { [name: string]: Type };
  typeHook: (
    schema: Schema | string,
    opts: ForSchemaOptions,
  ) => Type | undefined;
  wrapUnions: BranchProjection | boolean | 'auto' | 'always' | 'never';
}

export interface TypeOptions extends ForSchemaOptions {
  strictDefaults: boolean;
}

export interface ForValueOptions extends TypeOptions {
  emptyArrayType: Type;
  valueHook: (val: any, opts: ForValueOptions) => Type;
}

export interface CloneOptions {
  coerceBuffers: boolean;
  fieldHook: (field: types.Field, value: any, type: Type) => any;
  qualifyNames: boolean;
  skipMissingFields: boolean;
  wrapUnions: boolean;
}
export interface IsValidOptions {
  noUndeclaredFields: boolean;
  errorHook: (path: string[], val: any, type: Type) => void;
}

export interface ImportHookPayload {
  path: string;
  type: 'idl' | 'protocol' | 'schema';
}

type ImportHookCallback = (
  err: any,
  params?: { contents: string; path: string },
) => void;

export type ImportHook = (
  payload: ImportHookPayload,
  cb: ImportHookCallback,
) => void;

export interface AssembleOptions {
  importHook: (params: ImportHookPayload, callback: Callback<object>) => void;
}

export interface SchemaOptions {
  exportAttrs: boolean;
  noDeref: boolean;
}

export declare class Resolver {
  //no public methods
}

export function assembleProtocol(
  filePath: string,
  opts: Partial<AssembleOptions>,
  callback: Callback<object>,
): void;
export function assembleProtocol(
  filePath: string,
  callback: Callback<object>,
): void;
export function createFileDecoder(
  fileName: string,
  opts?: Partial<DecoderOptions>,
): streams.BlockDecoder;
export function createFileEncoder(
  filePath: string,
  schema: Schema,
  opts?: Partial<EncoderOptions>,
): streams.BlockEncoder;
export function createBlobEncoder(
  schema: Schema,
  opts?: Partial<EncoderOptions>,
): stream.Duplex;
export function createBlobDecoder(
  blob: Blob,
  opts?: Partial<DecoderOptions>,
): streams.BlockDecoder;
export function extractFileHeader(filePath: string, options?: any): any;
export function parse(schemaOrProtocolIdl: string, options?: any): any;
export function readProtocol(
  protocolIdl: string,
  options?: Partial<DecoderOptions>,
): any;
export function readSchema(
  schemaIdl: string,
  options?: Partial<DecoderOptions>,
): Schema;

export class Type {
  clone(val: any, opts?: Partial<CloneOptions>): any;
  compare(val1: any, val2: any): number;
  compareBuffers(buf1: Uint8Array, buf2: Uint8Array): number;
  createResolver(type: Type): Resolver;
  decode(
    buf: Uint8Array,
    pos?: number,
    resolver?: Resolver,
  ): { value: any; offset: number };
  encode(val: any, buf: Uint8Array, pos?: number): number;
  equals(type: Type): boolean;
  fingerprint(algorithm?: string): Uint8Array;
  fromBuffer(buffer: Uint8Array, resolver?: Resolver, noCheck?: boolean): any;
  fromString(str: string): any;
  inspect(): string;
  isValid(val: any, opts?: Partial<IsValidOptions>): boolean;
  random(): unknown;
  schema(opts?: Partial<SchemaOptions>): Schema;
  toBuffer(value: any): Uint8Array;
  toJSON(): object;
  toString(val?: any): string;
  wrap(val: any): any;
  readonly aliases: string[] | undefined;
  readonly doc: string | undefined;
  readonly name: string | undefined;
  readonly branchName: string | undefined;
  readonly typeName: string;
  static forSchema(schema: Schema, opts?: Partial<ForSchemaOptions>): Type;
  static forTypes(types: Type[], opts?: Partial<TypeOptions>): Type;
  static forValue(value: object, opts?: Partial<ForValueOptions>): Type;
  static isType(arg: any, ...prefix: string[]): boolean;
}

export namespace streams {
  class BlockDecoder extends stream.Duplex {
    constructor(opts?: Partial<DecoderOptions>);
    static defaultCodecs(): CodecOptions;
  }

  class BlockEncoder extends stream.Duplex {
    constructor(schema: Schema, opts?: Partial<EncoderOptions>);
    static defaultCodecs(): CodecOptions;
  }

  class RawDecoder extends stream.Duplex {
    constructor(schema: Schema, opts?: { decode?: boolean });
  }

  class RawEncoder extends stream.Duplex {
    constructor(schema: Schema, opts?: { batchSize?: number });
  }
}

export namespace types {
  class ArrayType extends Type {
    constructor(schema: Schema, opts: any);
    readonly itemsType: Type;
    random(): unknown[];
  }

  class BooleanType extends Type {
    constructor();
    random(): boolean;
  }

  class BytesType extends Type {
    constructor();
    random(): Uint8Array;
  }

  class DoubleType extends Type {
    constructor();
    random(): number;
  }

  class EnumType extends Type {
    constructor(schema: Schema, opts?: any);
    readonly symbols: string[];
    random(): string;
  }

  class FixedType extends Type {
    constructor(schema: Schema, opts?: any);
    readonly size: number;
    random(): Uint8Array;
  }

  class FloatType extends Type {
    constructor();
    random(): number;
  }

  class IntType extends Type {
    constructor();
    random(): number;
  }

  class LogicalType extends Type {
    constructor(schema: Schema, opts?: any);
    readonly underlyingType: Type;
    protected _export(schema: Schema): void;
    protected _fromValue(val: any): any;
    protected _resolve(type: Type): any;
    protected _toValue(any: any): any;
    random(): unknown;
  }

  class LongType extends Type {
    constructor();
    random(): unknown;
    static __with(methods: object, noUnpack?: boolean): LongType;
  }

  class MapType extends Type {
    constructor(schema: Schema, opts?: any);
    readonly valuesType: any;
    random(): Record<string, unknown>;
  }

  class NullType extends Type {
    constructor();
    random(): null;
  }

  class RecordType extends Type {
    constructor(schema: Schema, opts?: any);
    readonly fields: Field[];
    readonly recordConstructor: any;
    field(name: string): Field;
    random(): object;
  }

  class Field {
    aliases: string[];
    defaultValue(): any;
    name: string;
    order: string;
    type: Type;
  }

  class StringType extends Type {
    constructor();
    random(): string;
  }

  class UnwrappedUnionType extends Type {
    constructor(schema: Schema, opts: any);
    random(): unknown;
    readonly types: Type[];
  }

  class WrappedUnionType extends Type {
    constructor(schema: Schema, opts: any);
    random(): Record<string, unknown>;
    readonly types: Type[];
  }
}
