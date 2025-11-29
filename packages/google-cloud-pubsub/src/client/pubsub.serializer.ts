import { Encodings, Message, SchemaTypes } from '@google-cloud/pubsub';
import { Type as AvroType } from 'avsc';

import { ENCODINGS, SCHEMA_TYPES } from './constants';
import { PubsubConfigurationInvalidError } from './pubsub-configuration.errors';
import { PubsubSchemaConfiguration } from './pubsub-schema.client-types';

export class PubsubSerializer {
  public readonly serialize: (data: any) => Buffer;
  public readonly deserialize: (message: Message) => any;

  constructor(
    private readonly topicName: string,
    schemaConfiguration?: PubsubSchemaConfiguration,
  ) {
    this.serialize = this.buildSerializer(schemaConfiguration);
    this.deserialize = this.buildDeserializer(schemaConfiguration);
  }

  private buildSerializer(
    schema?: PubsubSchemaConfiguration,
  ): (data: any) => Buffer {
    if (!schema) {
      return (data: any) => Buffer.from(JSON.stringify(data));
    }

    if (schema.type === SchemaTypes.Avro) {
      const avroDefinition = AvroType.forSchema(schema.definition as any);

      if (schema.encoding === Encodings.Binary) {
        return (data: any) => avroDefinition.toBuffer(data);
      }

      if (schema.encoding === Encodings.Json) {
        return (data: any) => Buffer.from(avroDefinition.toString(data));
      }

      throw new PubsubConfigurationInvalidError(this.topicName, {
        key: 'schema.encoding',
        reason: `Unsupported schema encoding. Supported encodings: (${ENCODINGS.join(', ')}).`,
        value: schema.encoding,
      });
    }

    if (schema.type === SchemaTypes.ProtocolBuffer) {
      const protoDefinition = schema.definition;

      if (schema.encoding === Encodings.Binary) {
        return (data: any) =>
          Buffer.from(protoDefinition.toBinary(protoDefinition.create(data)));
      }

      if (schema.encoding === Encodings.Json) {
        return (data: any) =>
          Buffer.from(
            JSON.stringify(
              protoDefinition.toJson(protoDefinition.create(data)),
            ),
          );
      }

      throw new PubsubConfigurationInvalidError(this.topicName, {
        key: 'schema.encoding',
        reason: `Unsupported schema encoding. Supported encodings: (${ENCODINGS.join(', ')}).`,
        value: schema.encoding,
      });
    }

    throw new PubsubConfigurationInvalidError(this.topicName, {
      key: 'schema.type',
      reason: `Unsupported schema type. Supported types: (${SCHEMA_TYPES.join(', ')}).`,
      value: (schema as { type: string }).type,
    });
  }

  private buildDeserializer(
    schema?: PubsubSchemaConfiguration,
  ): (message: Message) => any {
    if (!schema) {
      return (message: Message) => JSON.parse(message.data.toString());
    }

    if (schema.type === SchemaTypes.Avro) {
      const avroType = AvroType.forSchema(schema.definition as any);

      if (schema.encoding === Encodings.Binary) {
        return (message: Message) => avroType.fromBuffer(message.data);
      }

      if (schema.encoding === Encodings.Json) {
        return (message: Message) =>
          avroType.fromString(message.data.toString());
      }

      throw new PubsubConfigurationInvalidError(this.topicName, {
        key: 'schema.encoding',
        reason: `Unsupported schema encoding. Supported encodings: (${ENCODINGS.join(', ')}).`,
        value: schema.encoding,
      });
    }

    if (schema.type === SchemaTypes.ProtocolBuffer) {
      const protoType = schema.definition;

      if (schema.encoding === Encodings.Binary) {
        return (message: Message) => protoType.fromBinary(message.data);
      }

      if (schema.encoding === Encodings.Json) {
        return (message: Message) =>
          protoType.fromJsonString(message.data.toString());
      }

      throw new PubsubConfigurationInvalidError(this.topicName, {
        key: 'schema.encoding',
        reason: `Unsupported schema encoding. Supported encodings: (${ENCODINGS.join(', ')}).`,
        value: schema.encoding,
      });
    }

    throw new PubsubConfigurationInvalidError(this.topicName, {
      key: 'schema.type',
      reason: `Unsupported schema type. Supported types: (${SCHEMA_TYPES.join(', ')}).`,
      value: (schema as { type: string }).type,
    });
  }
}
