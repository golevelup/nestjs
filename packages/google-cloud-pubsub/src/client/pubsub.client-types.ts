import {
  ClientConfig,
  Message,
  PublishOptions,
  SchemaTypes,
  SubscriptionOptions,
} from '@google-cloud/pubsub';

import {
  InferAvroPayload,
  PubsubSchemaConfiguration,
} from './pubsub-schema.client-types';
import { BatchManagerOptions } from './pubsub-subscription.batch-manager';
import { IMessageType } from './vendor/protobuf-runtime';

export interface PubsubSubscriptionConfiguration {
  name: string;
  options?: SubscriptionOptions;
  batchManagerOptions?: BatchManagerOptions;
}

export type PubsubTopicConfiguration = {
  name: string;
  publishOptions?: PublishOptions;
  schema?: PubsubSchemaConfiguration;
  subscriptions: readonly PubsubSubscriptionConfiguration[];
};

export interface PubsubClientLogger {
  debug?(message: any, ...parameters: any[]): void;
  error(message: any, ...parameters: any[]): void;
  log(message: any, ...parameters: any[]): void;
  verbose?(message: any, ...parameters: any[]): void;
  warn(message: any, ...parameters: any[]): void;
}

export interface PubsubClientConfiguration extends ClientConfig {
  logger?: PubsubClientLogger;
  adaptiveFlowControl?: boolean;
}

export type InferPayloadMap<
  TopicConfigurations extends readonly PubsubTopicConfiguration[],
> = {
  [Topic in TopicConfigurations[number] as Topic['name']]: Topic extends {
    schema?: infer InferredSchema;
  }
    ? InferredSchema extends PubsubSchemaConfiguration
      ? InferredSchema['type'] extends typeof SchemaTypes.Avro
        ? InferAvroPayload<InferredSchema['definition']>
        : InferredSchema['type'] extends typeof SchemaTypes.ProtocolBuffer
          ? InferredSchema['definition'] extends IMessageType<
              infer InferredPayload
            >
            ? InferredPayload
            : never
          : Buffer
      : Buffer
    : Buffer;
};

const invariantDataSymbol = Symbol(
  'GOOGLE_CLOUD_PUBSUB_MESSAGE_INVARIANT_DATA',
);

export interface GoogleCloudPubsubMessage<T = Buffer> {
  readonly attributes: Message['attributes'];
  readonly data: T;
  readonly [invariantDataSymbol]?: (arg: T) => T;
  readonly deliveryAttempt: Message['deliveryAttempt'];
  readonly id: Message['id'];
  readonly orderingKey?: Message['orderingKey'];
  readonly publishTime: Message['publishTime'];
}
