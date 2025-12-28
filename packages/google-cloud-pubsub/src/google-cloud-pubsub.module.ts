import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  ConfigurableModuleAsyncOptions,
  DynamicModule,
  Inject,
  Logger,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  Provider,
} from '@nestjs/common';
import { InferPayloadMap, PubsubTopicConfiguration } from './client';

import { PubsubClient } from './client/pubsub.client';
import {
  GOOGLE_CLOUD_PUBSUB_BATCH_SUBSCRIBE,
  GOOGLE_CLOUD_PUBSUB_CLIENT_TOKEN,
  GOOGLE_CLOUD_PUBSUB_SUBSCRIBE,
} from './google-cloud-pubsub.constants';
import {
  createBatchSubscribeDecorator,
  createSubscribeDecorator,
  PubsubBatchSubscribeMetadata,
  PubsubSubscribeMetadata,
} from './google-cloud-pubsub.decorators';
import {
  ConfigurableModuleClass,
  GOOGLE_CLOUD_PUBSUB_MODULE_OPTIONS_TOKEN,
  GoogleCloudPubsubModuleOptions,
  GoogleCloudPubsubModuleOptionsExtras,
} from './google-cloud-pubsub.module-definition';
import { GoogleCloudPubsubAbstractPublisher } from './google-cloud-pubsub.abstract-publisher';

@Module({
  controllers: [],
  exports: [],
  imports: [DiscoveryModule],
  providers: [
    {
      inject: [GOOGLE_CLOUD_PUBSUB_MODULE_OPTIONS_TOKEN],
      provide: GOOGLE_CLOUD_PUBSUB_CLIENT_TOKEN,
      useFactory: (options: GoogleCloudPubsubModuleOptions) => {
        const logger = options.logger || new Logger(GoogleCloudPubsubModule.name);

        return new PubsubClient({
          ...options.client,
          logger,
        });
      },
    },
  ],
})
export class GoogleCloudPubsubModule extends ConfigurableModuleClass implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    @Inject(GOOGLE_CLOUD_PUBSUB_CLIENT_TOKEN)
    private readonly pubsubClient: PubsubClient,
    @Inject(GOOGLE_CLOUD_PUBSUB_MODULE_OPTIONS_TOKEN)
    private readonly options: GoogleCloudPubsubModuleOptions,
    private readonly discoveryService: DiscoveryService,
  ) {
    super();

    this.logger = options?.logger || new Logger(GoogleCloudPubsubModule.name);
  }

  public static initializeKit<Topics extends readonly PubsubTopicConfiguration[]>() {
    type GoogleCloudPubsubPayloadsMap = InferPayloadMap<Topics>;

    const GoogleCloudPubsubBatchSubscribe = createBatchSubscribeDecorator<Topics, GoogleCloudPubsubPayloadsMap>();
    const GoogleCloudPubsubSubscribe = createSubscribeDecorator<Topics, GoogleCloudPubsubPayloadsMap>();

    return {
      _GoogleCloudPubsubPayloadsMap: {} as GoogleCloudPubsubPayloadsMap,
      GoogleCloudPubsubAbstractPublisher,
      GoogleCloudPubsubBatchSubscribe,
      GoogleCloudPubsubSubscribe,
    };
  }

  public static registerAsync(
    options: ConfigurableModuleAsyncOptions<GoogleCloudPubsubModuleOptions, 'create'> &
      Partial<GoogleCloudPubsubModuleOptionsExtras>,
  ): DynamicModule {
    const moduleDefinition = super.registerAsync(options);

    moduleDefinition.providers = moduleDefinition.providers || [];
    moduleDefinition.exports = moduleDefinition.exports || [];

    if (!options.publisher) {
      throw new Error('`publisher` class must be provided in GcpPubsubModule.registerAsync.');
    }

    const publisherProvider: Provider = {
      inject: [GOOGLE_CLOUD_PUBSUB_CLIENT_TOKEN],
      provide: options.publisher,
      useFactory: (pubsubClient: PubsubClient) => new options.publisher!(pubsubClient),
    };

    moduleDefinition.providers.push(publisherProvider);
    moduleDefinition.exports.push(options.publisher);

    return moduleDefinition;
  }

  public async onApplicationBootstrap() {
    await this.pubsubClient.initialize(this.options.topics);
    await this.attachMessageHandlers();

    return;
  }

  public async onApplicationShutdown() {
    await this.pubsubClient.close();

    return;
  }

  private async attachMessageHandlers() {
    const [providers, batchProviders] = await Promise.all([
      this.discoveryService.providerMethodsWithMetaAtKey<PubsubSubscribeMetadata>(GOOGLE_CLOUD_PUBSUB_SUBSCRIBE),
      this.discoveryService.providerMethodsWithMetaAtKey<PubsubBatchSubscribeMetadata>(GOOGLE_CLOUD_PUBSUB_BATCH_SUBSCRIBE),
    ]);

    const tasks = [
      ...providers.map(({ discoveredMethod, meta }) => {
        return this.pubsubClient.attachHandler(
          meta.subscription,
          discoveredMethod.handler.bind(discoveredMethod.parentClass.instance),
        );
      }),
      ...batchProviders.map(({ discoveredMethod, meta }) => {
        return this.pubsubClient.attachBatchHandler(
          meta.subscription,
          discoveredMethod.handler.bind(discoveredMethod.parentClass.instance),
        );
      }),
    ];

    await Promise.all(tasks);
  }
}
