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

export type DeepReadonly<T> = T extends (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object & (object | null)
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type AvroOptionalKeys<T> =
  T extends DeepReadonly<schema.RecordType>
    ? T['fields'][number] extends infer F
      ? F extends {
          default: null;
          name: string;
          type: readonly ['null', ...any];
        }
        ? F['name']
        : never
      : never
    : never;

export type InferAvroPayload<T> = T extends keyof AvroPrimitiveMap
  ? AvroPrimitiveMap[T]
  : T extends readonly any[]
    ? InferAvroPayload<T[number]>
    : T extends DeepReadonly<schema.RecordType>
      ? {
          -readonly [P in Exclude<
            T['fields'][number]['name'],
            AvroOptionalKeys<T>
          >]: InferAvroPayload<
            Extract<T['fields'][number], { name: P }>['type']
          >;
        } & {
          -readonly [P in AvroOptionalKeys<T>]?: InferAvroPayload<
            Extract<T['fields'][number], { name: P }>['type']
          >;
        }
      : T extends DeepReadonly<schema.EnumType>
        ? T['symbols'][number]
        : T extends DeepReadonly<schema.ArrayType>
          ? InferAvroPayload<T['items']>[]
          : T extends DeepReadonly<schema.MapType>
            ? { [key: string]: InferAvroPayload<T['values']> }
            : T extends DeepReadonly<schema.FixedType>
              ? Buffer
              : T extends { type: infer U }
                ? InferAvroPayload<U>
                : any;

interface PubsubAvroSchemaConfiguration {
  definition: DeepReadonly<schema.RecordType>;
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

export type PubsubSchemaConfiguration =
  | PubsubAvroSchemaConfiguration
  | PubsubProtocolBufferSchemaConfiguration;
