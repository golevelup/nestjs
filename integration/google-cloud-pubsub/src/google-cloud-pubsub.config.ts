import { GoogleCloudPubsubModule, PubsubTopicConfiguration } from '@golevelup/nestjs-google-cloud-pubsub';
import { MessageType } from '@protobuf-ts/runtime';
import * as path from 'node:path';

import { Level5ProtocolBuffer } from '../e2e/proto/level5';

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
        name: 'Level3',
        type: 'record',
      },

      encoding: 'BINARY',
      name: 'order.created.schema',
      type: 'AVRO',
    },
    subscriptions: [{ name: 'order.created.subscription.order-processor-service' }, { name: 'order.created.subscription.analytic-service' }],
  },
  {
    name: 'order.created.dead-letter-queue',
    subscriptions: [{ name: 'order.created.dead-letter-queue.subscription' }],
  },
  {
    name: 'payment.processed',
    schema: {
      definition: Level5ProtocolBuffer as MessageType<Level5ProtocolBuffer>,
      encoding: 'BINARY',
      name: 'payment.processed.schema',
      protoPath: path.join(process.cwd(), 'e2e/proto/level5.proto'),
      type: 'PROTOCOL_BUFFER',
    },
    subscriptions: [
      { name: 'payment.processed.payment-processor-service' },
      {
        name: 'payment.processed.analytic-service',
        options: {
          flowControl: { maxMessages: 100 },
        },
      },
    ],
  },
  {
    name: 'payment.processed.dead-letter-queue',
    subscriptions: [{ name: 'payment.processed.dead-letter-queue.subscription' }],
  },
] as const satisfies readonly PubsubTopicConfiguration[];

const googleCloudPubsubKit = GoogleCloudPubsubModule.initializeKit<typeof topics>();
const { GoogleCloudPubsubAbstractPublisher, GoogleCloudPubsubSubscribe } = googleCloudPubsubKit;

export type GoogleCloudPubsubPayloadsMap = typeof googleCloudPubsubKit._GoogleCloudPubsubPayloadsMap;
export class GoogleCloudPubsubPublisher extends GoogleCloudPubsubAbstractPublisher<GoogleCloudPubsubPayloadsMap> {}
export { GoogleCloudPubsubSubscribe };
