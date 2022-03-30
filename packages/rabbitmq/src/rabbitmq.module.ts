import { DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';
import {
  createConfigurableDynamicRootModule,
  IConfigurableDynamicRootModule,
} from '@golevelup/nestjs-modules';
import {
  DynamicModule,
  Module,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { groupBy } from 'lodash';
import { AmqpConnection } from './amqp/connection';
import {
  RABBIT_ARGS_METADATA,
  RABBIT_CONFIG_TOKEN,
  RABBIT_CONNECTIONS,
  RABBIT_HANDLER,
} from './rabbitmq.constants';
import { InjectRabbitMQConnections } from './rabbitmq.decorators';
import { RabbitRpcParamsFactory } from './rabbitmq.factory';
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
          provide: RABBIT_CONNECTIONS,
          useFactory: async (
            config: RabbitMQConfig
          ): Promise<AmqpConnection[]> => {
            await RabbitMQModule.AmqpConnectionFactory(config);
            return RabbitMQModule.connections;
          },
          inject: [RABBIT_CONFIG_TOKEN],
        },
        {
          provide: AmqpConnection,
          useFactory: async (
            config: RabbitMQConfig
          ): Promise<AmqpConnection> => {
            return RabbitMQModule.connections.find(
              (connection) =>
                connection.configuration.name === config.name || 'default'
            ) as AmqpConnection;
          },
          inject: [RABBIT_CONFIG_TOKEN],
        },
        RabbitRpcParamsFactory,
      ],
      exports: [RABBIT_CONNECTIONS, AmqpConnection],
    }
  )
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(RabbitMQModule.name);

  private static connections: AmqpConnection[] = [];

  constructor(
    private readonly discover: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
    private readonly rpcParamsFactory: RabbitRpcParamsFactory,

    @InjectRabbitMQConnections()
    private readonly amqpConnections: AmqpConnection[]
  ) {
    super();
  }

  static async AmqpConnectionFactory(config: RabbitMQConfig) {
    const connection = new AmqpConnection(config);
    this.connections.push(connection);
    await connection.init();
    const logger = new Logger(RabbitMQModule.name);
    logger.log('Successfully connected to RabbitMQ');
    return connection;
  }

  public static build(config: RabbitMQConfig): DynamicModule {
    const logger = new Logger(RabbitMQModule.name);
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
        RabbitRpcParamsFactory,
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
        RabbitRpcParamsFactory,
      ],
      exports: [AmqpConnection],
    };
  }

  async onApplicationShutdown() {
    this.logger.verbose('Closing AMQP Connections');

    for (const connection of this.amqpConnections) {
      await connection.managedConnection.close();
    }
  }

  public async onApplicationBootstrap() {
    for (const connection of this.amqpConnections) {
      if (!connection.configuration.registerHandlers) {
        this.logger.log(
          'Skipping RabbitMQ Handlers due to configuration. This application instance will not receive messages over RabbitMQ'
        );

        return;
      }

      this.logger.log('Initializing RabbitMQ Handlers');

      let rabbitMeta =
        await this.discover.providerMethodsWithMetaAtKey<RabbitHandlerConfig>(
          RABBIT_HANDLER
        );

      if (connection.configuration.enableControllerDiscovery) {
        this.logger.log(
          'Searching for RabbitMQ Handlers in Controllers. You can not use NestJS HTTP-Requests in these controllers!'
        );
        rabbitMeta = rabbitMeta.concat(
          await this.discover.controllerMethodsWithMetaAtKey<RabbitHandlerConfig>(
            RABBIT_HANDLER
          )
        );
      }

      const grouped = groupBy(
        rabbitMeta,
        (x) => x.discoveredMethod.parentClass.name
      );

      const providerKeys = Object.keys(grouped);

      for (const key of providerKeys) {
        this.logger.log(`Registering rabbitmq handlers from ${key}`);
        await Promise.all(
          grouped[key].map(async ({ discoveredMethod, meta: config }) => {
            if (
              config.connection &&
              config.connection !== connection.configuration.name
            ) {
              return;
            }

            const handler = this.externalContextCreator.create(
              discoveredMethod.parentClass.instance,
              discoveredMethod.handler,
              discoveredMethod.methodName,
              RABBIT_ARGS_METADATA,
              this.rpcParamsFactory,
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
              !connection.configuration.enableDirectReplyTo
            ) {
              this.logger.warn(
                `Direct Reply-To Functionality is disabled. RPC handler ${handlerDisplayName} will not be registered`
              );
              return;
            }

            this.logger.log(handlerDisplayName);

            return config.type === 'rpc'
              ? connection.createRpc(handler, config)
              : connection.createSubscriber(handler, config);
          })
        );
      }
    }
  }
}
