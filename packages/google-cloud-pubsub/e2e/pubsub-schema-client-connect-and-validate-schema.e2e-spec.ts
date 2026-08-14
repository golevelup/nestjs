import { Encodings, PubSub, SchemaTypes } from '@google-cloud/pubsub';
import { schema } from 'avsc';
import * as crypto from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { PubsubTopicConfiguration } from '../src';
import { PubsubConfigurationMismatchError } from '../src/client/pubsub-configuration.errors';
import { PubsubSchemaClient } from '../src/client/pubsub-schema.client';
import { PubsubTopicContainer } from '../src/client/pubsub-topic.container';
import { PubsubSerializer } from '../src/client/pubsub.serializer';

import { assertRejectsWith } from './pubsub-client.spec-utils';

import { Level3ProtocolBuffer as Level3ProtocolBufferExtended } from './proto/level3-extended';
import { TestEvent } from './proto/test';

// These tests are skipped. They require a real Google Cloud Pub/Sub instance.
// To run these tests locally:
// 1. Remove '.skip' from the describe() block.
// 2. Export the GOOGLE_APPLICATION_CREDENTIALS environment variable.
describe.skip('PubsubSchemaClient.connectAndValidateSchema()', () => {
  jest.setTimeout(45000);

  let pubsub: PubSub;
  let pubsubSchemaClient: PubsubSchemaClient;

  const avroSchemaDefinition = {
    fields: [
      { name: 'test', type: 'string' },
      { name: 'isActive', type: 'boolean' },
    ],
    name: 'Test',
    type: 'record',
  } satisfies schema.RecordType;

  beforeEach(() => {
    pubsub = new PubSub({});

    pubsubSchemaClient = new PubsubSchemaClient(pubsub);
  });

  afterEach(async () => {
    await pubsub.close();
  });

  it('Returns null: in case when schema is not specified.', async () => {
    const topicConfiguration: PubsubTopicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      subscriptions: [],
    };

    await pubsub.createTopic(topicConfiguration.name);

    const topic = pubsub.topic(topicConfiguration.name);
    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await expect(
      pubsubSchemaClient.connectAndValidateSchema(topicContainer),
    ).resolves.toBeNull();
  });

  it(`${PubsubConfigurationMismatchError.name}: if local schema doesn't exists in remote configuration.`, async () => {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: avroSchemaDefinition,
        encoding: Encodings.Binary,
        name: 'any-schema',
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    await pubsub.createTopic(topicConfiguration.name);

    const topic = pubsub.topic(topicConfiguration.name);
    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await assertRejectsWith(
      () => pubsubSchemaClient.connectAndValidateSchema(topicContainer),
      PubsubConfigurationMismatchError,
      (error) => {
        expect(error.mismatchEntry).toEqual({
          key: 'schema.name',
          local: topicConfiguration.schema.name,
          remote: null,
        });
      },
    );
  });

  it(`${PubsubConfigurationMismatchError.name}: if local schema name doesn't match with remote schema name.`, async () => {
    const remoteSchemaName = `schema-${crypto.randomUUID()}`;

    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: avroSchemaDefinition,
        encoding: Encodings.Binary,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const remoteSchema = await pubsub.createSchema(
      remoteSchemaName,
      SchemaTypes.Avro,
      JSON.stringify(avroSchemaDefinition),
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: Encodings.Binary,
        schema: await remoteSchema.getName(),
      },
    });

    const topic = pubsub.topic(topicConfiguration.name);
    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await assertRejectsWith(
      () => pubsubSchemaClient.connectAndValidateSchema(topicContainer),
      PubsubConfigurationMismatchError,
      (error) => {
        expect(error.mismatchEntry).toEqual({
          key: 'schema.name',
          local: topicConfiguration.schema.name,
          remote: remoteSchemaName,
        });
      },
    );
  });

  it(`${PubsubConfigurationMismatchError.name}: if local schema type doesn't match with remote schema type.`, async () => {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: avroSchemaDefinition,
        encoding: Encodings.Binary,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      SchemaTypes.ProtocolBuffer,
      'syntax = "proto3"; message Mismatch {}',
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: Encodings.Binary,
        schema: await remoteSchema.getName(),
      },
    });

    const topic = pubsub.topic(topicConfiguration.name);
    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await assertRejectsWith(
      () => pubsubSchemaClient.connectAndValidateSchema(topicContainer),
      PubsubConfigurationMismatchError,
      (error) => {
        expect(error.mismatchEntry).toEqual({
          key: 'schema.type',
          local: SchemaTypes.Avro,
          remote: SchemaTypes.ProtocolBuffer,
        });
      },
    );
  });

  it(`${PubsubConfigurationMismatchError.name}: if ${SchemaTypes.Avro} schema encodings differ between local and remote.`, async () => {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: avroSchemaDefinition,
        encoding: Encodings.Json,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      topicConfiguration.schema.type,
      JSON.stringify(topicConfiguration.schema.definition),
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: Encodings.Binary,
        schema: await remoteSchema.getName(),
      },
    });

    const topicContainer = new PubsubTopicContainer(
      pubsub.topic(topicConfiguration.name),
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await assertRejectsWith(
      () => pubsubSchemaClient.connectAndValidateSchema(topicContainer),
      PubsubConfigurationMismatchError,
      (error) => {
        expect(error.mismatchEntry).toEqual({
          key: 'schema.encoding',
          local: Encodings.Json,
          remote: Encodings.Binary,
        });
      },
    );
  });

  it(`${PubsubConfigurationMismatchError.name}: if ${SchemaTypes.ProtocolBuffer} schema encodings differ between local and remote.`, async () => {
    const protoPath = resolve(__dirname, './proto/test.proto');
    const protoDefinition = readFileSync(protoPath, 'utf-8');

    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: TestEvent,
        encoding: Encodings.Binary,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      SchemaTypes.ProtocolBuffer,
      protoDefinition,
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: Encodings.Json,
        schema: await remoteSchema.getName(),
      },
    });

    const topicContainer = new PubsubTopicContainer(
      pubsub.topic(topicConfiguration.name),
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await assertRejectsWith(
      () => pubsubSchemaClient.connectAndValidateSchema(topicContainer),
      PubsubConfigurationMismatchError,
      (error) => {
        expect(error.mismatchEntry).toEqual({
          key: 'schema.encoding',
          local: Encodings.Binary,
          remote: Encodings.Json,
        });
      },
    );
  });

  it(`should throw error if ${SchemaTypes.Avro} schema definition is not compatible with remote schema.`, async () => {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: avroSchemaDefinition,
        encoding: Encodings.Binary,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const remoteAvroSchemaDefinition = {
      ...avroSchemaDefinition,
      fields: [{ name: 'another', type: 'string' }],
    } satisfies schema.RecordType;
    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      SchemaTypes.Avro,
      JSON.stringify(remoteAvroSchemaDefinition),
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: Encodings.Binary,
        schema: await remoteSchema.getName(),
      },
    });

    const topic = pubsub.topic(topicConfiguration.name);
    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await assertRejectsWith(
      () => pubsubSchemaClient.connectAndValidateSchema(topicContainer),
      Error,
      (error) => {
        expect(error.message).toContain(
          `Schema compatibility validation failed for topic (${topicConfiguration.name})`,
        );
      },
    );
  });

  it(`should throw error if ${SchemaTypes.ProtocolBuffer} schema definition is not compatible with remote schema.`, async () => {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: TestEvent,
        encoding: Encodings.Json,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const remoteProtoDefinition =
      'syntax = "proto3"; message AnotherMessage {}';
    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      SchemaTypes.ProtocolBuffer,
      remoteProtoDefinition,
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: Encodings.Json,
        schema: await remoteSchema.getName(),
      },
    });

    const topic = pubsub.topic(topicConfiguration.name);
    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await assertRejectsWith(
      () => pubsubSchemaClient.connectAndValidateSchema(topicContainer),
      Error,
      (error) => {
        expect(error.message).toContain(
          `Schema compatibility validation failed for topic (${topicConfiguration.name})`,
        );
      },
    );
  });

  it(`should successfully connect ${SchemaTypes.Avro} schema.`, async () => {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: avroSchemaDefinition,
        encoding: Encodings.Binary,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      topicConfiguration.schema.type,
      JSON.stringify(topicConfiguration.schema.definition),
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: topicConfiguration.schema.encoding,
        schema: await remoteSchema.getName(),
      },
    });

    const topic = pubsub.topic(topicConfiguration.name);
    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await expect(
      pubsubSchemaClient.connectAndValidateSchema(topicContainer),
    ).resolves.toBeUndefined();
  });

  it(`should successfully connect ${SchemaTypes.ProtocolBuffer} schema.`, async () => {
    const protoPath = resolve(__dirname, './proto/test.proto');
    const protoDefinition = readFileSync(protoPath, 'utf-8');

    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: TestEvent,
        encoding: Encodings.Binary,
        name: `schema-${crypto.randomUUID()}`,
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const remoteSchema = await pubsub.createSchema(
      topicConfiguration.schema.name,
      topicConfiguration.schema.type,
      protoDefinition,
    );

    await pubsub.createTopic({
      name: topicConfiguration.name,
      schemaSettings: {
        encoding: topicConfiguration.schema.encoding,
        schema: await remoteSchema.getName(),
      },
    });

    const topic = pubsub.topic(topicConfiguration.name);
    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await expect(
      pubsubSchemaClient.connectAndValidateSchema(topicContainer),
    ).resolves.toBeUndefined();
  });

  it(`should successfully connect ${SchemaTypes.Avro} schema with latest revision after multiple commits.`, async () => {
    const revision1 = avroSchemaDefinition;

    const revision2 = {
      ...avroSchemaDefinition,
      fields: [
        ...avroSchemaDefinition.fields,
        { default: null, name: 'field3', type: ['null', 'int'] },
      ],
    } satisfies schema.RecordType;

    const revision3 = {
      ...avroSchemaDefinition,
      fields: [
        ...avroSchemaDefinition.fields,
        { default: null, name: 'field4', type: ['null', 'double'] },
      ],
    } satisfies schema.RecordType;

    const schemaClient = await pubsub.getSchemaClient();

    const schemaName = `schema-${crypto.randomUUID()}`;
    const topicName = `topic-${crypto.randomUUID()}`;

    const createdSchema = await pubsub.createSchema(
      schemaName,
      SchemaTypes.Avro,
      JSON.stringify(revision1),
    );

    for (const definition of [revision2, revision3]) {
      const name = await createdSchema.getName();

      await schemaClient.commitSchema({
        name,
        schema: {
          definition: JSON.stringify(definition),
          name,
          type: SchemaTypes.Avro,
        },
      });
    }

    await pubsub.createTopic({
      name: topicName,
      schemaSettings: {
        encoding: Encodings.Binary,
        schema: await createdSchema.getName(),
      },
    });

    const topic = pubsub.topic(topicName);

    const topicConfiguration = {
      name: topicName,
      schema: {
        definition: revision3,
        encoding: Encodings.Binary,
        name: schemaName,
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await expect(
      pubsubSchemaClient.connectAndValidateSchema(topicContainer),
    ).resolves.toBeUndefined();
  });

  it(`should successfully connect ${SchemaTypes.ProtocolBuffer} schema with latest revision after multiple commits.`, async () => {
    const protoRevisionPaths = [
      resolve(__dirname, `./proto/level3.proto`),
      resolve(__dirname, `./proto/level3-extended.proto`),
    ];

    const allRevisions = [
      readFileSync(protoRevisionPaths[0], 'utf-8'),
      readFileSync(protoRevisionPaths[1], 'utf-8'),
    ];

    const schemaClient = await pubsub.getSchemaClient();

    const schemaName = `schema-${crypto.randomUUID()}`;
    const topicName = `topic-${crypto.randomUUID()}`;

    const createdSchema = await pubsub.createSchema(
      schemaName,
      SchemaTypes.ProtocolBuffer,
      allRevisions[0],
    );
    const fullSchemaName = await createdSchema.getName();

    await schemaClient.commitSchema({
      name: fullSchemaName,
      schema: {
        definition: allRevisions[1],
        name: fullSchemaName,
        type: SchemaTypes.ProtocolBuffer,
      },
    });

    await pubsub.createTopic({
      name: topicName,
      schemaSettings: {
        encoding: Encodings.Binary,
        schema: fullSchemaName,
      },
    });

    const topic = pubsub.topic(topicName);

    const topicConfiguration = {
      name: topicName,
      schema: {
        definition: Level3ProtocolBufferExtended,
        encoding: Encodings.Binary,
        name: schemaName,
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const topicContainer = new PubsubTopicContainer(
      topic,
      topicConfiguration,
      new PubsubSerializer(topicConfiguration.name, topicConfiguration.schema),
    );

    await expect(
      pubsubSchemaClient.connectAndValidateSchema(topicContainer),
    ).resolves.toBeUndefined();
  });
});
