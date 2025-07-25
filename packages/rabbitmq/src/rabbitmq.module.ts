import {
  DiscoveredMethod,
  DiscoveryModule,
  DiscoveryService,
} from '@golevelup/nestjs-discovery';
import {
  DynamicModule,
  Module,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  LoggerService,
} from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { groupBy } from 'lodash';
import { AmqpConnection } from './amqp/connection';
import { AmqpConnectionManager } from './amqp/connectionManager';
import {
  validateRabbitMqUris,
  converUriConfigObjectsToUris,
} from './amqp/utils';
import { ConfigurableModuleClass } from './rabbitmq-module-definition';
import {
  RABBIT_CONFIG_TOKEN,
  RABBIT_CONTEXT_TYPE_KEY,
  RABBIT_HANDLER,
} from './rabbitmq.constants';
import { InjectRabbitMQConfig } from './rabbitmq.decorators';
import { RabbitRpcParamsFactory } from './rabbitmq.factory';
import { RabbitHandlerConfig, RabbitMQConfig } from './rabbitmq.interfaces';

@Module({
  imports: [DiscoveryModule],
  providers: [
    {
      provide: AmqpConnectionManager,
      useFactory: async (
        config: RabbitMQConfig,
      ): Promise<AmqpConnectionManager> => {
        await RabbitMQModule.AmqpConnectionFactory(config);
        return RabbitMQModule.connectionManager;
      },
      inject: [RABBIT_CONFIG_TOKEN],
    },
    {
      provide: AmqpConnection,
      useFactory: async (
        config: RabbitMQConfig,
        connectionManager: AmqpConnectionManager,
      ): Promise<AmqpConnection> => {
        return connectionManager.getConnection(
          config?.name || 'default',
        ) as AmqpConnection;
      },
      inject: [RABBIT_CONFIG_TOKEN, AmqpConnectionManager],
    },
    RabbitRpcParamsFactory,
  ],
  exports: [AmqpConnectionManager, AmqpConnection],
})
export class RabbitMQModule
  extends ConfigurableModuleClass
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger: LoggerService;

  private static connectionManager = new AmqpConnectionManager();
  private static bootstrapped = false;

  constructor(
    private readonly discover: DiscoveryService,
    private readonly externalContextCreator: ExternalContextCreator,
    private readonly rpcParamsFactory: RabbitRpcParamsFactory,
    private readonly connectionManager: AmqpConnectionManager,
    @InjectRabbitMQConfig() config: RabbitMQConfig,
  ) {
    super();
    this.logger = config?.logger || new Logger(RabbitMQModule.name);
  }

  static async AmqpConnectionFactory(
    config: RabbitMQConfig,
  ): Promise<AmqpConnection | undefined> {
    const logger = config?.logger || new Logger(RabbitMQModule.name);
    if (config == undefined) {
      logger.log(
        'RabbitMQ config not provided, skipping connection initialization.',
      );
      return undefined;
    }

    config.uri = converUriConfigObjectsToUris(config.uri);
    validateRabbitMqUris(config.uri as string[]);

    const connection = new AmqpConnection(config);
    this.connectionManager.addConnection(connection);
    await connection.init();
    logger.log('Successfully connected to RabbitMQ');
    return connection;
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
    this.logger.verbose?.('Closing AMQP Connections');
    await this.connectionManager.close();

    this.connectionManager.clearConnections();
    RabbitMQModule.bootstrapped = false;
  }

  private async setupHandler(
    connection: AmqpConnection,
    discoveredMethod: DiscoveredMethod,
    config: RabbitHandlerConfig,
    handler: (...args: any[]) => Promise<any>,
  ) {
    const handlerDisplayName = `${discoveredMethod.parentClass.name}.${
      discoveredMethod.methodName
    } {${config.type}} -> ${
      config.queueOptions?.channel ? `${config.queueOptions.channel}::` : ''
    }${config.exchange}::${config.routingKey}::${config.queue || 'amqpgen'}`;

    if (
      config.type === 'rpc' &&
      !connection.configuration.enableDirectReplyTo
    ) {
      this.logger.warn(
        `Direct Reply-To Functionality is disabled. RPC handler ${handlerDisplayName} will not be registered`,
      );
      return;
    }

    this.logger.log(handlerDisplayName);

    switch (config.type) {
      case 'rpc':
        return connection.createRpc(handler, config);

      case 'subscribe':
        if (config.batchOptions) {
          return connection.createBatchSubscriber(
            handler,
            config,
            config?.queueOptions?.consumerOptions,
          );
        }

        return connection.createSubscriber(
          handler,
          config,
          discoveredMethod.methodName,
          config?.queueOptions?.consumerOptions,
        );

      default:
        throw new Error(
          `Unable to set up handler ${handlerDisplayName}. Unexpected handler type ${config.type}.`,
        );
    }
  }

  public async onApplicationBootstrap() {
    if (RabbitMQModule.bootstrapped) {
      return;
    }
    RabbitMQModule.bootstrapped = true;

    for (const connection of this.connectionManager.getConnections()) {
      if (!connection.configuration.registerHandlers) {
        this.logger.log(
          'Skipping RabbitMQ Handlers due to configuration. This application instance will not receive messages over RabbitMQ',
        );

        continue;
      }

      this.logger.log('Initializing RabbitMQ Handlers');

      let rabbitMeta =
        await this.discover.providerMethodsWithMetaAtKey<RabbitHandlerConfig>(
          RABBIT_HANDLER,
        );

      if (connection.configuration.enableControllerDiscovery) {
        this.logger.log(
          'Searching for RabbitMQ Handlers in Controllers. You can not use NestJS HTTP-Requests in these controllers!',
        );
        rabbitMeta = rabbitMeta.concat(
          await this.discover.controllerMethodsWithMetaAtKey<RabbitHandlerConfig>(
            RABBIT_HANDLER,
          ),
        );
      }

      const grouped = groupBy(
        rabbitMeta,
        (x) => x.discoveredMethod.parentClass.name,
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
              ROUTE_ARGS_METADATA,
              this.rpcParamsFactory,
              undefined, // contextId
              undefined, // inquirerId
              undefined, // options
              RABBIT_CONTEXT_TYPE_KEY, // contextType
            );

            const moduleHandlerConfigRaw =
              connection.configuration.handlers[
                config.name || connection.configuration.defaultHandler || ''
              ];

            const moduleHandlerConfigs = Array.isArray(moduleHandlerConfigRaw)
              ? moduleHandlerConfigRaw
              : [moduleHandlerConfigRaw];

            await Promise.all(
              moduleHandlerConfigs.map((moduleHandlerConfig) => {
                const mergedConfig = {
                  ...config,
                  ...moduleHandlerConfig,
                };

                return this.setupHandler(
                  connection,
                  discoveredMethod,
                  mergedConfig,
                  handler,
                );
              }),
            );
          }),
        );
      }
    }
  }
}
