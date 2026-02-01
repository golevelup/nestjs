// Vendored types from '@protobuf-ts/runtime' package.

export type JsonValue =
  | number
  | string
  | boolean
  | null
  | { [k: string]: JsonValue }
  | JsonValue[];

export interface IBinaryReader {
  readonly pos: number;
  readonly len: number;
  tag(): [number, any];
  skip(wireType: any): Uint8Array;
  uint32(): number;
  int32(): number;
  sint32(): number;
  int64(): any;
  sint64(): any;
  sfixed64(): any;
  uint64(): any;
  fixed64(): any;
  bool(): boolean;
  fixed32(): number;
  sfixed32(): number;
  float(): number;
  double(): number;
  bytes(): Uint8Array;
  string(): string;
}

export interface IBinaryWriter {
  finish(): Uint8Array;
  fork(): IBinaryWriter;
  join(): IBinaryWriter;
  tag(fieldNo: number, type: any): IBinaryWriter;
  raw(chunk: Uint8Array): IBinaryWriter;
  uint32(value: number): IBinaryWriter;
  int32(value: number): IBinaryWriter;
  sint32(value: number): IBinaryWriter;
  int64(value: any): IBinaryWriter;
  uint64(value: any): IBinaryWriter;
  sint64(value: any): IBinaryWriter;
  fixed64(value: any): IBinaryWriter;
  sfixed64(value: any): IBinaryWriter;
  bool(value: boolean): IBinaryWriter;
  fixed32(value: number): IBinaryWriter;
  sfixed32(value: number): IBinaryWriter;
  float(value: number): IBinaryWriter;
  double(value: number): IBinaryWriter;
  bytes(value: Uint8Array): IBinaryWriter;
  string(value: string): IBinaryWriter;
}

export declare enum WireType {
  Varint = 0,
  Bit64 = 1,
  LengthDelimited = 2,
  StartGroup = 3,
  EndGroup = 4,
  Bit32 = 5,
}

export interface BinaryReadOptions {
  readUnknownField?: any;
  readerFactory?: (bytes: Uint8Array) => IBinaryReader;
}

export interface BinaryWriteOptions {
  writeUnknownFields?: any;
  writerFactory?: () => IBinaryWriter;
}

export interface JsonReadOptions {
  ignoreUnknownFields?: boolean;
  typeRegistry?: readonly IMessageType<any>[];
}

export interface JsonWriteOptions {
  emitDefaultValues?: boolean;
  enumAsInteger?: boolean;
  useProtoFieldName?: boolean;
  typeRegistry?: readonly IMessageType<any>[];
}

export interface JsonWriteStringOptions extends JsonWriteOptions {
  prettySpaces?: number;
}

export type PartialMessage<T extends object> = {
  [K in keyof T]?: any;
};

export interface IMessageType<T extends object> {
  readonly typeName: string;
  readonly fields: readonly any[];
  readonly options: {
    [extensionName: string]: JsonValue;
  };
  readonly messagePrototype?: any;
  create(value?: any): T;
  fromBinary(data: Uint8Array, options?: any): T;
  toBinary(message: T, options?: any): Uint8Array;
  fromJson(json: JsonValue, options?: any): T;
  fromJsonString(json: string, options?: any): T;
  toJson(message: T, options?: any): JsonValue;
  toJsonString(message: T, options?: any): string;
  clone(message: T): T;
  mergePartial(target: T, source: any): void;
  equals(a: T | undefined, b: T | undefined): boolean;
  is(arg: any, depth?: number): arg is T;
  isAssignable(arg: any, depth?: number): arg is T;
  [prop: string]: any;
}
