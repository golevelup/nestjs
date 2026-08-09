import { PubSub, SchemaTypes, SchemaViews } from '@google-cloud/pubsub';
import { SchemaServiceClient } from '@google-cloud/pubsub/build/src/v1';
import type { Type as AvroType, Schema as AvroSchema } from './vendor/avsc';
import type {
  ScalarType as ScalarTypeEnum,
  IMessageType,
} from './vendor/protobuf-runtime';

import { PubsubConfigurationMismatchError } from './pubsub-configuration.errors';
import { PubsubTopicContainer } from './pubsub-topic.container';
import { loadPackage } from './utils';

export class PubsubSchemaClient {
  private _schemaClientPromise: Promise<SchemaServiceClient> | null = null;

  constructor(private readonly pubsub: PubSub) {}

  private get schemaClient(): Promise<SchemaServiceClient> {
    if (!this._schemaClientPromise) {
      this._schemaClientPromise = this.pubsub.getSchemaClient();
    }

    return this._schemaClientPromise;
  }

  private getProtocolBufferStubMessage(
    definition: IMessageType<any>,
    ScalarType: typeof ScalarTypeEnum,
  ): Record<string, any> {
    const stub: Record<string, any> = {};

    for (const field of definition.fields) {
      if (field.kind === 'map') {
        stub[field.localName] = {};
        continue;
      }

      let value: any;

      if (field.kind === 'scalar') {
        switch (field.T as ScalarTypeEnum) {
          case ScalarType.STRING:
            value = 'stub';
            break;
          case ScalarType.BOOL:
            value = true;
            break;
          case ScalarType.BYTES:
            value = Buffer.from('stub');
            break;
          case ScalarType.DOUBLE:
          case ScalarType.FLOAT:
            value = 1.0;
            break;
          case ScalarType.INT64:
          case ScalarType.UINT64:
          case ScalarType.FIXED64:
          case ScalarType.SFIXED64:
          case ScalarType.SINT64:
            value = BigInt(1);
            break;
          default:
            value = 1;
        }
      } else if (field.kind === 'message' && field.T) {
        value = this.getProtocolBufferStubMessage(field.T(), ScalarType);
      } else if (field.kind === 'enum') {
        value = 0;
      } else {
        continue;
      }

      stub[field.localName] = field.repeat ? [value] : value;
    }

    return stub;
  }

  public async connectAndValidateSchema(topicContainer: PubsubTopicContainer) {
    const schemaConfiguration = topicContainer.configuration.schema;

    if (!schemaConfiguration) {
      return null;
    }

    const [[remoteMetadata], schemaClient] = await Promise.all([
      topicContainer.instance.getMetadata(),
      this.schemaClient,
    ]);

    if (!remoteMetadata.schemaSettings?.schema) {
      throw new PubsubConfigurationMismatchError(
        topicContainer.configuration.name,
        {
          key: 'schema.name',
          local: schemaConfiguration.name,
          remote: null,
        },
      );
    }

    const remoteSchemaName = remoteMetadata.schemaSettings?.schema
      .split('/')
      .pop();

    if (schemaConfiguration.name !== remoteSchemaName) {
      throw new PubsubConfigurationMismatchError(
        topicContainer.configuration.name,
        {
          key: 'schema.name',
          local: schemaConfiguration.name,
          remote: remoteSchemaName,
        },
      );
    }

    const schema = this.pubsub.schema(schemaConfiguration.name);
    const remoteSchema = await schema.get(SchemaViews.Full);

    if (schemaConfiguration.type !== remoteSchema.type) {
      throw new PubsubConfigurationMismatchError(
        topicContainer.configuration.name,
        {
          key: 'schema.type',
          local: schemaConfiguration.type,
          remote: remoteSchema.type as string,
        },
      );
    }

    if (
      schemaConfiguration.encoding !== remoteMetadata.schemaSettings.encoding
    ) {
      throw new PubsubConfigurationMismatchError(
        topicContainer.configuration.name,
        {
          key: 'schema.encoding',
          local: schemaConfiguration.encoding,
          remote: remoteMetadata.schemaSettings.encoding as string,
        },
      );
    }

    let stubData: any;

    if (schemaConfiguration.type === SchemaTypes.Avro) {
      const { Type } = loadPackage<{ Type: typeof AvroType }>('avsc');

      stubData = Type.forSchema(
        schemaConfiguration.definition as AvroSchema,
      ).random();
    } else if (schemaConfiguration.type === SchemaTypes.ProtocolBuffer) {
      const { ScalarType } = loadPackage<{
        ScalarType: typeof ScalarTypeEnum;
      }>('@protobuf-ts/runtime');

      stubData = this.getProtocolBufferStubMessage(
        schemaConfiguration.definition,
        ScalarType,
      );
    } else {
      throw new Error(
        `Schema type invalid for topic (${topicContainer.configuration.name}).`,
      );
    }

    const stubMessage = topicContainer.serializer.serialize(stubData);

    try {
      await schemaClient.validateMessage({
        parent: remoteMetadata.schemaSettings.schema
          .split('/')
          .slice(0, 2)
          .join('/'),
        name: remoteMetadata.schemaSettings.schema,
        message: stubMessage,
        encoding: remoteMetadata.schemaSettings.encoding,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new Error(
        `Schema compatibility validation failed for topic (${topicContainer.configuration.name}). The local schema definition is not compatible with the remote schema version. Error: ${errorMessage}`,
      );
    }
  }
}
