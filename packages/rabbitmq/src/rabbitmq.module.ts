import { DiscoveryModule, DiscoveryService } from '@nestjs-plus/discovery';
import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { groupBy } from 'lodash';
import { AmqpConnection } from './amqp/AmqpConnection';
import { RABBIT_HANDLER } from './rabbitmq.constants';
import { RabbitHandlerConfig, RabbitMQConfig } from './rabbitmq.interfaces';

@Module({
  imports: [DiscoveryModule]
})
export class RabbitMQModule implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQModule.name);

  constructor(
    private readonly discover: DiscoveryService,
    private readonly amqpConnection: AmqpConnection,
    private readonly externalContextCreator: ExternalContextCreator
  ) {}

  public static build(config: RabbitMQConfig): DynamicModule {
    return {
      module: RabbitMQModule,
      providers: [
        {
          provide: AmqpConnection,
          useFactory: async (): Promise<AmqpConnection> => {
            const connection = new AmqpConnection(config);
            await connection.init();
            return connection;
          }
        }
      ],
      exports: [AmqpConnection]
    };
  }

  public async onModuleInit() {
    const rabbitMeta = this.discover.providerMethodsWithMetaAtKey<
      RabbitHandlerConfig
    >(RABBIT_HANDLER);

    const grouped = groupBy(
      rabbitMeta,
      x => x.discoveredMethod.parentClass.name
    );

    const providerKeys = Object.keys(grouped);
    for (const key of providerKeys) {
      this.logger.log(`Registering rabbitmq handlers from ${key}`);
      await Promise.all(
        grouped[key].map(async ({ discoveredMethod, meta }) => {
          const handler = this.externalContextCreator.create(
            discoveredMethod.parentClass.instance,
            discoveredMethod.handler,
            discoveredMethod.methodName
          );

          const { exchange, routingKey, queue } = meta;

          this.logger.log(
            `Attaching ${
              meta.type
            } handler on exchange ${exchange} and routingKey ${routingKey}`
          );

          return meta.type === 'rpc'
            ? this.amqpConnection.createRpc(handler, {
                exchange,
                routingKey,
                queue
              })
            : this.amqpConnection.createSubscriber(handler, {
                exchange,
                routingKey,
                queue
              });
        })
      );
    }
  }
}
