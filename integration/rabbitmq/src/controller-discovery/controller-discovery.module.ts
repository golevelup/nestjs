import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ControllerDiscoveryController } from './controller-discovery.controller';
import { SubmoduleModule } from './submodule/submodule.module';

const rabbitHost =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
const rabbitPort =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: () => ({
        exchanges: [
          {
            name: 'exchange2',
            type: 'topic',
          },
        ],
        uri,
        connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
        enableControllerDiscovery: true,
      }),
    }),
    SubmoduleModule,
  ],
  controllers: [ControllerDiscoveryController],
  providers: [ControllerDiscoveryController],
})
export class ControllerDiscoveryModule {}
