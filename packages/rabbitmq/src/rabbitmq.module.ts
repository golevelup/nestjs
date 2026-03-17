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
import {
  MessageHandlerOptions,
  RabbitHandlerConfig,
  RabbitMQConfig,
  RabbitMQHandlers,
} from './rabbitmq.interfaces';

/**
 * Resolves the list of per-registration handler configs to apply for a given
 * handler.
 *
 * Rules:
 * - No lookup key → return `[undefined]` so the handler is registered using
 *   only the decorator config.
 * - Lookup key absent from `handlers` map → return `[]` to skip registration
 *   and avoid asserting random `amq.gen-*` queues.
 * - Lookup key present, value is an array → return the array as-is (zero or
 *   more registrations).
 * - Lookup key present, value is a single object → wrap in a single-element
 *   array.
 */
export function resolveHandlerConfigs(
  handlers: RabbitMQHandlers,
  lookupKey: string | undefined,
): (MessageHandlerOptions | undefined)[] {
  if (!lookupKey) {
    return [undefined];
  }
  if (!Object.prototype.hasOwnProperty.call(handlers, lookupKey)) {
    return [];
  }
  const raw = handlers[lookupKey];
  if (Array.isArray(raw)) {
    return raw;
  }
  return [raw];
}

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
          return connection.createBatchSubscriber(handler, config);
        }

        return connection.createSubscriber(
          handler,
          config,
          discoveredMethod.methodName,
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

            const originalHandler = discoveredMethod.handler;
            const instance = discoveredMethod.parentClass.instance;
            const boundHandler = originalHandler.bind(instance);

            // Copy all Reflect metadata from the original prototype method to
            // the bound function so that metadata-based features continue to
            // work correctly (e.g. isRabbitContext(), method-level interceptors,
            // guards and pipes whose metadata lives on the function object).
            for (const metaKey of Reflect.getMetadataKeys(originalHandler)) {
              Reflect.defineMetadata(
                metaKey,
                Reflect.getMetadata(metaKey, originalHandler),
                boundHandler,
              );
            }

            const handler = this.externalContextCreator.create(
              instance,
              boundHandler,
              discoveredMethod.methodName,
              ROUTE_ARGS_METADATA,
              this.rpcParamsFactory,
              undefined, // contextId
              undefined, // inquirerId
              undefined, // options
              RABBIT_CONTEXT_TYPE_KEY, // contextType
            );

            const handlerLookupKey =
              config.name || connection.configuration.defaultHandler;

            // When a handler name or defaultHandler is configured but no
            // matching entry exists in the handlers map, skip registration to
            // prevent random amq.gen-* queues from being asserted (consistent
            // with the behaviour of an explicitly empty array entry).
            const moduleHandlerConfigs = resolveHandlerConfigs(
              connection.configuration.handlers,
              handlerLookupKey,
            );

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
