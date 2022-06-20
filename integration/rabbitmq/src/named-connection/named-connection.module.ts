import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { CONNECTION_NAME } from './named-connection.constants';
import { NamedConnectionController } from './named-connection.controller';

const rabbitHost =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_HOST : 'localhost';
const rabbitPort =
  process.env.NODE_ENV === 'ci' ? process.env.RABBITMQ_PORT : '5672';
const uri = `amqp://rabbitmq:rabbitmq@${rabbitHost}:${rabbitPort}`;

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: () => ({
        name: CONNECTION_NAME,
        exchanges: [
          {
            name: 'exchange3',
            type: 'topic',
          },
        ],
        uri,
        connectionInitOptions: { wait: true, reject: true, timeout: 3000 },
      }),
    }),
  ],
  controllers: [NamedConnectionController],
  providers: [NamedConnectionController],
})
export class NamedConnectionModule {}
