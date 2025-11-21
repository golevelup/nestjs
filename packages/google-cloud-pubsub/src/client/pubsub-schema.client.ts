import { PubSub, SchemaTypes, SchemaViews } from '@google-cloud/pubsub';
import { SchemaServiceClient } from '@google-cloud/pubsub/build/src/v1';
import { readFile } from 'fs/promises';
import { isEqual } from 'lodash';
import * as path from 'path';

import {
  PubsubConfigurationInvalidError,
  PubsubConfigurationMismatchError,
} from './pubsub-configuration.error';
import { PubsubTopicContainer } from './pubsub-topic.container';

export class PubsubSchemaClient {
  private _schemaClient: SchemaServiceClient | null = null;
  private _schemaClientPromise: Promise<SchemaServiceClient> | null = null;

  private readonly pubsub: PubSub;

  constructor(pubsub: PubSub) {
    this.pubsub = pubsub;
  }

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

    const [remoteMetadata] = await topicContainer.instance.getMetadata();

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

    const schemaClient = await this.schemaClient;

    const [remoteRevisions] = await schemaClient.listSchemaRevisions({
      name: await schema.getName(),
      view: SchemaViews.Full,
    });

    if (schemaConfiguration.type === SchemaTypes.Avro) {
      const isDefinitionMatched = remoteRevisions.some((revision) => {
        if (!revision.definition) {
          return false;
        }

        return isEqual(
          schemaConfiguration.definition,
          JSON.parse(revision.definition),
        );
      });

      if (!isDefinitionMatched) {
        throw new PubsubConfigurationMismatchError(
          topicContainer.configuration.name,
          {
            key: 'schema.definition',
            local: JSON.stringify(schemaConfiguration.definition),
            remote: JSON.stringify(
              remoteRevisions.map((revision) => revision.definition),
            ),
          },
        );
      }

      return;
    }

    if (schemaConfiguration.type === SchemaTypes.ProtocolBuffer) {
      if (!path.isAbsolute(schemaConfiguration.protoPath)) {
        throw new PubsubConfigurationInvalidError(
          topicContainer.configuration.name,
          {
            key: 'schema.protoPath',
            reason: 'Proto path must be an absolute path.',
            value: schemaConfiguration.protoPath,
          },
        );
      }

      const localDefinition = await readFile(
        path.resolve(schemaConfiguration.protoPath),
        'utf-8',
      );

      const isDefinitionMatched = remoteRevisions.some((revision) => {
        if (!revision.definition) {
          return false;
        }

        return revision.definition === localDefinition;
      });

      if (!isDefinitionMatched) {
        throw new PubsubConfigurationMismatchError(
          topicContainer.configuration.name,
          {
            key: 'schema.definition',
            local: localDefinition,
            remote: JSON.stringify(
              remoteRevisions.map((revision) => revision.definition),
            ),
          },
        );
      }

      return;
    }
  }
}
