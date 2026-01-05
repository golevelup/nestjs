import { Encodings, Message, SchemaTypes } from '@google-cloud/pubsub';
import { Type as AvroType, schema } from 'avsc';
import * as crypto from 'crypto';

import { ENCODINGS, PubsubTopicConfiguration } from '../src';
import { PubsubConfigurationInvalidError } from '../src/client/pubsub-configuration.errors';
import { PubsubSerializer } from '../src/client/pubsub.serializer';

import { TestEvent } from './proto/test';

describe('PubsubSerializer', () => {
  const avroSchema = {
    fields: [
      { name: 'test', type: 'string' },
      { name: 'isActive', type: 'boolean' },
    ],
    name: 'Test',
    type: 'record',
  } satisfies schema.RecordType;
  const avroType = AvroType.forSchema(avroSchema);

  const data = { isActive: false, test: 'my-random-value' };

  const protoData: TestEvent = {
    isActive: true,
    test: 'my-random-value',
  };

  it('Default serializer: should return input data as-is and return raw buffer on deserialize if schema was not provided.', () => {
    const serializer = new PubsubSerializer(`topic.${crypto.randomUUID()}`);

    expect(serializer.serialize(data)).toEqual(data);

    const inputBuffer = Buffer.from('some-binary-data');
    expect(serializer.serialize(inputBuffer)).toBe(inputBuffer);

    const jsonBuffer = Buffer.from(JSON.stringify(data));
    const result = serializer.deserialize({ data: jsonBuffer } as Message);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(jsonBuffer);

    expect(JSON.parse(result.toString())).toEqual(data);
  });

  it(`${SchemaTypes.Avro} serializer with ${Encodings.Binary} encoding: should serialize/deserialize successfully when ${Encodings.Binary} data was provided.`, () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: avroSchema,
        encoding: Encodings.Binary,
        name: 'Test',
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const serializer = new PubsubSerializer(
      topicConfiguration.name,
      topicConfiguration.schema,
    );
    const buffer = avroType.toBuffer(data);

    expect(serializer.serialize(data)).toEqual(buffer);
    expect(serializer.deserialize({ data: buffer } as Message)).toEqual(data);
  });

  it(`${SchemaTypes.Avro} serializer with ${Encodings.Binary} encoding: should throw an error when ${Encodings.Json} data was provided.`, () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: avroSchema,
        encoding: Encodings.Binary,
        name: 'Test',
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const serializer = new PubsubSerializer(
      topicConfiguration.name,
      topicConfiguration.schema,
    );
    const buffer = Buffer.from(JSON.stringify(data));

    expect(() => serializer.deserialize({ data: buffer } as Message)).toThrow();
  });

  it(`${SchemaTypes.Avro} serializer with ${Encodings.Json} encoding: should serialize/deserialize data successfully when ${Encodings.Json} data was provided.`, () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: avroSchema,
        encoding: Encodings.Json,
        name: 'Test',
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const serializer = new PubsubSerializer(
      topicConfiguration.name,
      topicConfiguration.schema,
    );

    const buffer = Buffer.from(avroType.toString(data));

    expect(serializer.serialize(data)).toEqual(buffer);
    expect(serializer.deserialize({ data: buffer } as Message)).toEqual(data);
  });

  it(`${SchemaTypes.Avro} serializer with ${Encodings.Json} encoding: should throw an error when ${Encodings.Binary} data was provided.`, () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: avroSchema,
        encoding: Encodings.Json,
        name: 'Test',
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const serializer = new PubsubSerializer(
      topicConfiguration.name,
      topicConfiguration.schema,
    );

    const buffer = avroType.toBuffer(data);

    expect(() => serializer.deserialize({ data: buffer } as Message)).toThrow();
  });

  it(`${SchemaTypes.Avro} serializer: throw an error if not valid encoding was provide.`, () => {
    const encoding = 'random';

    const topicConfiguration: PubsubTopicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: avroSchema,
        encoding: encoding as any,
        name: 'Test',
        type: SchemaTypes.Avro,
      },
      subscriptions: [],
    };

    const expectedError = new PubsubConfigurationInvalidError(
      topicConfiguration.name,
      {
        key: 'schema.encoding',
        reason: `Unsupported schema encoding. Supported encodings: (${ENCODINGS.join(', ')}).`,
        value: encoding,
      },
    );

    expect(
      () =>
        new PubsubSerializer(
          topicConfiguration.name,
          topicConfiguration.schema,
        ),
    ).toThrow(expectedError);
  });

  it(`${SchemaTypes.ProtocolBuffer} serializer with ${Encodings.Binary} encoding: should serialize/deserialize successfully when ${Encodings.Binary} data was provided.`, () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: TestEvent,
        encoding: Encodings.Binary,
        name: 'Test',
        protoPath: 'proto-path',
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const serializer = new PubsubSerializer(
      topicConfiguration.name,
      topicConfiguration.schema,
    );
    const buffer = Buffer.from(TestEvent.toBinary(protoData));

    expect(serializer.serialize(protoData)).toEqual(buffer);
    expect(serializer.deserialize({ data: buffer } as Message)).toEqual(
      protoData,
    );
  });

  it(`${SchemaTypes.ProtocolBuffer} serializer with ${Encodings.Binary} encoding: should throw an error when ${Encodings.Json} data was provided.`, () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: TestEvent,
        encoding: Encodings.Binary,
        name: 'Test',
        protoPath: 'proto-path',
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const serializer = new PubsubSerializer(
      topicConfiguration.name,
      topicConfiguration.schema,
    );
    const buffer = Buffer.from(JSON.stringify(protoData));

    expect(() => serializer.deserialize({ data: buffer } as Message)).toThrow();
  });

  it(`${SchemaTypes.ProtocolBuffer} serializer with ${Encodings.Json} encoding: should serialize/deserialize data successfully when ${Encodings.Json} data was provided.`, () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: TestEvent,
        encoding: Encodings.Json,
        name: 'Test',
        protoPath: 'proto-path',
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const serializer = new PubsubSerializer(
      topicConfiguration.name,
      topicConfiguration.schema,
    );

    const buffer = Buffer.from(JSON.stringify(TestEvent.toJson(protoData)));

    expect(serializer.serialize(protoData)).toEqual(buffer);
    expect(serializer.deserialize({ data: buffer } as Message)).toEqual(
      TestEvent.fromJsonString(buffer.toString()),
    );
  });

  it(`${SchemaTypes.ProtocolBuffer} serializer with ${Encodings.Json} encoding: should throw an error when ${Encodings.Binary} data was provided.`, () => {
    const topicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: TestEvent,
        encoding: Encodings.Json,
        name: 'Test',
        protoPath: 'proto-path',
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [],
    } as const satisfies PubsubTopicConfiguration;

    const serializer = new PubsubSerializer(
      topicConfiguration.name,
      topicConfiguration.schema,
    );

    const buffer = Buffer.from(TestEvent.toBinary(protoData));

    expect(() => serializer.deserialize({ data: buffer } as Message)).toThrow();
  });

  it(`${SchemaTypes.ProtocolBuffer} serializer: throw an error if not valid encoding was provide.`, () => {
    const encoding = 'random';

    const topicConfiguration: PubsubTopicConfiguration = {
      name: `topic.${crypto.randomUUID()}`,
      schema: {
        definition: TestEvent,
        encoding: encoding as any,
        name: 'Test',
        protoPath: 'proto-path',
        type: SchemaTypes.ProtocolBuffer,
      },
      subscriptions: [],
    };

    const expectedError = new PubsubConfigurationInvalidError(
      topicConfiguration.name,
      {
        key: 'schema.encoding',
        reason: `Unsupported schema encoding. Supported encodings: (${ENCODINGS.join(', ')}).`,
        value: encoding,
      },
    );

    expect(
      () =>
        new PubsubSerializer(
          topicConfiguration.name,
          topicConfiguration.schema,
        ),
    ).toThrow(expectedError);
  });
});
