import { Encodings, PubSub, SchemaTypes } from '@google-cloud/pubsub';
import { MessageType } from '@protobuf-ts/runtime';
import { schema } from 'avsc';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

import {
  PubsubClient,
  PubsubTopicConfiguration,
} from '../../../packages/google-cloud-pubsub/src/client';
import { assertRejectsWith } from './pubsub-client.spec-utils';

import { Level1ProtocolBuffer } from './proto/level1';
import { Level2ProtocolBuffer } from './proto/level2';
import { Level3ProtocolBuffer } from './proto/level3';
import { Level4ProtocolBuffer } from './proto/level4';
import { Level5ProtocolBuffer } from './proto/level5';

const avroSchema1 = {
  fields: [{ name: 'field1', type: 'string' }],
  name: 'Level1',
  type: 'record',
} satisfies schema.RecordType;

const avroSchema2 = {
  fields: [
    { name: 'field1', type: 'string' },
    { name: 'field2', type: 'int' },
    { name: 'field3', type: 'boolean' },
  ],
  name: 'Level2',
  type: 'record',
} satisfies schema.RecordType;

const avroSchema3 = {
  fields: [
    { name: 'field1', type: 'string' },
    { name: 'field2', type: 'int' },
    { name: 'field3', type: 'boolean' },
    { name: 'field4', type: 'double' },
    {
      name: 'field5',
      type: {
        fields: [{ name: 'nestedField1', type: 'string' }],
        name: 'Nested1',
        type: 'record',
      },
    },
  ],
  name: 'Level3',
  type: 'record',
} satisfies schema.RecordType;

const avroSchema4 = {
  fields: [
    { name: 'field1', type: 'string' },
    { name: 'field2', type: 'int' },
    { name: 'field3', type: 'boolean' },
    { name: 'field4', type: 'double' },
    { name: 'field5', type: 'bytes' },
    { name: 'field6', type: { items: 'string', type: 'array' } },
    {
      name: 'nested1',
      type: {
        fields: [
          { name: 'nestedField1', type: 'string' },
          { name: 'nestedField2', type: 'int' },
        ],
        name: 'Nested1L4',
        type: 'record',
      },
    },
    {
      name: 'nested2',
      type: {
        fields: [{ name: 'nestedField3', type: 'boolean' }],
        name: 'Nested2L4',
        type: 'record',
      },
    },
  ],
  name: 'Level4',
  type: 'record',
} satisfies schema.RecordType;

const avroSchema5 = {
  fields: [
    { name: 'field1', type: 'string' },
    { name: 'field2', type: 'int' },
    { name: 'field3', type: 'boolean' },
    { name: 'field4', type: 'double' },
    { name: 'field5', type: 'bytes' },
    { name: 'field6', type: { items: 'string', type: 'array' } },
    { name: 'field7', type: 'float' },
    { name: 'field8', type: 'long' },
    {
      name: 'nested1',
      type: {
        fields: [
          { name: 'nestedField1', type: 'string' },
          {
            name: 'nested2',
            type: {
              fields: [
                { name: 'nestedField2', type: 'int' },
                {
                  name: 'nested3',
                  type: {
                    fields: [{ name: 'nestedField3', type: 'boolean' }],
                    name: 'Nested3L5',
                    type: 'record',
                  },
                },
              ],
              name: 'Nested2L5',
              type: 'record',
            },
          },
        ],
        name: 'Nested1L5',
        type: 'record',
      },
    },
  ],
  name: 'Level5',
  type: 'record',
} satisfies schema.RecordType;

