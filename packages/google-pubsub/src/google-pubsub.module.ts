import { PubSub } from '@google-cloud/pubsub';
import { DiscoveryModule, DiscoveryService } from '@nestjs-plus/discovery';
import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { groupBy } from 'lodash';
import { GOOGLE_PUBSUB_HANDLER } from './google-pubsub.constants';
import { GooglePubSubHandlerConfig } from './google-pubsub.interfaces';

@Module({
  imports: [DiscoveryModule]
})
export class GooglePubSubModule implements OnModuleInit {
  private readonly logger = new Logger(GooglePubSubModule.name);
  constructor(
    private readonly discover: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
    private readonly pubSub: PubSub
  ) {}

  public static forRoot(
    projectId: string = 'proof-of-concepts-192320'
  ): DynamicModule {
    return {
      module: GooglePubSubModule,
      providers: [
        {
          provide: PubSub,
          useFactory: async (): Promise<PubSub> => {
            // const logger = new Logger(GooglePubSubModule.name);

            const pubSub = new PubSub({ projectId });

            // const [topic] = await pubSub.createTopic('test');
            // console.log(`Topic ${topic.name} created.`);

            // const [result] = await pubSub
            //   .topic('test')
            //   .createSubscription('testSub');

            // console.log(result);

            const sub = pubSub.subscription('testSub');

            return pubSub;
          }
        }
      ],
      exports: [PubSub]
    };
  }

  public async onModuleInit() {
    this.logger.log('Initializing Google PubSub Connection');

    const pubSubMeta = await this.discover.providerMethodsWithMetaAtKey<
      GooglePubSubHandlerConfig
    >(GOOGLE_PUBSUB_HANDLER);

    const providerGrouped = groupBy(
      pubSubMeta,
      x => x.discoveredMethod.parentClass.name
    );

    const providerKeys = Object.keys(providerGrouped);
    for (const key of providerKeys) {
      this.logger.log(`Registering rabbitmq handlers from ${key}`);
      await Promise.all(
        providerGrouped[key].map(async ({ discoveredMethod, meta }) => {
          const handler = this.externalContextCreator.create(
            discoveredMethod.parentClass.instance,
            discoveredMethod.handler,
            discoveredMethod.methodName
          );

          const { topic, subscription } = meta;

          this.logger.log(
            `Attaching subscription handler on topic ${topic} and subscription ${subscription}`
          );

          this.pubSub
            .topic(topic)
            .subscription(subscription)
            .on('message', handler);
        })
      );
    }
  }
}
