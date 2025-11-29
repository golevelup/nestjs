# @golevelup/nestjs-google-cloud-pubsub

A type-safe Google Cloud Pub/Sub integration for NestJS. The module validates topic/subscription configuration, keeps schemas in sync with remote revisions, and generates a fully typed publisher/subscriber API through `initializeKit`.

## Installation

```bash
npm install @golevelup/nestjs-google-cloud-pubsub @google-cloud/pubsub avsc @protobuf-ts/runtime
```

## Quick Start

Define your topics/subscriptions once and call `initializeKit`. It produces a typed publisher class, a subscribe decorator, and a payload map inferred from your Avro/Proto schemas.

// google-cloud-pubsub.configuration.ts

```ts
import {
  GoogleCloudPubsubModule,
  PubsubTopicConfiguration,
} from '@golevelup/nestjs-google-cloud-pubsub';
import { SchemaTypes, Encodings } from '@google-cloud/pubsub';
import { MessageType } from '@protobuf-ts/runtime';

import { PaymentProcessedProtocolBufferSchema } from './generated-proto/payment-processed-schema';

export const topics = [
  {
    name: 'order.created',
    schema: {
      definition: {
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
          { name: 'field6', type: ['double', 'null'] },
        ],
        name: 'order.created.schema',
        type: 'record',
      },
      encoding: Encodings.Binary,
      name: 'order.created.schema',
      type: SchemaTypes.Avro,
    },
    subscriptions: [
      { name: 'order.created.subscription.order-processor-service' },
      { name: 'order.created.subscription.analytic-service' },
    ],
  },
  {
    name: 'payment.processed',
    schema: {
      definition:
        PaymentProcessedProtocolBufferSchema as MessageType<PaymentProcessedProtocolBufferSchema>,
      encoding: Encodings.Binary,
      name: 'payment.processed.schema',
      protoPath:
        '/Users/Desktop/google-cloud-pubsub/proto/payment-processed.proto',
      type: SchemaTypes.ProtocolBuffer,
    },
    subscriptions: [
      { name: 'payment.processed.payment-processor-service' },
      { name: 'payment.processed.analytic-service' },
    ],
  },
] as const satisfies readonly PubsubTopicConfiguration[];

const {
  _GoogleCloudPubsubPayloadsMap,
  GoogleCloudPubsubAbstractPublisher,
  GoogleCloudPubsubSubscribe,
} = GoogleCloudPubsubModule.initializeKit<typeof topics>();

export type GoogleCloudPubsubPayloadsMap = typeof _GoogleCloudPubsubPayloadsMap;

export class GoogleCloudPubsubPublisher extends GoogleCloudPubsubAbstractPublisher<GoogleCloudPubsubPayloadsMap> {}
export { GoogleCloudPubsubSubscribe };
```

// app.module.ts

```ts
import { Module } from '@nestjs/common';
import { GoogleCloudPubsubModule } from '@golevelup/nestjs-google-cloud-pubsub';

import {
  GoogleCloudPubsubPublisher,
  topics,
} from './google-cloud-pubsub.configuration';

@Module({
  imports: [
    GoogleCloudPubsubModule.registerAsync({
      useFactory: () => ({
        client: { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS },
        topics,
      }),
      publisher: GoogleCloudPubsubPublisher,
    }),
  ],
})
export class AppModule {}
```

// app.service.ts

```ts
import { Injectable } from '@nestjs/common';
import { GoogleCloudPubsubMessage } from '@golevelup/nestjs-google-cloud-pubsub';

import {
  GoogleCloudPubsubPayloadsMap,
  GoogleCloudPubsubPublisher,
  GoogleCloudPubsubSubscribe,
} from './google-cloud-pubsub.configuration';

@Injectable()
export class AppService {
  constructor(
    private readonly googleCloudPubsubPublisher: GoogleCloudPubsubPublisher,
  ) {}

  public async publishOrderCreated() {
    await this.googleCloudPubsubPublisher.publish('order.created', {
      data: {
        field1: 'field1',
        field2: 0,
        field3: true,
        field4: 10,
        field5: { nestedField1: 'nestedField1' },
        field6: null,
      },
    });
  }

  @GoogleCloudPubsubSubscribe(
    'order.created',
    'order.created.subscription.analytic-service',
  )
  public async onOrderCreated(
    payload: GoogleCloudPubsubMessage<
      GoogleCloudPubsubPayloadsMap['order.created']
    >,
  ) {
    console.log({ data: payload.data });
  }
}
```

## Future features

- Custom error hooks / metric emitters.
- Push subscription support.
- Split optional dependencies so Avro (`avsc`) and Protocol Buffer runtimes are only required when those schema types are used.
- Publisher.ready() helper that awaits PubsubClient initialization.
- Manual ack/nack.
- Iterate over schema revisions page by page instead of fetching them all at once.
