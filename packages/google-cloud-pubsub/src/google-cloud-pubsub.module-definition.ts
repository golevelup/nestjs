import { ClientConfig } from '@google-cloud/pubsub';
import { ConfigurableModuleBuilder, LoggerService, Type } from '@nestjs/common';

import { PubsubTopicConfiguration } from './client';
import { GoogleCloudPubsubAbstractPublisher } from './google-cloud-pubsub.abstract-publisher';

export type GoogleCloudPubsubModuleOptionsExtras = {
  publisher: Type<GoogleCloudPubsubAbstractPublisher<Record<string, unknown>>>;
  global: boolean;
};

export type GoogleCloudPubsubModuleOptions = {
  client: ClientConfig;
  logger?: LoggerService;
  topics: readonly PubsubTopicConfiguration[];
};

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: GOOGLE_CLOUD_PUBSUB_MODULE_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE: GOOGLE_CLOUD_PUBSUB_ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE: GOOGLE_CLOUD_PUBSUB_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<GoogleCloudPubsubModuleOptions>()
  .setExtras(
    { global: true } as GoogleCloudPubsubModuleOptionsExtras,
    (definition, extras) => ({ ...definition, ...extras }),
  )
  .build();
