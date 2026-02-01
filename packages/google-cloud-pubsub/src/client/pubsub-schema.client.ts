import { PubSub, SchemaTypes, SchemaViews } from '@google-cloud/pubsub';
import { SchemaServiceClient } from '@google-cloud/pubsub/build/src/v1';
import type { Type as AvroType, Schema as AvroSchema } from './vendor/avsc';

import { PubsubConfigurationMismatchError } from './pubsub-configuration.errors';
import { PubsubTopicContainer } from './pubsub-topic.container';
import { loadPackage } from './utils';

export class PubsubSchemaClient {
  private _schemaClient: SchemaServiceClient | null = null;
  private _schemaClientPromise: Promise<SchemaServiceClient> | null = null;

  constructor(private readonly pubsub: PubSub) {}

  private get schemaClient(): Promise<SchemaServiceClient> {
    if (this._schemaClient) {
      return Promise.resolve(this._schemaClient);
    }

    if (!this._schemaClientPromise) {
      this._schemaClientPromise = this._initializeSchemaClient();
    }

    return this._schemaClientPromise;
  }

  private async _initializeSchemaClient(): Promise<SchemaServiceClient> {
    this._schemaClient = await this.pubsub.getSchemaClient();

    return this._schemaClient;
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

    let stubMessage: Uint8Array;

    if (schemaConfiguration.type === SchemaTypes.Avro) {
      const { Type } = loadPackage<{ Type: typeof AvroType }>('avsc');

      const avroType = Type.forSchema(
        schemaConfiguration.definition as AvroSchema,
      );

      stubMessage = avroType.toBuffer(avroType.random());
    } else if (schemaConfiguration.type === SchemaTypes.ProtocolBuffer) {
      const definition = schemaConfiguration.definition;

      stubMessage = Buffer.from(definition.toBinary(definition.create()));
    } else {
      throw new Error(
        `Schema type invalid for topic (${topicContainer.configuration.name}).`,
      );
    }

    try {
      await schemaClient.validateMessage({
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
