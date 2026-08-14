import { Encodings, SchemaTypes } from '@google-cloud/pubsub';
import { IMessageType } from './vendor/protobuf-runtime';
import { schema } from './vendor/avsc';

type AvroPrimitiveMap = {
  boolean: boolean;
  bytes: Uint8Array;
  double: number;
  float: number;
  int: number;
  long: number;
  null: null;
  string: string;
};

type HasDefault<T> = T extends { default: any } ? true : false;

type InferAvroRecord<T> = T extends { fields: readonly any[] }
  ? {
      -readonly [Field in T['fields'][number] as HasDefault<Field> extends false
        ? Field extends { name: string }
          ? Field['name']
          : never
        : never]-?: Field extends { type: infer FT }
        ? InferAvroPayload<FT>
        : never;
    } & {
      -readonly [Field in T['fields'][number] as HasDefault<Field> extends true
        ? Field extends { name: string }
          ? Field['name']
          : never
        : never]?: Field extends { type: infer FT }
        ? InferAvroPayload<FT>
        : never;
    }
  : Record<string, never>;

type InferAvroEnum<T> = T extends { symbols: readonly any[] }
  ? T['symbols'][number]
  : string;

type InferAvroArray<T> = T extends { items: infer I }
  ? InferAvroPayload<I>[]
  : never;

type InferAvroMap<T> = T extends { values: infer V }
  ? Record<string, InferAvroPayload<V>>
  : Record<string, never>;

type AvroTypeResolver<T extends { type: any }> =
  T['type'] extends keyof AvroPrimitiveMap
    ? AvroPrimitiveMap[T['type']]
    : T['type'] extends 'record' | 'error'
      ? InferAvroRecord<T>
      : T['type'] extends 'array'
        ? InferAvroArray<T>
        : T['type'] extends 'map'
          ? InferAvroMap<T>
          : T['type'] extends 'enum'
            ? InferAvroEnum<T>
            : T['type'] extends 'fixed'
              ? Uint8Array
              : InferAvroPayload<T['type']>;

export type InferAvroPayload<T> = T extends keyof AvroPrimitiveMap
  ? AvroPrimitiveMap[T]
  : T extends readonly (infer Member)[]
    ? InferAvroPayload<Member>
    : T extends { type: any }
      ? AvroTypeResolver<T>
      : unknown;

interface PubsubAvroSchemaConfiguration {
  definition: schema.AvroSchema;
  encoding: (typeof Encodings)[keyof typeof Encodings];
  name: string;
  type: typeof SchemaTypes.Avro;
}

interface PubsubProtocolBufferSchemaConfiguration {
  definition: IMessageType<any>;
  encoding: (typeof Encodings)[keyof typeof Encodings];
  name: string;
  type: typeof SchemaTypes.ProtocolBuffer;
}

export type PubsubSchemaConfiguration =
  | PubsubAvroSchemaConfiguration
  | PubsubProtocolBufferSchemaConfiguration;
