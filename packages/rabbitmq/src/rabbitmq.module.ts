import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  createConfigurableDynamicRootModule,
  IConfigurableDynamicRootModule,
} from '@golevelup/nestjs-modules';
import {
  DynamicModule,
  Module,
  ConsoleLogger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { groupBy } from 'lodash';
import { AmqpConnection } from './amqp/connection';
import { RABBIT_CONFIG_TOKEN, RABBIT_HANDLER } from './rabbitmq.constants';
import { RabbitHandlerConfig, RabbitMQConfig } from './rabbitmq.interfaces';

declare const placeholder: IConfigurableDynamicRootModule<
  RabbitMQModule,
  RabbitMQConfig
>;

@Module({
  imports: [DiscoveryModule],
})
export class RabbitMQModule
  extends createConfigurableDynamicRootModule<RabbitMQModule, RabbitMQConfig>(
    RABBIT_CONFIG_TOKEN,
    {
      providers: [
        {
          provide: AmqpConnection,
          useFactory: async (
            config: RabbitMQConfig
          ): Promise<AmqpConnection> => {
            return RabbitMQModule.AmqpConnectionFactory(config);
          },
          inject: [RABBIT_CONFIG_TOKEN],
        },
      ],
      exports: [AmqpConnection],
    }
  )
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new ConsoleLogger(RabbitMQModule.name);

  constructor(
    private readonly discover: DiscoveryService,
    private readonly amqpConnection: AmqpConnection,
    private readonly externalContextCreator: ExternalContextCreator
  ) {
    super();
  }

  static async AmqpConnectionFactory(config: RabbitMQConfig) {
    const connection = new AmqpConnection(config);
    await connection.init();
    const logger = new ConsoleLogger(RabbitMQModule.name);
    logger.log('Successfully connected to RabbitMQ');
    return connection;
  }

  public static build(config: RabbitMQConfig): DynamicModule {
    const logger = new ConsoleLogger(RabbitMQModule.name);
    logger.warn(
      'build() is deprecated. use forRoot() or forRootAsync() to configure RabbitMQ'
    );
    return {
      module: RabbitMQModule,
      providers: [
        {
          provide: AmqpConnection,
          useFactory: async (): Promise<AmqpConnection> => {
            return RabbitMQModule.AmqpConnectionFactory(config);
          },
        },
      ],
      exports: [AmqpConnection],
    };
  }

  public static attach(connection: AmqpConnection): DynamicModule {
    return {
      module: RabbitMQModule,
      providers: [
        {
          provide: AmqpConnection,
          useValue: connection,
        },
      ],
      exports: [AmqpConnection],
    };
  }

  async onApplicationShutdown() {
    this.logger.verbose('Closing AMQP Connection');
    await this.amqpConnection.managedConnection.close();
  }

  public async onApplicationBootstrap() {
    if (!this.amqpConnection.configuration.registerHandlers) {
      this.logger.log(
        'Skipping RabbitMQ Handlers due to configuration. This application instance will not receive messages over RabbitMQ'
      );

      return;
    }

    this.logger.log('Initializing RabbitMQ Handlers');

    const rabbitMeta =
      await this.discover.providerMethodsWithMetaAtKey<RabbitHandlerConfig>(
        RABBIT_HANDLER
      );

    const grouped = groupBy(
      rabbitMeta,
      (x) => x.discoveredMethod.parentClass.name
    );

    const providerKeys = Object.keys(grouped);

    for (const key of providerKeys) {
      this.logger.log(`Registering rabbitmq handlers from ${key}`);
      await Promise.all(
        grouped[key].map(async ({ discoveredMethod, meta: config }) => {
          const handler = this.externalContextCreator.create(
            discoveredMethod.parentClass.instance,
            discoveredMethod.handler,
            discoveredMethod.methodName,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            'rmq'
          );

          const { exchange, routingKey, queue, queueOptions } = config;

          const handlerDisplayName = `${discoveredMethod.parentClass.name}.${
            discoveredMethod.methodName
          } {${config.type}} -> ${
            // eslint-disable-next-line sonarjs/no-nested-template-literals
            queueOptions?.channel ? `${queueOptions.channel}::` : ''
          }${exchange}::${routingKey}::${queue || 'amqpgen'}`;

          if (
            config.type === 'rpc' &&
            !this.amqpConnection.configuration.enableDirectReplyTo
          ) {
            this.logger.warn(
              `Direct Reply-To Functionality is disabled. RPC handler ${handlerDisplayName} will not be registered`
            );
            return;
          }

          this.logger.log(handlerDisplayName);

          return config.type === 'rpc'
            ? this.amqpConnection.createRpc(handler, config)
            : this.amqpConnection.createSubscriber(handler, config);
        })
      );
    }
  }
}
