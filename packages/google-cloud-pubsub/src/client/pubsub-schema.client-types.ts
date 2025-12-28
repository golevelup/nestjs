import { Encodings, SchemaTypes } from '@google-cloud/pubsub';
import { MessageType } from '@protobuf-ts/runtime';
import { schema } from 'avsc';

type AvroPrimitiveMap = {
  boolean: boolean;
  bytes: Buffer;
  double: number;
  float: number;
  int: number;
  long: number;
  null: null;
  string: string;
};

type HasDefault<T> = T extends { default: any } ? true : false;
type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object
    ? {
        readonly [K in keyof T]: DeepReadonly<T[K]>;
      }
    : T;

export type InferAvroPayload<T> = T extends readonly (infer U)[]
  ? InferAvroPayload<U>
  : T extends schema.PrimitiveType
    ? T extends keyof AvroPrimitiveMap
      ? AvroPrimitiveMap[T]
      : never
    : T extends { type: infer Type }
      ? Type extends schema.RecordType['type']
        ? T extends { fields: readonly (infer F)[] }
          ? {
              -readonly [K in F as HasDefault<K> extends false
                ? K extends { name: string }
                  ? K['name']
                  : never
                : never]-?: K extends { type: infer FT } ? InferAvroPayload<FT> : never;
            } & {
              -readonly [K in F as HasDefault<K> extends true
                ? K extends { name: string }
                  ? K['name']
                  : never
                : never]?: K extends { type: infer FT } ? InferAvroPayload<FT> : never;
            }
          : Record<string, never>
        : Type extends schema.ArrayType['type']
          ? T extends { items: infer Items }
            ? InferAvroPayload<Items>[]
            : never
          : Type extends schema.MapType['type']
            ? T extends { values: infer Values }
              ? Record<string, InferAvroPayload<Values>>
              : never
            : Type extends schema.EnumType['type']
              ? T extends { symbols: readonly (infer Symbols)[] }
                ? Symbols
                : never
              : Type extends schema.FixedType['type']
                ? Buffer
                : Type extends schema.PrimitiveType
                  ? Type extends keyof AvroPrimitiveMap
                    ? AvroPrimitiveMap[Type]
                    : never
                  : unknown
      : unknown;

interface PubsubAvroSchemaConfiguration {
  definition: DeepReadonly<schema.AvroSchema>;
  encoding: (typeof Encodings)[keyof typeof Encodings];
  name: string;
  type: typeof SchemaTypes.Avro;
}

interface PubsubProtocolBufferSchemaConfiguration {
  definition: MessageType<any>;
  encoding: (typeof Encodings)[keyof typeof Encodings];
  name: string;
  protoPath: string;
  type: typeof SchemaTypes.ProtocolBuffer;
}

export type PubsubSchemaConfiguration = PubsubAvroSchemaConfiguration | PubsubProtocolBufferSchemaConfiguration;