// These tests are skipped. They require a real Google Cloud Pub/Sub instance.
// To run these tests locally:
// 1. Remove '.skip' from the describe() block.
// 2. Export the GOOGLE_APPLICATION_CREDENTIALS environment variable.
describe.skip('PubsubClient.publish()', () => {
  jest.setTimeout(45000);

  let pubsub: PubSub;

  async function createTopicWithSchema(
    schemaDefinition: schema.RecordType,
    encoding: (typeof Encodings)[keyof typeof Encodings],
  ) {
    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition: schemaDefinition,
        encoding,
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

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    return { pubsubClient, topicConfiguration };
  }

  async function createTopicWithProtoSchema(
    definition: MessageType<any>,
    protoFileName: string,
    encoding: (typeof Encodings)[keyof typeof Encodings],
  ) {
    const protoPath = path.resolve(__dirname, `./proto/${protoFileName}`);
    const protoDefinition = fs.readFileSync(protoPath, 'utf-8');

    const topicConfiguration = {
      name: `topic-${crypto.randomUUID()}`,
      schema: {
        definition,
        encoding,
        name: `schema-${crypto.randomUUID()}`,
        protoPath,
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

    const pubsubClient = new PubsubClient({});

    await pubsubClient.initialize([topicConfiguration]);

    return { pubsubClient, topicConfiguration };
  }

  beforeAll(async () => {
    pubsub = new PubSub({});
  });

  afterAll(async () => {
    await pubsub.close();
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should successfully publish level(1).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema1,
      Encodings.Binary,
    );

    try {
      const validData = { field1: 'hello world' };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should throw validation error for invalid data level(1).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema1,
      Encodings.Binary,
    );

    try {
      const invalidData = { field1: 12345 };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "string": 12345');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should successfully publish level(1).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema1,
      Encodings.Json,
    );

    try {
      const validData = { field1: 'hello world' };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should throw validation error for invalid data level(1).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema1,
      Encodings.Json,
    );

    try {
      const invalidData = { field1: 12345 };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "string": 12345');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should successfully publish level(2).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema2,
      Encodings.Binary,
    );

    try {
      const validData = { field1: 'level2', field2: 123, field3: true };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should throw validation error for invalid data level(2).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema2,
      Encodings.Binary,
    );

    try {
      const invalidData = {
        field1: 'level2',
        field2: 'not-an-int',
        field3: false,
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "int": "not-an-int"');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should successfully publish level(2).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema2,
      Encodings.Json,
    );

    try {
      const validData = { field1: 'level2', field2: 123, field3: true };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should throw validation error for invalid data level(2).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema2,
      Encodings.Json,
    );

    try {
      const invalidData = {
        field1: 'level2',
        field2: 'not-an-int',
        field3: false,
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "int": "not-an-int"');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should successfully publish level(3).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema3,
      Encodings.Binary,
    );

    try {
      const validData = {
        field1: 'l3',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 'nested' },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should throw validation error for invalid data level(3).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema3,
      Encodings.Binary,
    );

    try {
      const invalidData = {
        field1: 'l3',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: {},
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "string": undefined');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should successfully publish level(3).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema3,
      Encodings.Json,
    );

    try {
      const validData = {
        field1: 'l3',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 'nested' },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should throw validation error for invalid data level(3).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema3,
      Encodings.Json,
    );

    try {
      const invalidData = {
        field1: 'l3',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: {},
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "string": undefined');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should successfully publish level(4).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema4,
      Encodings.Binary,
    );

    try {
      const validData = {
        field1: 'l4',
        field2: 789,
        field3: true,
        field4: 1.23,
        field5: Buffer.from('test bytes'),
        field6: ['a', 'b', 'c'],
        nested1: { nestedField1: 'n1', nestedField2: 1 },
        nested2: { nestedField3: true },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should throw validation error for invalid data level(4).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema4,
      Encodings.Binary,
    );

    try {
      const invalidData = {
        field1: 'l4',
        field2: 789,
        field3: true,
        field4: 1.23,
        field5: 'not-a-buffer',
        field6: [],
        nested1: { nestedField1: 'n1', nestedField2: 1 },
        nested2: { nestedField3: true },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "bytes": "not-a-buffer"');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should successfully publish level(4).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema4,
      Encodings.Json,
    );

    try {
      const validData = {
        field1: 'l4',
        field2: 789,
        field3: true,
        field4: 1.23,
        field5: Buffer.from('test bytes'),
        field6: ['a', 'b', 'c'],
        nested1: { nestedField1: 'n1', nestedField2: 1 },
        nested2: { nestedField3: true },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should throw validation error for invalid data level(4).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema4,
      Encodings.Json,
    );

    try {
      const invalidData = {
        field1: 'l4',
        field2: 789,
        field3: true,
        field4: 1.23,
        field5: 'not-a-buffer',
        field6: [],
        nested1: { nestedField1: 'n1', nestedField2: 1 },
        nested2: { nestedField3: true },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "bytes": "not-a-buffer"');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should successfully publish level(5).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema5,
      Encodings.Binary,
    );

    try {
      const validData = {
        field1: 'l5',
        field2: 1,
        field3: true,
        field4: 1.1,
        field5: Buffer.from('l5'),
        field6: ['array'],
        field7: 2.2,
        field8: 999999,
        nested1: {
          nested2: {
            nested3: { nestedField3: false },
            nestedField2: 2,
          },
          nestedField1: 'n1',
        },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Binary}: should throw validation error for invalid data level(5).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema5,
      Encodings.Binary,
    );

    try {
      const invalidData = {
        field1: 'l5',
        field2: 1,
        field3: true,
        field4: 1.1,
        field5: Buffer.from('l5'),
        field6: ['array'],
        field7: 2.2,
        field8: 999999,
        nested1: {
          nested2: {
            nested3: { nestedField3: 'not-a-boolean' },
            nestedField2: 2,
          },
          nestedField1: 'n1',
        },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "boolean": "not-a-boolean"');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should successfully publish level(5).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema5,
      Encodings.Json,
    );

    try {
      const validData = {
        field1: 'l5',
        field2: 1,
        field3: true,
        field4: 1.1,
        field5: Buffer.from('l5'),
        field6: ['array'],
        field7: 2.2,
        field8: 999999,
        nested1: {
          nested2: {
            nested3: { nestedField3: false },
            nestedField2: 2,
          },
          nestedField1: 'n1',
        },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.Avro} schema with ${Encodings.Json}: should throw validation error for invalid data level(5).`, async () => {
    const { pubsubClient, topicConfiguration } = await createTopicWithSchema(
      avroSchema5,
      Encodings.Json,
    );

    try {
      const invalidData = {
        field1: 'l5',
        field2: 1,
        field3: true,
        field4: 1.1,
        field5: Buffer.from('l5'),
        field6: ['array'],
        field7: 2.2,
        field8: 999999,
        nested1: {
          nested2: {
            nested3: { nestedField3: 'not-a-boolean' },
            nestedField2: 2,
          },
          nestedField1: 'n1',
        },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid "boolean": "not-a-boolean"');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should successfully publish level(1).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level1ProtocolBuffer,
        'level1.proto',
        Encodings.Binary,
      );

    try {
      const validData = { field1: 'hello world' };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should throw validation error for invalid data level(1).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level1ProtocolBuffer,
        'level1.proto',
        Encodings.Binary,
      );

    try {
      const invalidData = { field1: 12345 };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('fail is not defined');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should successfully publish level(1).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level1ProtocolBuffer,
        'level1.proto',
        Encodings.Json,
      );

    try {
      const validData = { field1: 'hello world' };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should throw validation error for invalid data level(1).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level1ProtocolBuffer,
        'level1.proto',
        Encodings.Json,
      );

    try {
      const invalidData = { field1: 12345 };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toBe('');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should successfully publish level(2).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level2ProtocolBuffer,
        'level2.proto',
        Encodings.Binary,
      );

    try {
      const validData = { field1: 'level2', field2: 123, field3: true };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should throw validation error for invalid data level(2).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level2ProtocolBuffer,
        'level2.proto',
        Encodings.Binary,
      );

    try {
      const invalidData = {
        field1: 'level2',
        field2: 'not-an-int',
        field3: false,
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid int 32: string');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should successfully publish level(2).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level2ProtocolBuffer,
        'level2.proto',
        Encodings.Json,
      );

    try {
      const validData = { field1: 'level2', field2: 123, field3: true };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should throw validation error for invalid data level(2).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level2ProtocolBuffer,
        'level2.proto',
        Encodings.Json,
      );

    try {
      const invalidData = {
        field1: 'level2',
        field2: 'not-an-int',
        field3: false,
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid int 32: string');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should successfully publish level(3).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level3ProtocolBuffer,
        'level3.proto',
        Encodings.Binary,
      );

    try {
      const validData = {
        field1: 'l3',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 'nested' },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should throw validation error for invalid data level(3).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level3ProtocolBuffer,
        'level3.proto',
        Encodings.Binary,
      );

    try {
      const invalidData = {
        field1: 'l3',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 123 },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('fail is not defined');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should successfully publish level(3).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level3ProtocolBuffer,
        'level3.proto',
        Encodings.Json,
      );

    try {
      const validData = {
        field1: 'l3',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 'nested' },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should throw validation error for invalid data level(3).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level3ProtocolBuffer,
        'level3.proto',
        Encodings.Json,
      );

    try {
      const invalidData = {
        field1: 'l3',
        field2: 456,
        field3: false,
        field4: 3.14,
        field5: { nestedField1: 123 },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toBe('');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should successfully publish level(4).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level4ProtocolBuffer,
        'level4.proto',
        Encodings.Binary,
      );

    try {
      const validData = {
        field1: 'l4',
        field2: 789,
        field3: true,
        field4: 1.23,
        field5: Buffer.from('test bytes'),
        field6: ['a', 'b', 'c'],
        nested1: { nestedField1: 'n1', nestedField2: 1 },
        nested2: { nestedField3: true },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should throw validation error for invalid data level(4).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level4ProtocolBuffer,
        'level4.proto',
        Encodings.Binary,
      );

    try {
      const invalidData = {
        field1: 'l4',
        field2: 789,
        field3: true,
        field4: 1.23,
        field5: 'not-a-buffer',
        field6: [],
        nested1: { nestedField1: 'n1', nestedField2: 1 },
        nested2: { nestedField3: true },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('invalid uint 32: undefined');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should successfully publish level(4).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level4ProtocolBuffer,
        'level4.proto',
        Encodings.Json,
      );

    try {
      const validData = {
        field1: 'l4',
        field2: 789,
        field3: true,
        field4: 1.23,
        field5: Buffer.from('test bytes'),
        field6: ['a', 'b', 'c'],
        nested1: { nestedField1: 'n1', nestedField2: 1 },
        nested2: { nestedField3: true },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should throw validation error for invalid data level(4).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level4ProtocolBuffer,
        'level4.proto',
        Encodings.Json,
      );

    try {
      const invalidData = {
        field1: 'l4',
        field2: 789,
        field3: true,
        field4: 1.23,
        field5: 'not-a-buffer',
        field6: [],
        nested1: { nestedField1: 'n1', nestedField2: 1 },
        nested2: { nestedField3: true },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toBe('');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should successfully publish level(5).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level5ProtocolBuffer,
        'level5.proto',
        Encodings.Binary,
      );

    try {
      const validData = {
        field1: 'l5',
        field2: 1,
        field3: true,
        field4: 1.1,
        field5: Buffer.from('l5'),
        field6: ['array'],
        field7: 2.2,
        field8: BigInt(999999),
        nested1: {
          nested2: {
            nested3: { nestedField3: false },
            nestedField2: 2,
          },
          nestedField1: 'n1',
        },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Binary}: should throw validation error for invalid data level(5).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level5ProtocolBuffer,
        'level5.proto',
        Encodings.Binary,
      );

    try {
      const invalidData = {
        field1: 'l5',
        field2: 1,
        field3: true,
        field4: 1.1,
        field5: Buffer.from('l5'),
        field6: ['array'],
        field7: 2.2,
        field8: BigInt(999999),
        nested1: {
          nested2: {
            nested3: { nestedField3: 'not-a-boolean' },
            nestedField2: 2,
          },
          nestedField1: 'n1',
        },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toContain('fail is not defined');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should successfully publish level(5).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level5ProtocolBuffer,
        'level5.proto',
        Encodings.Json,
      );

    try {
      const validData = {
        field1: 'l5',
        field2: 1,
        field3: true,
        field4: 1.1,
        field5: Buffer.from('l5'),
        field6: ['array'],
        field7: 2.2,
        field8: BigInt(999999),
        nested1: {
          nested2: {
            nested3: { nestedField3: false },
            nestedField2: 2,
          },
          nestedField1: 'n1',
        },
      };

      await expect(
        pubsubClient.publish(topicConfiguration.name, { data: validData }),
      ).resolves.toEqual(expect.any(String));
    } finally {
      await pubsubClient.close();
    }
  });

  it(`${SchemaTypes.ProtocolBuffer} schema with ${Encodings.Json}: should throw validation error for invalid data level(5).`, async () => {
    const { pubsubClient, topicConfiguration } =
      await createTopicWithProtoSchema(
        Level5ProtocolBuffer,
        'level5.proto',
        Encodings.Json,
      );

    try {
      const invalidData = {
        field1: 'l5',
        field2: 1,
        field3: true,
        field4: 1.1,
        field5: Buffer.from('l5'),
        field6: ['array'],
        field7: 2.2,
        field8: BigInt(999999),
        nested1: {
          nested2: {
            nested3: { nestedField3: 'not-a-boolean' },
            nestedField2: 2,
          },
          nestedField1: 'n1',
        },
      };

      await assertRejectsWith(
        () =>
          pubsubClient.publish(topicConfiguration.name, { data: invalidData }),
        Error,
        (error) => {
          expect(error.message).toBe('');
        },
      );
    } finally {
      await pubsubClient.close();
    }
  });
});
