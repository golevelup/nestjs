import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService } from '../../common/src';
import { AmqpConnection } from './amqp/AmqpConnection';
import { RABBIT_HANDLER } from './rabbitmq.constants';
import { RabbitMQConfig } from './rabbitmq.interfaces';

@Module({
  imports: [DiscoveryModule]
})
export class RabbitMQModule implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly amqpConnection: AmqpConnection
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
    console.log('rabbit module init');

    const rabbitMeta = this.discoveryService.discoverHandlersWithMeta(
      () => true,
      RABBIT_HANDLER
    );

    console.log('connection', this.amqpConnection);
    console.log(rabbitMeta);
  }
}
